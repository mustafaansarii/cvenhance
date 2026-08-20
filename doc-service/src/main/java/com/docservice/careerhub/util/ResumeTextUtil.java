package com.docservice.careerhub.util;

import org.springframework.util.StringUtils;

import java.util.ArrayList;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

public final class ResumeTextUtil {


    public static final Pattern WORD = Pattern.compile("[a-zA-Z][a-zA-Z+#.-]{1,}");
    private static final Pattern BULLET_PREFIX = Pattern.compile("^[\\-*•▪‣◦·»–]+\\s*");
    private static final Pattern SENTENCE_SPLIT = Pattern.compile("(?<=[.!?])\\s+|\\s*[•▪‣◦·|]\\s*|\\s+[oO]\\s+|\\R");

    private ResumeTextUtil() {
    }

    public static List<String> lines(String text) {
        List<String> out = new ArrayList<>();
        if (text == null) {
            return out;
        }
        for (String raw : text.split("\\R")) {
            String t = raw.trim();
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return out;
    }

    public static List<String> sentences(String text) {
        List<String> out = new ArrayList<>();
        if (text == null) {
            return out;
        }
        for (String raw : SENTENCE_SPLIT.split(text)) {
            String t = raw.trim();
            if (!t.isEmpty()) {
                out.add(t);
            }
        }
        return out;
    }

    public static String stripBullet(String line) {
        return line == null ? "" : BULLET_PREFIX.matcher(line).replaceFirst("").trim();
    }

    public static String firstWord(String s) {
        if (s == null) {
            return "";
        }
        Matcher m = WORD.matcher(s);
        return m.find() ? m.group() : "";
    }

    public static String snippet(String s, int max) {
        if (s == null) {
            return "";
        }
        String t = s.trim();
        return t.length() <= max ? t : t.substring(0, max);
    }

    public static int countWords(String s) {
        if (!StringUtils.hasText(s)) {
            return 0;
        }
        int count = 0;
        for (String w : s.trim().split("\\s+")) {
            if (!w.isEmpty()) {
                count++;
            }
        }
        return count;
    }

    public static Set<String> keywords(String text, Set<String> stopwords, int minLen) {
        Set<String> out = new LinkedHashSet<>();
        if (text == null) {
            return out;
        }
        Matcher m = WORD.matcher(text);
        while (m.find()) {
            String w = m.group().toLowerCase(Locale.ROOT);
            if (w.length() >= minLen && !stopwords.contains(w)) {
                out.add(w);
            }
        }
        return out;
    }

    public static int clamp(int value, int min, int max) {
        return Math.max(min, Math.min(max, value));
    }
}
