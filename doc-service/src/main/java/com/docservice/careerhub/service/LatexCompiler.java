package com.docservice.careerhub.service;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

public interface LatexCompiler {

    byte[] compile(String latexCode);

    Pattern LINE_NUMBER = Pattern.compile("^l\\.(\\d+)");
    int MAX_MESSAGE_CHARS = 200;

    static String summarizeError(String output) {
        if (output == null || output.isBlank()) {
            return "LaTeX compilation failed. Check your syntax and try again.";
        }
        String errorLine = null;
        String lineNo = null;
        for (String line : output.split("\\R")) {
            String trimmed = line.strip();
            if (errorLine == null && trimmed.startsWith("!")) {
                errorLine = trimmed.replaceFirst("^!\\s*", "").strip();
            }
            if (lineNo == null && trimmed.startsWith("l.")) {
                Matcher matcher = LINE_NUMBER.matcher(trimmed);
                if (matcher.find()) {
                    lineNo = matcher.group(1);
                }
            }
        }
        if (errorLine == null || errorLine.isBlank()) {
            return "LaTeX compilation failed. Check your syntax and try again.";
        }
        if (errorLine.endsWith(".")) {
            errorLine = errorLine.substring(0, errorLine.length() - 1);
        }
        String message = lineNo != null ? errorLine + " (line " + lineNo + ")" : errorLine;
        if (message.length() > MAX_MESSAGE_CHARS) {
            message = message.substring(0, MAX_MESSAGE_CHARS) + "…";
        }
        return "LaTeX error: " + message;
    }
}
