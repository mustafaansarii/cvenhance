package com.docservice.careerhub.ai;

import java.util.List;
import org.junit.jupiter.api.Test;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.never;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

class AiServiceTest {
    private AiProvider providerReturning(String name, String text) {
        AiProvider provider = mock(AiProvider.class);
        when(provider.name()).thenReturn(name);
        when(provider.generate(eq(new AiRequest("say hi", null, null)))).thenReturn(text);
        return provider;
    }

    @Test void usesGeminiWithoutCallingOpenRouterWhenGeminiSucceeds() {
        AiProvider gemini = providerReturning("Gemini", "primary");
        AiProvider openRouter = providerReturning("OpenRouter", "fallback");
        assertThat(new AiService(List.of(gemini, openRouter)).generate("say hi")).isEqualTo("primary");
        verify(openRouter, never()).generate(new AiRequest("say hi", null, null));
    }

    @Test void usesOpenRouterWhenGeminiFails() {
        AiProvider gemini = mock(AiProvider.class);
        when(gemini.name()).thenReturn("Gemini");
        when(gemini.generate(new AiRequest("say hi", null, null))).thenThrow(new IllegalStateException("unavailable"));
        assertThat(new AiService(List.of(gemini, providerReturning("OpenRouter", "fallback"))).generate("say hi"))
                .isEqualTo("fallback");
    }

    @Test void usesOpenRouterForStructuredGenerationWhenGeminiFails() {
        AiRequest request = new AiRequest("parse", null, 0.2);
        AiProvider gemini = mock(AiProvider.class);
        AiProvider openRouter = mock(AiProvider.class);
        when(gemini.name()).thenReturn("Gemini"); when(openRouter.name()).thenReturn("OpenRouter");
        when(gemini.generate(request, Skill.class)).thenThrow(new IllegalStateException("unavailable"));
        when(openRouter.generate(request, Skill.class)).thenReturn(new Skill("Java"));
        assertThat(new AiService(List.of(gemini, openRouter)).generate(request, Skill.class).label()).isEqualTo("Java");
    }

    @Test void throwsAiExceptionAfterEveryProviderFails() {
        AiProvider gemini = mock(AiProvider.class); AiProvider openRouter = mock(AiProvider.class);
        when(gemini.name()).thenReturn("Gemini"); when(openRouter.name()).thenReturn("OpenRouter");
        when(gemini.generate(new AiRequest("say hi", null, null))).thenThrow(new IllegalStateException("unavailable"));
        when(openRouter.generate(new AiRequest("say hi", null, null))).thenThrow(new IllegalStateException("unavailable"));
        assertThatThrownBy(() -> new AiService(List.of(gemini, openRouter)).generate("say hi"))
                .isInstanceOf(AiException.class).hasMessageContaining("all configured providers");
    }

    @Test void rejectsBlankPromptBeforeCallingProviders() {
        AiProvider gemini = mock(AiProvider.class);
        assertThatThrownBy(() -> new AiService(List.of(gemini)).generate(new AiRequest("  ", null, null)))
                .isInstanceOf(AiException.class).hasMessageContaining("prompt is required");
        verify(gemini, never()).generate(new AiRequest("  ", null, null));
    }

    record Skill(String label) {}
}
