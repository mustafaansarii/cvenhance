package com.docservice.careerhub.dto.ai;

import java.util.List;


public record AtsAnalysisResult(
        int score,
        List<String> strengths,
        List<String> weaknesses,
        List<AtsSuggestion> suggestions
) {

    public record AtsSuggestion(
            String section,      // summary | header | skills | experience | projects | achievements | awards | languages | interests | publications | courses | certifications
            String action,       // replace | add
            String target,       // optional locator (e.g. header field name, company name, skill label)
            String originalText, // text to find when replacing
            String newText,      // replacement or new content
            String reason        // why this change improves ATS compatibility
    ) { }
}