package com.docservice.careerhub.ai;

import org.junit.jupiter.api.Test;
import org.springframework.ai.chat.messages.AssistantMessage;
import org.springframework.ai.chat.model.ChatModel;
import org.springframework.ai.chat.model.ChatResponse;
import org.springframework.ai.chat.model.Generation;
import org.springframework.ai.chat.prompt.Prompt;

import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class AiServiceTest {

    private ChatModel modelReturning(String text) {
        ChatModel model = mock(ChatModel.class);
        when(model.call(any(Prompt.class)))
                .thenReturn(new ChatResponse(List.of(new Generation(new AssistantMessage(text)))));
        return model;
    }

    @Test
    void generatesPlainText() {
        AiService service = new AiService(modelReturning("hello world"));
        assertThat(service.generate("say hi")).isEqualTo("hello world");
    }

    @Test
    void rejectsBlankPrompt() {
        AiService service = new AiService(modelReturning("x"));
        assertThatThrownBy(() -> service.generate(new AiRequest("  ", null, null)))
                .isInstanceOf(AiException.class)
                .hasMessageContaining("prompt is required");
    }

    @Test
    void parsesStructuredEntity() {
        AiService service = new AiService(modelReturning("{\"label\":\"Java\"}"));
        Skill s = service.generate(new AiRequest("parse", null, 0.2), Skill.class);
        assertThat(s.label()).isEqualTo("Java");
    }

    record Skill(String label) {}
}
