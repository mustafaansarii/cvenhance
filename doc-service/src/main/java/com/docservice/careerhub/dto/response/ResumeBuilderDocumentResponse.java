package com.docservice.careerhub.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ResumeBuilderDocumentResponse {
    private Long id;
    private String templateCode;
    private int templateVersion;
    private String name;
    private JsonNode resumeData;
    private JsonNode sectionOrder;
    private JsonNode editorSettings;
    private boolean unlocked;
    private Instant createdAt;
    private Instant updatedAt;
}
