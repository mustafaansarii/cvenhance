package com.docservice.careerhub.dto.request;

import com.fasterxml.jackson.databind.JsonNode;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AssignResumeRequest {

    @NotBlank(message = "targetEmail is required")
    @Email(message = "targetEmail must be a valid email")
    private String targetEmail;

    @NotNull(message = "profileData is required")
    private JsonNode profileData;

    private String templateCode;
    private JsonNode sectionOrder;
    private JsonNode editorSettings;
}
