package com.docservice.careerhub.dto.request;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.SubscriptionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminDocTemplateUpdate {

    @NotNull(message = "id is required")
    private Long id;

    // Only non-null fields are applied.
    private String name;
    private String description;
    private DocTemplateStatus status;
    private SubscriptionType subscriptionType;
}
