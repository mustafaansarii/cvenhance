package com.docservice.careerhub.config;

import com.docservice.careerhub.ai.AiProvider;
import com.docservice.careerhub.ai.ChatModelAiProvider;
import io.micrometer.observation.ObservationRegistry;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.model.tool.ToolCallingManager;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.util.StringUtils;
import org.springframework.web.client.RestClient;

@Configuration
public class AiProviderConfiguration {

    private static final Logger LOGGER = LoggerFactory.getLogger(AiProviderConfiguration.class);

    private final AppProperties properties;

    public AiProviderConfiguration(AppProperties properties) {
        this.properties = properties;
    }

    @Bean
    public List<AiProvider> aiProviders(ChatModel geminiChatModel, ToolCallingManager toolCallingManager,
            RetryTemplate retryTemplate, ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<RestClient.Builder> restClientBuilder) {

        Map<String, AiProvider> byName = new LinkedHashMap<>();
        if (StringUtils.hasText(properties.getOpenRouterApiKey())) {
            ChatModel model = openAiCompatibleModel(properties.getOpenRouterBaseUrl(), properties.getOpenRouterApiKey(),
                    properties.getOpenRouterModel(), toolCallingManager, retryTemplate, observationRegistry, restClientBuilder);
            byName.put("openrouter", new ChatModelAiProvider("OpenRouter", properties.getOpenRouterModel(), model));
        }
        if (StringUtils.hasText(properties.getGroqApiKey())) {
            ChatModel model = openAiCompatibleModel(properties.getGroqBaseUrl(), properties.getGroqApiKey(),
                    properties.getGroqModel(), toolCallingManager, retryTemplate, observationRegistry, restClientBuilder);
            byName.put("groq", new ChatModelAiProvider("Groq", properties.getGroqModel(), model));
        }
        byName.put("gemini", new ChatModelAiProvider("Gemini", properties.getGeminiModel(), geminiChatModel));

        String primary = properties.getAiPrimaryProvider() == null ? "" : properties.getAiPrimaryProvider().toLowerCase();
        List<AiProvider> ordered = new ArrayList<>();
        if (byName.containsKey(primary)) {
            ordered.add(byName.get(primary));
        }
        byName.forEach((name, provider) -> { if (!name.equals(primary)) ordered.add(provider); });

        LOGGER.info("AI providers ready ({} configured): {}", ordered.size(),
                ordered.stream().map(AiProvider::name).toList());
        return List.copyOf(ordered);
    }

    private OpenAiChatModel openAiCompatibleModel(String baseUrl, String apiKey, String model,
            ToolCallingManager toolCallingManager, RetryTemplate retryTemplate,
            ObjectProvider<ObservationRegistry> observationRegistry, ObjectProvider<RestClient.Builder> restClientBuilder) {
        OpenAiApi api = OpenAiApi.builder()
                .baseUrl(baseUrl)
                .apiKey(apiKey)
                .restClientBuilder(restClientBuilder.getIfAvailable(RestClient::builder))
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(api)
                .defaultOptions(OpenAiChatOptions.builder().model(model).build())
                .toolCallingManager(toolCallingManager)
                .retryTemplate(retryTemplate)
                .observationRegistry(observationRegistry.getIfAvailable(() -> ObservationRegistry.NOOP))
                .build();
    }
}
