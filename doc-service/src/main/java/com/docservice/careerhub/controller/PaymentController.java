package com.docservice.careerhub.controller;

import com.docservice.careerhub.dto.request.CreateOrderRequest;
import com.docservice.careerhub.dto.request.VerifyOrderRequest;
import com.docservice.careerhub.dto.response.CreateOrderResponse;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.dto.response.VerifyOrderResponse;
import com.docservice.careerhub.dtoApi.PaymentDtoApi;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestHeader;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    @Autowired
    private PaymentDtoApi paymentDtoApi;

    @PostMapping("/create-order")
    public CreateOrderResponse createOrder(Authentication authentication, @RequestBody CreateOrderRequest request) {
        return paymentDtoApi.createOrder(authentication.getName(), request);
    }

    @PostMapping("/verify")
    public VerifyOrderResponse verify(@RequestBody VerifyOrderRequest request) {
        return paymentDtoApi.verify(request);
    }

    @PostMapping("/webhook")
    public MessageResponse webhook(@RequestBody byte[] rawBody,
                                   @RequestHeader(value = "x-webhook-signature", required = false) String signature,
                                   @RequestHeader(value = "x-webhook-timestamp", required = false) String timestamp) {
        return paymentDtoApi.handleWebhook(rawBody, signature, timestamp);
    }
}
