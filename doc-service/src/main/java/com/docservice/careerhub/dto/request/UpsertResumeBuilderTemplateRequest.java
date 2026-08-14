package com.docservice.careerhub.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class UpsertResumeBuilderTemplateRequest {

    @NotBlank(message = "templateCode is required")
    private String templateCode;

    @NotBlank(message = "name is required")
    private String name;

    @Size(max = 1000, message = "description must be at most 1000 characters")
    private String description;

    private String imageUrl;

    private Boolean active;

    @NotNull(message = "config is required")
    private JsonNode config;
}
