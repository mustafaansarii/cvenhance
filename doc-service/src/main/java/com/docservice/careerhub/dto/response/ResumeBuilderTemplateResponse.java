package com.docservice.careerhub.dto.response;

import com.fasterxml.jackson.databind.JsonNode;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class ResumeBuilderTemplateResponse {
    private Long id;
    private String templateCode;
    private String name;
    private String description;
    private String imageUrl;
    private boolean active;
    private int version;
    private JsonNode config;
    private Instant createdAt;
    private Instant updatedAt;
}
