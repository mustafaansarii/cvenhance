package com.docservice.careerhub.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class SaveResumeBuilderDocumentRequest {

    @Size(max = 200, message = "name must be at most 200 characters")
    private String name;
    @NotNull(message = "sectionOrder is required")
    private JsonNode sectionOrder;

    @NotNull(message = "editorSettings is required")
    private JsonNode editorSettings;
}
