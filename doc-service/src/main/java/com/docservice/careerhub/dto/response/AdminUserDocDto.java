package com.docservice.careerhub.dto.response;

import com.docservice.careerhub.dto.constants.DocTemplateStatus;
import com.docservice.careerhub.dto.constants.DocType;
import com.docservice.careerhub.dto.constants.SubscriptionType;
import lombok.Builder;
import lombok.Data;

import java.time.Instant;

@Data
@Builder
public class AdminUserDocDto {
    private Long id;
    private String ownerEmail;
    private String templateCode;
    private String name;
    private DocType type;
    private SubscriptionType subscriptionType;
    private DocTemplateStatus status;
    private String pdfUrl;
    private String imageUrl;
    private Instant createdAt;
    private Instant updatedAt;
}
