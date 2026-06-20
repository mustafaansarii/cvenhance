package com.docservice.careerhub.dto.response;

/** Returned after creating a Cashfree order; the client checks out with {@code paymentSessionId}. */
public record CreateOrderResponse(
        String orderId,
        Double orderAmount,
        String orderCurrency,
        String paymentSessionId,
        String orderStatus
) {
}
