package com.telemed.service;

import com.telemed.dto.SymptomAnalysisRequestDTO;
import com.telemed.dto.SymptomAnalysisResponseDTO;
import com.telemed.entity.Patient;
import com.telemed.entity.SymptomAssessment;
import com.telemed.exception.ApiException;
import com.telemed.repository.PatientRepository;
import com.telemed.repository.SymptomAssessmentRepository;
import com.telemed.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;

import java.util.*;

/**
 * Symptom analysis service.
 *
 * Two modes:
 * 1. If a Gemini API key is configured, it sends the symptom data to Gemini
 *    and returns the AI-assisted informational response.
 * 2. If no key is configured (default for development), it uses a simple local
 *    rule-based engine that covers common symptom patterns.
 *
 * IMPORTANT: Both modes always include a medical disclaimer.
 * This system does NOT provide medical diagnosis.
 */
@Service
public class SymptomAnalysisService {

    private static final Logger logger = LoggerFactory.getLogger(SymptomAnalysisService.class);

    @Value("${telemed.gemini.apiKey:}")
    private String geminiApiKey;

    @Value("${telemed.gemini.apiUrl}")
    private String geminiApiUrl;

    @Autowired
    private SymptomAssessmentRepository symptomAssessmentRepository;

    @Autowired
    private PatientRepository patientRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public SymptomAnalysisResponseDTO analyze(String patientEmail, SymptomAnalysisRequestDTO request) {
        // Get patient profile
        var user = userRepository.findByEmail(patientEmail)
                .orElseThrow(() -> new ApiException("User not found", HttpStatus.NOT_FOUND));
        Patient patient = patientRepository.findByUserId(user.getId())
                .orElseThrow(() -> new ApiException("Patient profile not found", HttpStatus.NOT_FOUND));

        SymptomAnalysisResponseDTO response;

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            response = analyzeWithGemini(request);
        } else {
            response = analyzeWithLocalEngine(request);
        }

        // Save the assessment to the database
        try {
            String suggestionsJson = objectMapper.writeValueAsString(response);
            SymptomAssessment assessment = SymptomAssessment.builder()
                    .patient(patient)
                    .rawSymptoms(request.getSymptoms())
                    .durationDays(request.getDurationDays())
                    .aiSuggestionsJson(suggestionsJson)
                    .urgencyIndicator(response.getUrgencyLevel())
                    .build();
            symptomAssessmentRepository.save(assessment);
        } catch (Exception e) {
            logger.error("Could not save symptom assessment: {}", e.getMessage());
        }

        return response;
    }

    private SymptomAnalysisResponseDTO analyzeWithGemini(SymptomAnalysisRequestDTO request) {
        try {
            String prompt = buildGeminiPrompt(request);

            Map<String, Object> requestBody = Map.of(
                    "contents", List.of(Map.of(
                            "parts", List.of(Map.of("text", prompt))
                    ))
            );

            RestTemplate restTemplate = new RestTemplate();
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            String url = geminiApiUrl + "?key=" + geminiApiKey;
            HttpEntity<Map<String, Object>> httpRequest = new HttpEntity<>(requestBody, headers);
            ResponseEntity<Map> responseEntity = restTemplate.postForEntity(url, httpRequest, Map.class);

            if (responseEntity.getStatusCode().is2xxSuccessful() && responseEntity.getBody() != null) {
                String aiText = extractGeminiText(responseEntity.getBody());
                return parseGeminiResponse(aiText, request);
            }
        } catch (Exception e) {
            logger.warn("Gemini API call failed, falling back to local engine: {}", e.getMessage());
        }

        // Fallback if Gemini fails
        return analyzeWithLocalEngine(request);
    }

    @SuppressWarnings("unchecked")
    private String extractGeminiText(Map<?, ?> body) {
        try {
            List<?> candidates = (List<?>) body.get("candidates");
            Map<?, ?> firstCandidate = (Map<?, ?>) candidates.get(0);
            Map<?, ?> content = (Map<?, ?>) firstCandidate.get("content");
            List<?> parts = (List<?>) content.get("parts");
            Map<?, ?> firstPart = (Map<?, ?>) parts.get(0);
            return (String) firstPart.get("text");
        } catch (Exception e) {
            return "";
        }
    }

    private String buildGeminiPrompt(SymptomAnalysisRequestDTO request) {
        return """
                You are a medical information assistant helping patients in rural India understand their symptoms.
                
                A patient reports the following:
                - Symptoms: %s
                - Duration: %d days
                - Patient age: %s
                - Additional info: %s
                
                Please provide:
                1. A brief list of possible conditions these symptoms may be associated with (3-5 items)
                2. General self-care suggestions
                3. An urgency level: NORMAL, MODERATE, or URGENT
                4. When to seek immediate medical attention
                
                IMPORTANT: Start with this disclaimer: "This information is for general guidance only and is not a medical diagnosis."
                Be clear and simple. Avoid technical jargon. This is for patients with limited healthcare access.
                """.formatted(
                request.getSymptoms(),
                request.getDurationDays() != null ? request.getDurationDays() : 1,
                request.getAge() != null ? request.getAge().toString() : "not specified",
                request.getAdditionalInfo() != null ? request.getAdditionalInfo() : "none"
        );
    }

    private SymptomAnalysisResponseDTO parseGeminiResponse(String text, SymptomAnalysisRequestDTO request) {
        // Determine urgency from text content
        String urgency = "NORMAL";
        String lowerText = text.toLowerCase();
        if (lowerText.contains("urgent") || lowerText.contains("emergency") || lowerText.contains("immediately")) {
            urgency = "URGENT";
        } else if (lowerText.contains("moderate") || lowerText.contains("soon") || lowerText.contains("within")) {
            urgency = "MODERATE";
        }

        return SymptomAnalysisResponseDTO.builder()
                .disclaimer("This information is for general guidance only and is NOT a medical diagnosis. Please consult a qualified healthcare professional.")
                .summary(text)
                .urgencyLevel(urgency)
                .suggestedNextStep(urgency.equals("URGENT")
                        ? "Please seek immediate medical attention."
                        : "Consider booking a doctor consultation through this app.")
                .build();
    }

    /**
     * Local rule-based engine — works without any API key.
     * Covers common symptom patterns seen in rural/community health settings.
     */
    private SymptomAnalysisResponseDTO analyzeWithLocalEngine(SymptomAnalysisRequestDTO request) {
        String symptoms = request.getSymptoms().toLowerCase();
        List<String> possibleConditions = new ArrayList<>();
        String urgency = "NORMAL";
        List<String> suggestions = new ArrayList<>();
        String immediateAction = null;
        List<String> possibleConditionsTa = new ArrayList<>();
        List<String> suggestionsTa = new ArrayList<>();
        String immediateActionTa = null;

        // Respiratory symptoms
        if (containsAny(symptoms, "cough", "cold", "runny nose", "sore throat", "sneezing", "இருமல்", "சளி", "தொண்டை")) {
            possibleConditions.add("Common cold or upper respiratory infection");
            possibleConditionsTa.add("சாதாரண சளி அல்லது மேல் சுவாசப்பாதை தொற்று");
            suggestions.add("Rest and drink warm fluids");
            suggestionsTa.add("நன்கு ஓய்வு எடுத்து வெதுவெதுப்பான நீராகாரம் அருந்தவும்");
            suggestions.add("Avoid cold drinks and oily food");
            suggestionsTa.add("குளிர்ந்த பானங்கள் மற்றும் எண்ணெய் உணவுகளை தவிர்க்கவும்");
        }

        // Fever
        if (containsAny(symptoms, "fever", "high temperature", "chills", "body heat", "காய்ச்சல்", "வெப்பம்", "குளிர்")) {
            possibleConditions.add("Viral fever");
            possibleConditions.add("Bacterial infection");
            possibleConditionsTa.add("வைரஸ் காய்ச்சல் (Viral Fever)");
            possibleConditionsTa.add("பாக்டீரியா தொற்று");
            suggestions.add("Take paracetamol if fever is above 38°C (consult a pharmacist/doctor)");
            suggestionsTa.add("காய்ச்சல் அதிகமாக இருந்தால் தகுந்த ஆலோசனை பெற்று பாராசிட்டமால் எடுத்துக்கொள்ளவும்");
            suggestions.add("Stay hydrated — drink ORS or warm water if feeling weak");
            suggestionsTa.add("உடலில் நீர்ச்சத்தை பேண ORS அல்லது கொதிக்க வைத்த வெதுவெதுப்பான நீர் அருந்தவும்");
            if (request.getDurationDays() != null && request.getDurationDays() >= 5) {
                urgency = "MODERATE";
                suggestions.add("Fever lasting more than 5 days needs a doctor's attention");
                suggestionsTa.add("5 நாட்களுக்கு மேல் காய்ச்சல் நீடித்தால் கட்டாயம் மருத்துவரை அணுக வேண்டும்");
            }
        }

        // Gastrointestinal
        if (containsAny(symptoms, "vomiting", "diarrhea", "loose motion", "stomach pain", "nausea", "வாந்தி", "வயிற்று", "வயிறு")) {
            possibleConditions.add("Gastroenteritis (stomach infection)");
            possibleConditions.add("Food poisoning");
            possibleConditionsTa.add("இரைப்பை குடல் தொற்று (Gastroenteritis)");
            possibleConditionsTa.add("உணவு நச்சுத்தன்மை (Food poisoning)");
            suggestions.add("Drink ORS (oral rehydration solution) frequently");
            suggestionsTa.add("ORS உப்பு-சர்க்கரை கரைசலை அடிக்கடி பருகவும்");
            suggestions.add("Avoid solid food for a few hours; eat light when hunger returns");
            suggestionsTa.add("எளிதில் செரிக்கும் கஞ்சி அல்லது இளநீர் உட்கொள்ளவும்");
            if (containsAny(symptoms, "blood in stool", "severe pain", "ரத்தம்", "கடும் வலி")) {
                urgency = "URGENT";
                immediateAction = "Blood in stool or severe abdominal pain requires immediate medical attention.";
                immediateActionTa = "மலம் கழிப்பதில் ரத்தம் அல்லது தீவிர வயிற்று வலி இருந்தால் உடனடியாக அவசர மருத்துவ சிகிச்சை பெறவும்.";
            }
        }

        // Headache
        if (containsAny(symptoms, "headache", "head pain", "migraine", "தலைவலி")) {
            possibleConditions.add("Tension headache");
            possibleConditions.add("Dehydration");
            possibleConditions.add("Viral illness with headache");
            possibleConditionsTa.add("மன அழுத்தம் அல்லது நரம்பு தலைவலி (Tension headache)");
            possibleConditionsTa.add("உடல் நீர்ச்சத்து குறைவு (Dehydration)");
            possibleConditionsTa.add("காய்ச்சலுடன் கூடிய தலைவலி");
            suggestions.add("Rest in a quiet, dark room");
            suggestionsTa.add("அமைதியான காற்றோட்டமான அறையில் ஓய்வெடுக்கவும்");
            suggestions.add("Drink water — dehydration is a common cause");
            suggestionsTa.add("நிறைய குடிநீர் பருகவும்");
            if (containsAny(symptoms, "sudden severe", "worst headache", "stiff neck", "கழுத்து")) {
                urgency = "URGENT";
                immediateAction = "A sudden severe headache with stiff neck can indicate a serious condition. Seek emergency care immediately.";
                immediateActionTa = "திடீர் தீவிர தலைவலியும் கழுத்து இறுக்கமும் இருந்தால் உடனடியாக மருத்துவமனைக்கு செல்லவும்.";
            }
        }

        // Chest symptoms
        if (containsAny(symptoms, "chest pain", "chest tightness", "difficulty breathing", "shortness of breath", "மார்பு", "மூச்சு")) {
            urgency = "URGENT";
            possibleConditions.add("Possible cardiac or respiratory emergency");
            possibleConditionsTa.add("இதயம் அல்லது சுவாச மண்டல அவசர நிலை சாத்தியம்");
            immediateAction = "Chest pain and breathing difficulty can be serious. Please go to a hospital or call emergency services immediately.";
            immediateActionTa = "மார்பு வலி மற்றும் மூச்சுத்திணறல் ஆபத்தானதாக இருக்கலாம். உடனடியாக 108 அழைக்கவும் அல்லது மருத்துவமனைக்குச் செல்லவும்.";
        }

        // Joint/body pain
        if (containsAny(symptoms, "joint pain", "body ache", "muscle pain", "weakness", "உடல் வலி", "மூட்டு")) {
            possibleConditions.add("Viral fever with body ache");
            possibleConditions.add("Dengue fever (if accompanied by fever)");
            possibleConditionsTa.add("உடல் வலியுடன் கூடிய காய்ச்சல்");
            possibleConditionsTa.add("டெங்கு காய்ச்சல் சாத்தியம் (Dengue)");
            suggestions.add("Rest and avoid strenuous activity");
            suggestionsTa.add("கடினமான வேலைகளை தவிர்த்து முழு ஓய்வு எடுக்கவும்");
            if (containsAny(symptoms, "dengue", "rash", "bleeding", "தடிப்பு")) {
                urgency = "URGENT";
                immediateAction = "Possible dengue symptoms. Please see a doctor for a blood test.";
                immediateActionTa = "டெங்கு அறிகுறிகள் இருக்கலாம். இரத்தப் பரிசோதனைக்காக மருத்துவரை அணுகவும்.";
            }
        }

        // Default if nothing matched
        if (possibleConditions.isEmpty()) {
            possibleConditions.add("Unable to identify a specific pattern from the provided symptoms");
            possibleConditionsTa.add("குறிப்பிட்ட நோய்க்கான அறிகுறிகளை துல்லியமாக அடையாளம் காண இயலவில்லை");
            suggestions.add("Please consult a doctor who can properly examine you");
            suggestionsTa.add("முறையான பரிசோதனைக்கு மருத்துவரை அணுகவும்");
        }

        suggestions.add("These suggestions are general and cannot replace a doctor's examination");
        suggestionsTa.add("இவை பொதுவான தகவல்கள் மட்டுமே, மருத்துவரின் நேரடி பரிசோதனைக்கு மாற்றாகாது");

        String summary = "Based on the reported symptoms (" + request.getSymptoms() + "), "
                + "the following conditions may be relevant to discuss with your doctor: "
                + String.join(", ", possibleConditions) + ".\n\n"
                + "General suggestions:\n• " + String.join("\n• ", suggestions);

        String summaryTa = "நீங்கள் குறிப்பிட்ட அறிகுறிகளின் அடிப்படையில் (" + request.getSymptoms() + "), "
                + "மருத்துவரிடம் விவாதிக்கக்கூடிய சாத்தியமான உடல்நிலைகள்: "
                + String.join(", ", possibleConditionsTa) + ".\n\n"
                + "பொதுவான வழிகாட்டுதல்கள்:\n• " + String.join("\n• ", suggestionsTa);

        String nextStep = urgency.equals("URGENT")
                ? "Please seek medical attention as soon as possible."
                : "Consider booking a consultation with a doctor through this app for proper evaluation.";

        String nextStepTa = urgency.equals("URGENT")
                ? "தயவுசெய்து உடனடியாக மருத்துவ அவசர சிகிச்சையை நாடவும் அல்லது 108 அழைக்கவும்."
                : "சரியான நோயறிதலுக்கு இந்த செயலி மூலம் மருத்துவரை அணுகவும்.";

        return SymptomAnalysisResponseDTO.builder()
                .disclaimer("This information is for general guidance only and is NOT a medical diagnosis. Always consult a qualified healthcare professional for medical advice.")
                .disclaimerTa("மருத்துவ தகவல் அறிவிப்பு: இந்த தகவல் பொதுவான வழிகாட்டுதலுக்காக மட்டுமே, இது இறுதி மருத்துவ நோயறிதல் அல்ல. எப்போதும் தகுதியான மருத்துவரை அணுகவும்.")
                .summary(summary)
                .summaryTa(summaryTa)
                .possibleConditions(possibleConditions)
                .possibleConditionsTa(possibleConditionsTa)
                .suggestions(suggestions)
                .suggestionsTa(suggestionsTa)
                .urgencyLevel(urgency)
                .suggestedNextStep(immediateAction != null ? immediateAction : nextStep)
                .suggestedNextStepTa(immediateActionTa != null ? immediateActionTa : nextStepTa)
                .build();
    }

    private boolean containsAny(String text, String... keywords) {
        for (String keyword : keywords) {
            if (text.contains(keyword)) return true;
        }
        return false;
    }
}
