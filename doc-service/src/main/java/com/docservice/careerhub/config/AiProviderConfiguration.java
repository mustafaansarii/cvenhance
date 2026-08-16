package com.docservice.careerhub.config;

import com.docservice.careerhub.ai.AiProvider;
import com.docservice.careerhub.ai.ChatModelAiProvider;
import io.micrometer.observation.ObservationRegistry;
import java.util.List;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.model.tool.ToolCallingManager;
import org.springframework.ai.openai.OpenAiChatModel;
import org.springframework.ai.openai.OpenAiChatOptions;
import org.springframework.ai.openai.api.OpenAiApi;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.retry.support.RetryTemplate;
import org.springframework.web.client.RestClient;

@Configuration
public class AiProviderConfiguration {

    private final AppProperties properties;

    public AiProviderConfiguration(AppProperties properties) {
        this.properties = properties;
    }

    @Bean
    public List<AiProvider> aiProviders(ChatModel geminiChatModel, ToolCallingManager toolCallingManager,
            RetryTemplate retryTemplate, ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<RestClient.Builder> restClientBuilder) {
        ChatModel openRouterChatModel = createOpenRouterChatModel(
                toolCallingManager, retryTemplate, observationRegistry, restClientBuilder);

        return List.of(
                new ChatModelAiProvider("Gemini", geminiChatModel),
                new ChatModelAiProvider("OpenRouter", openRouterChatModel));
    }

    private OpenAiChatModel createOpenRouterChatModel(ToolCallingManager toolCallingManager,
            RetryTemplate retryTemplate, ObjectProvider<ObservationRegistry> observationRegistry,
            ObjectProvider<RestClient.Builder> restClientBuilder) {
        OpenAiApi openRouterApi = OpenAiApi.builder()
                .baseUrl(properties.getOpenRouterBaseUrl())
                .apiKey(properties.getOpenRouterApiKey())
                .restClientBuilder(restClientBuilder.getIfAvailable(RestClient::builder))
                .build();

        return OpenAiChatModel.builder()
                .openAiApi(openRouterApi)
                .defaultOptions(OpenAiChatOptions.builder().model(properties.getOpenRouterModel()).build())
                .toolCallingManager(toolCallingManager)
                .retryTemplate(retryTemplate)
                .observationRegistry(observationRegistry.getIfAvailable(() -> ObservationRegistry.NOOP))
                .build();
    }
}
