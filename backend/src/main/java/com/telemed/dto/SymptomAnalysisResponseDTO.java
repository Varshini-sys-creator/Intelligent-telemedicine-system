package com.telemed.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SymptomAnalysisResponseDTO {
    private String disclaimer;
    private String disclaimerTa;
    
    private String summary;
    private String summaryTa;
    
    private List<String> possibleConditions;
    private List<String> possibleConditionsTa;
    
    private List<String> suggestions;
    private List<String> suggestionsTa;
    
    private String urgencyLevel; // NORMAL, MODERATE, URGENT
    private String suggestedNextStep;
    private String suggestedNextStepTa;
}
