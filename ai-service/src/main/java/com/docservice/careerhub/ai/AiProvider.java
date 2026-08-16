package com.docservice.careerhub.ai;

public interface AiProvider {
    String name();
    String generate(AiRequest request);
    <T> T generate(AiRequest request, Class<T> type);
}
