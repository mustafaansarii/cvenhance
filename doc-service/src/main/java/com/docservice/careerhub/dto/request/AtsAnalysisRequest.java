package com.docservice.careerhub.dto.request;

import lombok.Data;

@Data
public class AtsAnalysisRequest {
    private String resumeText;
    private String targetRole;
}