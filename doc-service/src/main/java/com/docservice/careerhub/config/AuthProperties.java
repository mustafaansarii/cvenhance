package com.docservice.careerhub.config;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

/** Binds {@code auth.*} settings — JWT signing/expiry and the auth cookie attributes. */
@Data
@Component
@ConfigurationProperties(prefix = "auth")
public class AuthProperties {

    private Jwt jwt = new Jwt();
    private Cookie cookie = new Cookie();

    @Data
    public static class Jwt {
        /** HS256 secret (>= 32 chars). Supplied via env; no insecure default. */
        private String secret = "";
        private long expiryMs = 604800000L; // 7 days
    }

    @Data
    public static class Cookie {
        private String name = "ACCESS_TOKEN";
        private boolean secure = false;
        private String sameSite = "Lax";
        private String path = "/";
    }
}
