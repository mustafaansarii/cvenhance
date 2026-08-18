package com.docservice.careerhub.dto.ai;

import java.util.List;

public record ResumeCheckResult(int overallScore, List<Category> categories) {

    public record Category(String key, String label, int score, String status, String summary,
                           List<Finding> findings) {
    }

    public record Finding(String severity, String phrase, String issue, String suggestion) {
    }
}
