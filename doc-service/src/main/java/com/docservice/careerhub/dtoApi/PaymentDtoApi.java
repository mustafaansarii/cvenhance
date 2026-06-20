package com.docservice.careerhub.dtoApi;

import com.docservice.careerhub.dto.request.CreateOrderRequest;
import com.docservice.careerhub.dto.request.VerifyOrderRequest;
import com.docservice.careerhub.dto.response.CreateOrderResponse;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.dto.response.VerifyOrderResponse;
import com.docservice.careerhub.payment.OrderResponse;
import com.docservice.careerhub.payment.VerifyResponse;
import com.docservice.careerhub.service.PaymentOrderService;
import com.docservice.careerhub.util.AbstractDtoUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

@Component
public class PaymentDtoApi extends AbstractDtoUtil {

    @Autowired
    private PaymentOrderService paymentOrderService;

    public CreateOrderResponse createOrder(String ownerEmail, CreateOrderRequest request) {
        validate(request);
        OrderResponse order = paymentOrderService.createOrder(ownerEmail, request.getPlanId(), request.getCustomerPhone());
        return toCreateOrderResponse(order);
    }

    public VerifyOrderResponse verify(VerifyOrderRequest request) {
        validate(request);
        VerifyResponse verification = paymentOrderService.confirmAndGrant(request.getOrderId());
        return toVerifyOrderResponse(verification);
    }

    public MessageResponse handleWebhook(byte[] rawBody, String signature, String timestamp) {
        return paymentOrderService.handleWebhook(rawBody, signature, timestamp);
    }

//-----------------------------------private methods-----------------------------------

    private CreateOrderResponse toCreateOrderResponse(OrderResponse order) {
        return new CreateOrderResponse(order.orderId(), order.orderAmount(), order.orderCurrency(),
                order.paymentSessionId(), order.orderStatus());
    }

    private VerifyOrderResponse toVerifyOrderResponse(VerifyResponse verification) {
        return new VerifyOrderResponse(verification.orderId(), verification.orderStatus(),
                verification.paymentMethod(), verification.paymentAmount());
    }
}
