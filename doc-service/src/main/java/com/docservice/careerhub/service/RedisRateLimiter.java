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
    private static final long DAY_TTL_SECONDS = 90_000;

    private static final int FREE_AI_DAILY_LIMIT = 3;
    private static final int SUBSCRIBED_AI_DAILY_LIMIT = 20;

    private final RestClient restClient = RestClient.create();

    @Autowired
    private AppProperties appProperties;

    public void checkAiDailyLimit(String email, boolean subscribed) {
        int limit = subscribed ? SUBSCRIBED_AI_DAILY_LIMIT : FREE_AI_DAILY_LIMIT;
        String key = "ai:all:" + email + ":" + LocalDate.now(ZoneOffset.UTC);
        if (!allow(key, limit, DAY_TTL_SECONDS)) {
            throw ApiException.tooManyRequests("You've reached your AI limit for today. Please subscribe to continue using.");
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
                return true;
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
