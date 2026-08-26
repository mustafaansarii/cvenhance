package com.docservice.careerhub.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.ChatOptions;

public final class ChatModelAiProvider implements AiProvider {
    private static final int MAX_OUTPUT_TOKENS = 8192;

    private final String name;
    private final String model;
    private final ChatClient chatClient;

    public ChatModelAiProvider(String name, String model, ChatModel chatModel) {
        this.name = name;
        this.model = model;
        this.chatClient = ChatClient.create(chatModel);
    }

    @Override
    public String name() {
        return name;
    }

    @Override
    public String model() {
        return model;
    }

    @Override
    public String generate(AiRequest request) {
        return spec(request).call().content();
    }

    @Override
    public <T> T generate(AiRequest request, Class<T> type) {
        return spec(request).call().entity(type);
    }

    private ChatClient.ChatClientRequestSpec spec(AiRequest request) {
        ChatClient.ChatClientRequestSpec prompt = chatClient.prompt().user(request.prompt());
        if (request.system() != null && !request.system().isBlank()) prompt = prompt.system(request.system());
        ChatOptions.Builder options = ChatOptions.builder().maxTokens(MAX_OUTPUT_TOKENS);
        if (request.temperature() != null) options.temperature(request.temperature());
        return prompt.options(options.build());
    }
}
