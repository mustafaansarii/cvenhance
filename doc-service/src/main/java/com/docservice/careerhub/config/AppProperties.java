package com.docservice.careerhub.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Getter
@Setter
@Component
public class AppProperties {

    @Value("${spring.application.name:DOC-SERVICE}")
    private String appName;

    @Value("${frontend.url:http://localhost:5173}")
    private String frontendUrl;

    @Value("${cors.allowed-origins:http://localhost:5173}")
    private String corsAllowedOrigins;

    @Value("${server.port:5001}")
    private int serverPort;

    @Value("${oauth.success-redirect:${frontend.url:http://localhost:5173}}")
    private String oauthSuccessRedirect;

    @Value("${oauth.failure-redirect:${frontend.url:http://localhost:5173}/login}")
    private String oauthFailureRedirect;

    @Value("${auth.jwt.secret}")
    private String jwtSecret;

    @Value("${auth.jwt.expiry-ms:3600000}")
    private long jwtExpiryMs;

    @Value("${auth.session.expiry-ms:2592000000}")
    private long sessionExpiryMs;

    @Value("${auth.cookie.name:ACCESS_TOKEN}")
    private String cookieName;

    @Value("${auth.cookie.secure:false}")
    private boolean cookieSecure;

    @Value("${auth.cookie.same-site:Lax}")
    private String cookieSameSite;

    @Value("${auth.cookie.path:/}")
    private String cookiePath;

    @Value("${spring.mail.username:}")
    private String mailFrom;

    @Value("${resend.api-key:}")
    private String resendApiKey;

    @Value("${mail.from:}")
    private String mailFromAddress;

    @Value("${mail.support:support.cvenhance@gmail.com}")
    private String mailSupportAddress;

    @Value("${upstash.redis.rest-url:}")
    private String upstashRedisRestUrl;

    @Value("${upstash.redis.rest-token:}")
    private String upstashRedisRestToken;

    @Value("${google.clientId:}")
    private String googleClientId;

    @Value("${google.clientSecret:}")
    private String googleClientSecret;

    @Value("${github.clientId:}")
    private String githubClientId;

    @Value("${github.clientSecret:}")
    private String githubClientSecret;

    @Value("${spring.ai.google.genai.chat.options.model:gemini-flash-latest}")
    private String geminiModel;

    @Value("${ai.openrouter.api-key:}")
    private String openRouterApiKey;

    @Value("${ai.openrouter.base-url:https://openrouter.ai/api}")
    private String openRouterBaseUrl;

    @Value("${ai.openrouter.model:openrouter/free}")
    private String openRouterModel;

    @Value("${ai.groq.api-key:}")
    private String groqApiKey;

    @Value("${ai.groq.base-url:https://api.groq.com/openai}")
    private String groqBaseUrl;

    @Value("${ai.groq.model:openai/gpt-oss-120b}")
    private String groqModel;

    @Value("${ai.primary-provider:openrouter}")
    private String aiPrimaryProvider;

    @Value("${storage.s3.bucket:resume_pdf}")
    private String s3Bucket;

    @Value("${storage.s3.endpoint:}")
    private String s3Endpoint;

    @Value("${storage.s3.region:ap-south-1}")
    private String s3Region;

    @Value("${storage.s3.access-key:}")
    private String s3AccessKey;

    @Value("${storage.s3.secret-key:}")
    private String s3SecretKey;

    @Value("${cashfree.app.id:}")
    private String cashfreeAppId;

    @Value("${cashfree.secret.key:}")
    private String cashfreeSecretKey;

    @Value("${latex.docker-image:texlive/texlive:latest}")
    private String latexDockerImage;

    @Value("${latex.compile-timeout-seconds:120}")
    private long latexCompileTimeoutSeconds;

    @Value("${latex.compiler:${LATEX_COMPILER:docker}}")
    private String latexCompiler;

    @Value("${doc-templates.compile-poll-ms:15000}")
    private long docTemplatesCompilePollMs;

    @Value("${doc-templates.compile-initial-ms:8000}")
    private long docTemplatesCompileInitialMs;
}
