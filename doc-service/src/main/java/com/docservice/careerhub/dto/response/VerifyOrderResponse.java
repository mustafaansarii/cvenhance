package com.docservice.careerhub.dto.response;

/** Result of confirming an order's payment status with Cashfree. */
public record VerifyOrderResponse(
        String orderId,
        String orderStatus,
        String paymentMethod,
        Double paymentAmount
) {
}
