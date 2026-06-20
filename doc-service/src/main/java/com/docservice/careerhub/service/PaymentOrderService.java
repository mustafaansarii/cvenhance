package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.constants.PaymentOrderStatus;
import com.docservice.careerhub.dto.constants.Plan;
import com.docservice.careerhub.dto.response.MessageResponse;
import com.docservice.careerhub.entity.AuthUser;
import com.docservice.careerhub.entity.PaymentOrder;
import com.docservice.careerhub.entity.Subscription;
import com.docservice.careerhub.exception.ApiException;
import com.docservice.careerhub.payment.CreateOrderRequest;
import com.docservice.careerhub.payment.OrderResponse;
import com.docservice.careerhub.payment.PaymentService;
import com.docservice.careerhub.payment.VerifyResponse;
import com.docservice.careerhub.payment.WebhookVerifier;
import com.docservice.careerhub.repo.PaymentOrderRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.util.Objects;

@Service
public class PaymentOrderService {

    private static final Logger log = LoggerFactory.getLogger(PaymentOrderService.class);

    private static final String STATUS_PAID = "PAID";
    private static final String FALLBACK_PHONE = "9999999999";

    @Autowired
    private PaymentService paymentService;

    @Autowired
    private EntitlementService entitlementService;

    @Autowired
    private AuthService authService;

    @Autowired
    private PaymentOrderRepository paymentOrderRepository;

    @Autowired
    private WebhookVerifier webhookVerifier;

    @Autowired
    private ObjectMapper objectMapper;

    @Transactional
    public OrderResponse createOrder(String ownerEmail, String planId, String customerPhone) {
        Plan plan = parsePlan(planId);
        AuthUser user = authService.getActiveUser(ownerEmail);
        rejectNonUpgrade(ownerEmail, plan);

        OrderResponse order = placeOrder(plan, user, resolvePhone(customerPhone));
        savePendingOrder(ownerEmail, plan, order.orderId());
        return order;
    }

    @Transactional
    public VerifyResponse confirmAndGrant(String orderId) {
        VerifyResponse verification = paymentService.verifyOrder(orderId);
        if (isPaid(verification) && claimForGrant(orderId)) {
            grantPlanForOrder(orderId);
        }
        return verification;
    }

    @Transactional
    public MessageResponse handleWebhook(byte[] rawBody, String signature, String timestamp) {
        String body = new String(rawBody, StandardCharsets.UTF_8);
        if (!webhookVerifier.isValid(timestamp, body, signature)) {
            log.warn("Webhook rejected: invalid signature");
            throw ApiException.unauthorized("invalid signature");
        }
        processWebhook(body);
        return MessageResponse.of("ok");
    }

//-----------------------------------private methods-----------------------------------

    private void processWebhook(String rawBody) {
        String orderId = extractOrderId(rawBody);
        if (Objects.isNull(orderId)) {
            log.warn("Webhook received with no order_id in payload");
            return;
        }
        log.info("Webhook received for order {} — confirming with Cashfree", orderId);
        try {
            VerifyResponse verification = confirmAndGrant(orderId);
            log.info("Webhook processed for order {} — Cashfree status {}", orderId, verification.orderStatus());
        } catch (Exception e) {
            log.warn("Webhook for order {} could not be confirmed: {}", orderId, e.getMessage());
        }
    }

    private OrderResponse placeOrder(Plan plan, AuthUser user, String phone) {
        return paymentService.createOrder(
                new CreateOrderRequest(plan.getPriceInr(), user.getFullName(), user.getEmail(), phone));
    }

    private void savePendingOrder(String ownerEmail, Plan plan, String orderId) {
        PaymentOrder order = new PaymentOrder();
        order.setOrderId(orderId);
        order.setOwnerEmail(ownerEmail);
        order.setPlan(plan);
        order.setAmount(plan.getPriceInr());
        order.setStatus(PaymentOrderStatus.CREATED);
        paymentOrderRepository.save(order);
    }

    private String resolvePhone(String customerPhone) {
        return (Objects.isNull(customerPhone) || customerPhone.isBlank()) ? FALLBACK_PHONE : customerPhone;
    }

    /** Atomically claims the order for granting (CREATED → PAID); only the first concurrent caller wins. */
    private boolean claimForGrant(String orderId) {
        return paymentOrderRepository.markPaid(orderId, PaymentOrderStatus.PAID, PaymentOrderStatus.CREATED) == 1;
    }

    private void grantPlanForOrder(String orderId) {
        PaymentOrder order = paymentOrderRepository.findByOrderId(orderId).orElse(null);
        if (Objects.nonNull(order)) {
            entitlementService.grant(order.getOwnerEmail(), order.getPlan());
            log.info("Granted plan {} to {} for order {}", order.getPlan(), order.getOwnerEmail(), orderId);
        }
    }

    private Plan parsePlan(String planId) {
        if (Objects.isNull(planId) || planId.isBlank()) {
            throw ApiException.badData("planId is required");
        }
        try {
            return Plan.valueOf(planId.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw ApiException.badData("Unknown plan: " + planId);
        }
    }

    private void rejectNonUpgrade(String ownerEmail, Plan requested) {
        Subscription current = entitlementService.find(ownerEmail).orElse(null);
        if (entitlementService.isActive(current) && Objects.nonNull(current.getPlan())
                && requested.getLevel() <= current.getPlan().getLevel()) {
            throw ApiException.badData("You already have the " + current.getPlan().name()
                    + " plan — you can only upgrade to a higher plan.");
        }
    }

    private boolean isPaid(VerifyResponse verification) {
        return Objects.nonNull(verification) && STATUS_PAID.equalsIgnoreCase(verification.orderStatus());
    }

    private String extractOrderId(String rawBody) {
        try {
            JsonNode orderId = objectMapper.readTree(rawBody).path("data").path("order").path("order_id");
            String value = orderId.asText(null);
            return (Objects.isNull(value) || value.isBlank()) ? null : value;
        } catch (Exception e) {
            return null;
        }
    }
}
