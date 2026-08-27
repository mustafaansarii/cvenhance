package com.docservice.careerhub.ai;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.ai.converter.BeanOutputConverter;

public final class ChatModelAiProvider implements AiProvider {

    private static final int MAX_OUTPUT_TOKENS = 4096;
    private static final int MAX_INPUT_CHARS = 12000;

    private final String name;
    private final String model;
    private final ChatClient chatClient;
    private final ObjectMapper objectMapper = new ObjectMapper();

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
        BeanOutputConverter<T> converter = new BeanOutputConverter<>(type);
        String userPrompt = clip(request.prompt()) + "\n\n" + converter.getFormat();
        String raw = spec(request, userPrompt).call().content();
        try {
            return converter.convert(raw);
        } catch (Exception first) {
            String json = extractJson(raw);
            if (json == null) {
                throw first;
            }
            try {
                return objectMapper.readValue(json, type);
            } catch (Exception ignored) {
                return converter.convert(json);
            }
        }
    }

    private ChatClient.ChatClientRequestSpec spec(AiRequest request) {
        return spec(request, clip(request.prompt()));
    }

    private ChatClient.ChatClientRequestSpec spec(AiRequest request, String userPrompt) {
        ChatClient.ChatClientRequestSpec prompt = chatClient.prompt().user(userPrompt);
        if (request.system() != null && !request.system().isBlank()) prompt = prompt.system(request.system());
        ChatOptions.Builder options = ChatOptions.builder().maxTokens(MAX_OUTPUT_TOKENS);
        if (request.temperature() != null) options.temperature(request.temperature());
        return prompt.options(options.build());
    }

    private String extractJson(String text) {
        if (text == null) {
            return null;
        }
        int firstObj = text.indexOf('{');
        int firstArr = text.indexOf('[');
        int start = (firstObj < 0) ? firstArr : (firstArr < 0 ? firstObj : Math.min(firstObj, firstArr));
        if (start < 0) {
            return null;
        }
        char open = text.charAt(start);
        char close = open == '{' ? '}' : ']';
        int end = text.lastIndexOf(close);
        if (end <= start) {
            return null;
        }
        return text.substring(start, end + 1);
    }

    private String clip(String text) {
        if (text == null || text.length() <= MAX_INPUT_CHARS) {
            return text;
        }
        return text.substring(0, MAX_INPUT_CHARS);
    }
}
