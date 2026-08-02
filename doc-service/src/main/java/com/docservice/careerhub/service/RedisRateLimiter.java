package com.docservice.careerhub.service;

import com.docservice.careerhub.config.AppProperties;
import com.docservice.careerhub.exception.ApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.ParameterizedTypeReference;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

import java.time.LocalDate;
import java.time.ZoneOffset;
import java.util.List;
import java.util.Map;

@Service
public class RedisRateLimiter {

    private static final Logger LOGGER = LoggerFactory.getLogger(RedisRateLimiter.class);
    private static final int AI_DAILY_LIMIT = 30;
    private static final long DAY_TTL_SECONDS = 90_000;

    private final RestClient restClient = RestClient.create();

    @Autowired
    private AppProperties appProperties;

    public void checkDailyLimit(String email) {
        String key = "ai:assist:" + email + ":" + LocalDate.now(ZoneOffset.UTC);
        if (!allow(key, AI_DAILY_LIMIT, DAY_TTL_SECONDS)) {
            throw ApiException.tooManyRequests("You've reached today's AI limit. Please try again tomorrow.");
        }
    }

    public boolean allow(String key, int limit, long ttlSeconds) {
        String url = appProperties.getUpstashRedisRestUrl();
        String token = appProperties.getUpstashRedisRestToken();
        if (!StringUtils.hasText(url) || !StringUtils.hasText(token)) {
            return true;
        }
        try {
            List<Map<String, Object>> results = restClient.post()
                    .uri(trimTrailingSlash(url) + "/pipeline")
                    .header("Authorization", "Bearer " + token)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(List.of(
                            List.of("INCR", key),
                            List.of("EXPIRE", key, String.valueOf(ttlSeconds), "NX")))
                    .retrieve()
                    .body(new ParameterizedTypeReference<List<Map<String, Object>>>() { });
            if (results == null || results.isEmpty() || results.get(0).get("result") == null) {
                return true; // unexpected shape → fail open
            }
            long count = ((Number) results.get(0).get("result")).longValue();
            return count <= limit;
        } catch (Exception exception) {
            LOGGER.warn("Upstash rate-limit check failed for {} — allowing request: {}", key, exception.getMessage());
            return true;
        }
    }

    private static String trimTrailingSlash(String url) {
        return url.endsWith("/") ? url.substring(0, url.length() - 1) : url;
    }
}
