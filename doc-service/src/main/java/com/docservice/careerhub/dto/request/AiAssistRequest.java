package com.docservice.careerhub.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class AiAssistRequest {
    private String section;
    private String currentText;
    private String instruction;
    private String format;
    private List<QA> answers;

    @Data
    public static class QA {
        private String question;
        private String answer;
    }
}
