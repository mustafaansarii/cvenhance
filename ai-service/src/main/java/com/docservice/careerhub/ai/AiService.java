package com.docservice.careerhub.ai;

import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;


@Service
public class AiService {

    private static final Logger LOGGER = LoggerFactory.getLogger(AiService.class);

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
        for (int index = 0; index < providers.size(); index++) {
            AiProvider provider = providers.get(index);
            try {
                T response = call.generate(provider);
                LOGGER.info("AI {} generation completed using {} model {}", responseType,
                        provider.name(), provider.model());
                return response;
            } catch (Exception exception) {
                lastFailure = new AiException(provider.name() + " provider failed", exception);
                logProviderFailure(responseType, provider, index, exception);
            }
        }
        throw new AiException("AI " + responseType + " generation failed for all configured providers", lastFailure);
    }

    private void logProviderFailure(String responseType, AiProvider provider, int index, Exception exception) {
        if (index + 1 < providers.size()) {
            LOGGER.error("AI {} generation failed with provider {}; falling back to {}",
                    responseType, provider.name(), providers.get(index + 1).name(), exception);
            return;
        }
        LOGGER.error("AI {} generation failed with final provider {}; no fallback remains",
                responseType, provider.name(), exception);
    }

    @FunctionalInterface
    private interface ProviderCall<T> { T generate(AiProvider provider); }
}
