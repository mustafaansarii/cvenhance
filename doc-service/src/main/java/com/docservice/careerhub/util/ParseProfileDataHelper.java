package com.docservice.careerhub.util;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ParseProfileDataHelper {

    private static final Logger logger = LoggerFactory.getLogger(ParseProfileDataHelper.class);

    public Map<String, Object> parseProfileWithManual(String resumeText, ObjectMapper objectMapper, String profileSchema) {
        logger.warn("Manual parsing fallback triggered for resume text");
        Map<String, Object> profile = new HashMap<>();

        try {
            JsonNode schemaNode = objectMapper.readTree(profileSchema);
            if (schemaNode.isObject()) {
                schemaNode.fields().forEachRemaining(entry -> {
                    String key = entry.getKey();
                    if (key.matches("(?i).*(experience|education|skill|certification|project|language).*")) {
                        profile.put(key, new ArrayList<>());
                    } else {
                        profile.put(key, "");
                    }
                });
            } else {
                createDefaultProfile(profile);
            }

            String email = extractEmail(resumeText);
            if (email != null) profile.put("email", email);

            String phone = extractPhone(resumeText);
            if (phone != null) profile.put("phone", phone);

            String name = extractName(resumeText);
            if (name != null) profile.put("fullName", name);

            List<String> skills = extractSkills(resumeText);
            if (!skills.isEmpty()) profile.put("skills", skills);

            String summary = extractSummary(resumeText);
            if (summary != null) profile.put("summary", summary);

        } catch (Exception e) {
            logger.error("Manual parsing failed, returning minimal profile", e);
            if (profile.isEmpty()) {
                createDefaultProfile(profile);
                String email = extractEmail(resumeText);
                if (email != null) profile.put("email", email);
                String name = extractName(resumeText);
                if (name != null) profile.put("fullName", name);
            }
        }
        return profile;
    }

    // ------------------------- Helper methods for manual extraction -------------------------

    private String extractEmail(String text) {
        Pattern pattern = Pattern.compile("\\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\\.[A-Z|a-z]{2,}\\b");
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : null;
    }

    private String extractPhone(String text) {
        Pattern pattern = Pattern.compile(
                "\\b(?:\\+?\\d{1,3}[-. ]?)?\\(?\\d{3}\\)?[-. ]?\\d{3}[-. ]?\\d{4}\\b"
        );
        Matcher matcher = pattern.matcher(text);
        return matcher.find() ? matcher.group() : null;
    }

    private String extractName(String text) {
        String[] lines = text.split("\\r?\\n");
        for (String line : lines) {
            line = line.trim();
            if (line.isEmpty()) continue;
            String lower = line.toLowerCase();
            if (lower.contains("resume") || lower.contains("cv") || lower.contains("email") ||
                    lower.contains("phone") || lower.contains("address") || lower.matches(".*\\d.*")) {
                continue;
            }
            if (line.length() < 50 && !line.equals(line.toUpperCase())) {
                return line;
            }
            if (line.contains(",") && line.length() < 30) {
                return line;
            }
        }
        return null;
    }

    private List<String> extractSkills(String text) {
        List<String> skills = new ArrayList<>();
        String[] lines = text.split("\\r?\\n");
        boolean inSkillsSection = false;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            String lower = trimmed.toLowerCase();
            if (lower.matches(".*(skills|technical skills|core competencies|technologies).*")) {
                inSkillsSection = true;
                if (trimmed.contains(":")) {
                    String after = trimmed.split(":", 2)[1].trim();
                    if (!after.isEmpty()) {
                        Arrays.stream(after.split("[,;]"))
                                .map(String::trim)
                                .filter(s -> !s.isEmpty())
                                .forEach(skills::add);
                    }
                    continue;
                }
            }
            if (inSkillsSection) {
                if (lower.matches(".*(experience|education|projects|certifications|summary|objective).*") &&
                        !lower.contains("skill")) {
                    break;
                }
                if (trimmed.matches("^[•·\\-*]\\s*.*") || trimmed.contains(",")) {
                    Arrays.stream(trimmed.split("[,;•·\\-*]"))
                            .map(String::trim)
                            .filter(s -> !s.isEmpty())
                            .forEach(skills::add);
                } else if (!trimmed.isEmpty()) {
                    skills.add(trimmed);
                }
            }
        }
        return skills;
    }

    private String extractSummary(String text) {
        String[] lines = text.split("\\r?\\n");
        StringBuilder summary = new StringBuilder();
        int count = 0;
        for (String line : lines) {
            String trimmed = line.trim();
            if (trimmed.isEmpty()) continue;
            if (count >= 3) break;
            // Skip lines that look like contact info or headings
            if (trimmed.matches(".*@.*") || trimmed.matches(".*\\d{3}.*") ||
                    trimmed.toLowerCase().matches(".*(resume|cv|email|phone|address).*")) {
                continue;
            }
            if (summary.length() > 0) summary.append(" ");
            summary.append(trimmed);
            count++;
        }
        return summary.length() > 0 ? summary.toString() : null;
    }

    private void createDefaultProfile(Map<String, Object> profile) {
        profile.put("fullName", "");
        profile.put("email", "");
        profile.put("phone", "");
        profile.put("summary", "");
        profile.put("skills", new ArrayList<>());
        profile.put("workExperience", new ArrayList<>());
        profile.put("education", new ArrayList<>());
        profile.put("certifications", new ArrayList<>());
        profile.put("languages", new ArrayList<>());
    }
}