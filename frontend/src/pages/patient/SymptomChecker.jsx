import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '../../context/LanguageContext';
import api from '../../services/api';
import {
  Brain,
  Mic,
  MicOff,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Info,
  Volume2,
  VolumeX,
  Languages
} from 'lucide-react';

export default function SymptomChecker() {
  const { lang, t } = useLanguage();
  const navigate = useNavigate();

  const [symptoms, setSymptoms] = useState('');
  const [durationDays, setDurationDays] = useState(2);
  const [age, setAge] = useState(35);
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [speechSupported, setSpeechSupported] = useState(true);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  // Voice Summary (Text-to-Speech) State
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingLanguage, setSpeakingLanguage] = useState(null); // 'ta' | 'en'

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setSpeechSupported(false);
    }

    // Cleanup speech synthesis on unmount
    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('voiceNotSupported'));
      return;
    }

    if (isListening) {
      setIsListening(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      // Use Tamil if language is set to 'ta', otherwise English
      recognition.lang = lang === 'ta' ? 'ta-IN' : 'en-IN';

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        setSymptoms((prev) => (prev ? `${prev}, ${transcript}` : transcript));
        setIsListening(false);
      };

      recognition.onerror = (e) => {
        console.warn('Speech recognition error:', e.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      setError(lang === 'ta' ? 'தயவுசெய்து ஏதேனும் ஓர் அறிகுறியை உள்ளிடவும்.' : 'Please provide at least one symptom.');
      return;
    }
    setError('');
    setLoading(true);
    setResult(null);
    stopSpeaking();

    try {
      const response = await api.post('/symptoms/analyze', {
        symptoms,
        durationDays: parseInt(durationDays, 10),
        age: parseInt(age, 10),
        additionalInfo
      });
      setResult(response.data);
    } catch (err) {
      setError(err.response?.data?.message || (lang === 'ta' ? 'அறிகுறிகளை ஆய்வு செய்ய இயலவில்லை. மீண்டும் முயற்சிக்கவும்.' : 'Could not analyze symptoms. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  // Text-To-Speech (Voice Summary) Implementation
  const speakSummary = (targetLang) => {
    if (!('speechSynthesis' in window)) {
      alert(lang === 'ta' ? 'உங்கள் உலாவியில் குரல் வழி வாசிப்பு வசதி இல்லை.' : 'Text-to-speech audio is not supported in this browser.');
      return;
    }

    // Cancel any active speech
    window.speechSynthesis.cancel();

    // Prepare speech text according to target language
    let textToSpeak = '';
    if (targetLang === 'ta') {
      const summaryText = result.summaryTa || result.summary;
      const conditions = (result.possibleConditionsTa && result.possibleConditionsTa.length > 0)
        ? `சாத்தியமான உடல்நிலைகள்: ${result.possibleConditionsTa.join(', ')}.`
        : '';
      const nextStep = result.suggestedNextStepTa || result.suggestedNextStep;
      textToSpeak = `${result.disclaimerTa || result.disclaimer}. ${summaryText}. ${conditions}. அடுத்த கட்ட நடவடிக்கை: ${nextStep}`;
    } else {
      const summaryText = result.summary;
      const conditions = (result.possibleConditions && result.possibleConditions.length > 0)
        ? `Possible conditions to discuss: ${result.possibleConditions.join(', ')}.`
        : '';
      const nextStep = result.suggestedNextStep;
      textToSpeak = `${result.disclaimer}. ${summaryText}. ${conditions}. Suggested next step: ${nextStep}`;
    }

    const utterance = new SpeechSynthesisUtterance(textToSpeak);
    utterance.lang = targetLang === 'ta' ? 'ta-IN' : 'en-IN';
    utterance.rate = 0.95; // Slightly slower for clear rural comprehension
    utterance.pitch = 1.0;

    // Try finding specific voice for target language
    const voices = window.speechSynthesis.getVoices();
    const matchedVoice = voices.find(v => v.lang.startsWith(targetLang));
    if (matchedVoice) {
      utterance.voice = matchedVoice;
    }

    utterance.onstart = () => {
      setIsSpeaking(true);
      setSpeakingLanguage(targetLang);
    };

    utterance.onend = () => {
      setIsSpeaking(false);
      setSpeakingLanguage(null);
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis error:', e);
      setIsSpeaking(false);
      setSpeakingLanguage(null);
    };

    window.speechSynthesis.speak(utterance);
  };

  const stopSpeaking = () => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingLanguage(null);
  };

  const getUrgencyBadge = (urgency) => {
    switch (urgency) {
      case 'URGENT':
        return <span className="badge badge-danger" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>{t('urgency_urgent')}</span>;
      case 'MODERATE':
        return <span className="badge badge-warning" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>{t('urgency_moderate')}</span>;
      default:
        return <span className="badge badge-success" style={{ fontSize: '0.85rem', padding: '0.35rem 0.75rem' }}>{t('urgency_normal')}</span>;
    }
  };

  // Determine current active display summary based on language
  const displaySummary = lang === 'ta' ? (result?.summaryTa || result?.summary) : result?.summary;
  const displayDisclaimer = lang === 'ta' ? (result?.disclaimerTa || result?.disclaimer) : result?.disclaimer;
  const displayConditions = lang === 'ta' ? (result?.possibleConditionsTa || result?.possibleConditions) : result?.possibleConditions;
  const displaySuggestions = lang === 'ta' ? (result?.suggestionsTa || result?.suggestions) : result?.suggestions;
  const displayNextStep = lang === 'ta' ? (result?.suggestedNextStepTa || result?.suggestedNextStep) : result?.suggestedNextStep;

  return (
    <div>
      <div style={{ marginBottom: '1.25rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <Brain size={26} color="var(--primary)" />
          {t('symptomCheckerTitle')}
        </h1>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
          {t('symptomCheckerSubtitle')}
        </p>
      </div>

      {/* Prominent Educational Disclaimer */}
      <div className="alert-box alert-info">
        <Info size={20} style={{ flexShrink: 0, marginTop: '2px' }} />
        <div style={{ fontSize: '0.85rem' }}>
          <strong>Notice: </strong>
          {t('aiDisclaimer')}
        </div>
      </div>

      {error && (
        <div className="alert-box alert-danger">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid-2">
        {/* Symptom Input Form */}
        <div className="card">
          <form onSubmit={handleAnalyze}>
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.375rem' }}>
                <label className="form-label" style={{ marginBottom: 0 }}>
                  {lang === 'ta' ? 'உங்கள் அறிகுறிகளை உள்ளிடவும்' : 'Enter Your Symptoms'}
                </label>
                {/* Voice input button */}
                <button
                  type="button"
                  onClick={toggleVoiceInput}
                  className={`btn btn-sm ${isListening ? 'btn-danger' : 'btn-secondary'}`}
                  title={t('voiceInputStart')}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}
                >
                  {isListening ? <MicOff size={14} /> : <Mic size={14} />}
                  <span>{isListening ? t('voiceInputStop') : t('voiceInputStart')}</span>
                </button>
              </div>

              <textarea
                className="form-textarea"
                rows="4"
                required
                placeholder={t('symptomPlaceholder')}
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
              />
              {isListening && (
                <div style={{ fontSize: '0.75rem', color: 'var(--danger)', marginTop: '0.25rem', fontWeight: 500 }}>
                  ● {lang === 'ta' ? 'கேட்கிறது... தமிழில் அல்லது ஆங்கிலத்தில் பேசவும்' : 'Listening... Speak clearly in Tamil or English'}
                </div>
              )}
            </div>

            <div className="grid-2" style={{ gap: '0.75rem' }}>
              <div className="form-group">
                <label className="form-label">{t('durationLabel')}</label>
                <input
                  type="number"
                  min="1"
                  max="60"
                  className="form-input"
                  value={durationDays}
                  onChange={(e) => setDurationDays(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">{t('ageLabel')}</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  className="form-input"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">{t('additionalNotes')}</label>
              <input
                type="text"
                className="form-input"
                placeholder={lang === 'ta' ? 'எ.கா: சர்க்கரை நோய், இரத்த அழுத்தம், மாத்திரைகள்' : 'e.g. Diabetic, high blood pressure, taking daily medications'}
                value={additionalInfo}
                onChange={(e) => setAdditionalInfo(e.target.value)}
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading || isListening}
            >
              <Brain size={16} />
              <span>{loading ? t('loading') : t('analyzeBtn')}</span>
            </button>
          </form>
        </div>

        {/* AI Analysis Result Display */}
        <div>
          {result ? (
            <div className="card" style={{ borderColor: 'var(--primary)' }}>
              <div className="card-header">
                <span className="card-title">
                  <CheckCircle2 size={20} color="var(--success)" />
                  {lang === 'ta' ? 'பகுப்பாய்வு சுருக்கம்' : 'Analysis Summary'}
                </span>
                {getUrgencyBadge(result.urgencyLevel)}
              </div>

              {/* Bilingual Voice Summary (Read Aloud) Toolbar */}
              <div style={{
                backgroundColor: '#f1f5f9',
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
                marginBottom: '1rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Volume2 size={16} color="var(--primary)" />
                  <span>{t('voiceSummaryTitle')}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className={`btn btn-sm ${isSpeaking && speakingLanguage === 'ta' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => speakSummary('ta')}
                  >
                    <span>{t('listenTamil')}</span>
                  </button>

                  <button
                    type="button"
                    className={`btn btn-sm ${isSpeaking && speakingLanguage === 'en' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => speakSummary('en')}
                  >
                    <span>{t('listenEnglish')}</span>
                  </button>

                  {isSpeaking && (
                    <button
                      type="button"
                      className="btn btn-sm btn-danger"
                      onClick={stopSpeaking}
                    >
                      <VolumeX size={14} />
                      <span>{t('stopVoice')}</span>
                    </button>
                  )}
                </div>

                {isSpeaking && (
                  <div style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.35rem', fontWeight: 600 }}>
                    ● {speakingLanguage === 'ta' ? t('speakingInTamil') : t('speakingInEnglish')}
                  </div>
                )}
              </div>

              {/* Informational Disclaimer Banner */}
              <div style={{
                backgroundColor: '#fffbeb',
                border: '1px solid #fef3c7',
                borderRadius: 'var(--radius)',
                padding: '0.75rem',
                fontSize: '0.8rem',
                color: '#92400e',
                marginBottom: '1rem'
              }}>
                <strong>{lang === 'ta' ? 'பொறுப்புத் துறப்பு: ' : 'Disclaimer: '}</strong>
                {displayDisclaimer}
              </div>

              {/* Possible Conditions to discuss */}
              {displayConditions && displayConditions.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    {t('topicsToDiscuss')}
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-main)' }}>
                    {displayConditions.map((cond, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{cond}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* General Care Guidance */}
              {displaySuggestions && displaySuggestions.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)', marginBottom: '0.4rem' }}>
                    {t('generalGuidance')}
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                    {displaySuggestions.map((sug, idx) => (
                      <li key={idx} style={{ marginBottom: '0.2rem' }}>{sug}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Next Step / Action */}
              <div style={{
                backgroundColor: '#f0f9ff',
                border: '1px solid #e0f2fe',
                borderRadius: 'var(--radius)',
                padding: '0.85rem',
                marginBottom: '1.25rem'
              }}>
                <div style={{ fontSize: '0.8rem', fontWeight: 600, color: '#0369a1', marginBottom: '0.2rem' }}>
                  {t('suggestedNextAction')}
                </div>
                <div style={{ fontSize: '0.875rem', color: '#0c4a6e' }}>
                  {displayNextStep}
                </div>
              </div>

              {/* Action Button: Book consultation with these symptoms */}
              <button
                type="button"
                className="btn btn-primary"
                style={{ width: '100%' }}
                onClick={() => navigate('/patient/book', { state: { prefilledSymptoms: symptoms } })}
              >
                <span>{t('consultWithThisInfo')}</span>
                <ArrowRight size={16} />
              </button>
            </div>
          ) : (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1.5rem', color: 'var(--text-muted)' }}>
              <Brain size={44} style={{ opacity: 0.3, margin: '0 auto 0.75rem' }} />
              <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '0.35rem' }}>
                {t('awaitingSymptoms')}
              </div>
              <p style={{ fontSize: '0.85rem', maxWidth: '300px', margin: '0 auto' }}>
                {t('awaitingSymptomsDesc')}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
