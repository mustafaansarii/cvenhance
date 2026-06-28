package com.docservice.careerhub.ai;

import org.springframework.ai.chat.client.ChatClient;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.prompt.ChatOptions;
import org.springframework.stereotype.Service;

/**
 * Thin façade over Spring AI's {@link ChatClient} (Google GenAI / Gemini). Callers depend only on
 * this class, not on the underlying model/provider.
 */
@Service
public class AiService {

    private final ChatClient chatClient;

    public AiService(ChatModel chatModel) {
        this.chatClient = ChatClient.create(chatModel);
    }

    public String generate(String prompt) {
        return generate(new AiRequest(prompt, null, null));
    }

    public String generate(AiRequest request) {
        try {
            return spec(request).call().content();
        } catch (AiException e) {
            throw e;
        } catch (Exception e) {
            throw new AiException("AI text generation failed", e);
        }
    }

    public <T> T generate(AiRequest request, Class<T> type) {
        try {
            return spec(request).call().entity(type);
        } catch (AiException e) {
            throw e;
        } catch (Exception e) {
            throw new AiException("AI structured generation failed", e);
        }
    }

    private ChatClient.ChatClientRequestSpec spec(AiRequest request) {
        if (request == null || request.prompt() == null || request.prompt().isBlank()) {
            throw new AiException("prompt is required");
        }
        ChatClient.ChatClientRequestSpec prompt = chatClient.prompt().user(request.prompt());
        if (request.system() != null && !request.system().isBlank()) {
            prompt = prompt.system(request.system());
        }
        if (request.temperature() != null) {
            prompt = prompt.options(ChatOptions.builder().temperature(request.temperature()).build());
        }
        return prompt;
    }
}
