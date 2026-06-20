package com.docservice.careerhub.payment;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import java.security.SecureRandom;
import java.util.HexFormat;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.function.Function;


@Service
public class PaymentService {

    private static final Logger logger = LoggerFactory.getLogger(PaymentService.class);

    private final SecureRandom random = new SecureRandom();
    private volatile RestClient restClient;

    @Value("${cashfree.app.id:}")
    private String appId;

    @Value("${cashfree.secret.key:}")
    private String secretKey;

    @Value("${cashfree.environment:PRODUCTION}")
    private String environment;

    @Value("${cashfree.api-version:2023-08-01}")
    private String apiVersion;

    @Value("${cashfree.return-url:https://www.careerhubs.info/payment/status?order_id={order_id}}")
    private String returnUrl;

    public OrderResponse createOrder(CreateOrderRequest request) {
        validate(request);
        String orderId = generateOrderId();
        Map<?, ?> response = exchange("Order creation",
                client -> client.post().uri("/orders").body(buildOrderPayload(request, orderId)).retrieve().body(Map.class));
        return toOrderResponse(response);
    }

    public VerifyResponse verifyOrder(String orderId) {
        if (isBlank(orderId)) {
            throw new PaymentException("Order ID is required");
        }
        Map<?, ?> order = exchange("Order verification",
                client -> client.get().uri("/orders/{id}", orderId).retrieve().body(Map.class));
        String orderStatus = asString(order.get("order_status"));
        PaymentInfo payment = fetchFirstPayment(orderId);
        return new VerifyResponse(orderId, orderStatus, payment.method(), payment.amount());
    }

    // ── private helpers ─────────────────────────────────────────────────

    /** Runs one Cashfree call, guarantees a non-null body, and wraps any failure as a PaymentException. */
    private Map<?, ?> exchange(String action, Function<RestClient, Map> call) {
        try {
            Map<?, ?> body = call.apply(cashfreeClient());
            if (Objects.isNull(body)) {
                throw new PaymentException(action + " failed: empty response from Cashfree");
            }
            return body;
        } catch (PaymentException e) {
            throw e;
        } catch (Exception e) {
            throw new PaymentException(action + " failed: " + e.getMessage(), e);
        }
    }

    private PaymentInfo fetchFirstPayment(String orderId) {
        try {
            List<?> payments = cashfreeClient().get().uri("/orders/{id}/payments", orderId).retrieve().body(List.class);
            if (Objects.nonNull(payments) && !payments.isEmpty() && payments.get(0) instanceof Map<?, ?> firstPayment) {
                return new PaymentInfo(asString(firstPayment.get("payment_method")), asDouble(firstPayment.get("payment_amount")));
            }
        } catch (Exception e) {
            logger.warn("Failed to fetch/parse Cashfree payment details: {}", e.getMessage());
        }
        return new PaymentInfo(null, null);
    }

    /** Lazily builds and caches the Cashfree HTTP client, failing fast if credentials are missing. */
    private RestClient cashfreeClient() {
        if (isBlank(appId) || isBlank(secretKey)) {
            throw new PaymentException("Cashfree credentials are not configured");
        }
        RestClient client = restClient;
        if (Objects.isNull(client)) {
            String baseUrl = "SANDBOX".equalsIgnoreCase(environment)
                    ? "https://sandbox.cashfree.com/pg"
                    : "https://api.cashfree.com/pg";
            client = restClient = RestClient.builder()
                    .baseUrl(baseUrl)
                    .defaultHeader("x-client-id", appId)
                    .defaultHeader("x-client-secret", secretKey)
                    .defaultHeader("x-api-version", apiVersion)
                    .defaultHeader("Content-Type", "application/json")
                    .defaultHeader("Accept", "application/json")
                    .build();
        }
        return client;
    }

    private Map<String, Object> buildOrderPayload(CreateOrderRequest request, String orderId) {
        Map<String, Object> customerDetails = Map.of(
                "customer_id", "CUST_" + orderId,
                "customer_name", request.customerName().trim(),
                "customer_email", request.customerEmail().trim(),
                "customer_phone", request.customerPhone().trim()
        );
        return Map.of(
                "order_id", orderId,
                "order_amount", request.amount(),
                "order_currency", "INR",
                "customer_details", customerDetails,
                "order_meta", Map.of("return_url", returnUrl)
        );
    }

    private OrderResponse toOrderResponse(Map<?, ?> response) {
        return new OrderResponse(
                asString(response.get("order_id")),
                asDouble(response.get("order_amount")),
                asString(response.get("order_currency")),
                asString(response.get("payment_session_id")),
                asString(response.get("order_status"))
        );
    }

    private void validate(CreateOrderRequest request) {
        if (Objects.isNull(request) || Objects.isNull(request.amount())
                || isBlank(request.customerName()) || isBlank(request.customerEmail()) || isBlank(request.customerPhone())) {
            throw new PaymentException("amount, customerName, customerEmail and customerPhone are required");
        }
        if (request.amount() <= 0) {
            throw new PaymentException("Invalid amount");
        }
    }

    private String generateOrderId() {
        byte[] bytes = new byte[6];
        random.nextBytes(bytes);
        return HexFormat.of().formatHex(bytes);
    }

    private static boolean isBlank(String value) {
        return Objects.isNull(value) || value.isBlank();
    }

    private static String asString(Object value) {
        return Objects.isNull(value) ? null : value.toString();
    }

    private static Double asDouble(Object value) {
        if (value instanceof Number number) {
            return number.doubleValue();
        }
        if (Objects.isNull(value)) {
            return null;
        }
        try {
            return Double.valueOf(value.toString());
        } catch (NumberFormatException e) {
            return null;
        }
    }

    private record PaymentInfo(String method, Double amount) {
    }
}
