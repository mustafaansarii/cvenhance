package com.docservice.careerhub.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CreateOrderRequest {

    @NotBlank(message = "planId is required")
    private String planId;

    private String customerPhone;
}
