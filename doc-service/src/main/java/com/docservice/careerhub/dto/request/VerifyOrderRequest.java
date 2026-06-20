package com.docservice.careerhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class VerifyOrderRequest {

    @NotBlank(message = "orderId is required")
    private String orderId;
}
