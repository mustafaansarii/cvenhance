package com.docservice.careerhub.dto.request;

import lombok.Data;

@Data
public class ResumeCheckRequest {
    private String resumeText;
    private String targetRole;
}
