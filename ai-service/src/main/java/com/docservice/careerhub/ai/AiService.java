package com.docservice.careerhub.ai;

import org.springframework.stereotype.Service;
import java.util.List;


@Service
public class AiService {

    private final List<AiProvider> providers;

    public AiService(List<AiProvider> providers) {
        this.providers = List.copyOf(providers);
    }

    public String generate(String prompt) {
        return generate(new AiRequest(prompt, null, null));
    }

    public String generate(AiRequest request) {
        validate(request);
        return generateWithFallback(provider -> provider.generate(request), "text");
    }

    public <T> T generate(AiRequest request, Class<T> type) {
        validate(request);
        return generateWithFallback(provider -> provider.generate(request, type), "structured");
    }

    private void validate(AiRequest request) {
        if (request == null || request.prompt() == null || request.prompt().isBlank()) {
            throw new AiException("prompt is required");
        }
        if (providers.isEmpty()) throw new AiException("no AI providers are configured");
    }
    private <T> T generateWithFallback(ProviderCall<T> call, String responseType) {
        AiException lastFailure = null;
        for (AiProvider provider : providers) {
            try { return call.generate(provider); }
            catch (Exception exception) { lastFailure = new AiException(provider.name() + " provider failed", exception); }
        }
        throw new AiException("AI " + responseType + " generation failed for all configured providers", lastFailure);
    }
    @FunctionalInterface
    private interface ProviderCall<T> { T generate(AiProvider provider); }
}