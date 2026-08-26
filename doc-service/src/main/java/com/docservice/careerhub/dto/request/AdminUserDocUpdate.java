package com.docservice.careerhub.dto.request;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.SubscriptionType;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class AdminUserDocUpdate {

    @NotNull(message = "id is required")
    private Long id;

    // Only non-null fields are applied.
    private String name;
    private DocTemplateStatus status;
    private SubscriptionType subscriptionType;
}
