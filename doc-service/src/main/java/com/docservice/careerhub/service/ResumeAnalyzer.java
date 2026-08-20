package com.docservice.careerhub.service;

import com.docservice.careerhub.dto.ai.ResumeCheckResult;
import com.docservice.careerhub.dto.ai.ResumeCheckResult.Category;
import com.docservice.careerhub.dto.ai.ResumeCheckResult.Finding;
import com.docservice.careerhub.dto.constants.Lexicon;
import com.docservice.careerhub.util.ResumeTextUtil;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class ResumeAnalyzer {

    private static final int LONG_LINE_CHARS = 220;
    private static final int MIN_WORDS = 350;
    private static final int MAX_WORDS = 950;
    private static final int MAX_FINDINGS = 6;
    private static final int SNIPPET_CHARS = 45;

    private static final Pattern EMAIL = Pattern.compile("[\\w.+-]+@[\\w-]+\\.[\\w.-]+");
    private static final Pattern PHONE = Pattern.compile("\\+?\\d[\\d\\s().-]{7,}\\d");
    private static final Pattern LINK = Pattern.compile("https?://|www\\.|linkedin\\.com|github\\.com", Pattern.CASE_INSENSITIVE);
    private static final Pattern YEAR = Pattern.compile("\\b(19|20)\\d{2}\\b");
    private static final Pattern PASSIVE = Pattern.compile("\\b(?:was|were|been|being|be)\\s+\\w+ed\\b", Pattern.CASE_INSENSITIVE);
    private static final Pattern PRONOUN = Pattern.compile("\\b(?:I|me|my|myself|mine)\\b");
    private static final Pattern METRIC = Pattern.compile(
            "\\d+\\s?%|\\$\\s?\\d|\\b\\d{2,}\\b|\\b\\d+\\s?(k|m|x|hrs?|hours?|users?|customers?|projects?|people|clients?)\\b",
            Pattern.CASE_INSENSITIVE);

    public ResumeCheckResult analyze(String text) {
        String lower = text.toLowerCase(Locale.ROOT);
        List<String> units = ResumeTextUtil.sentences(text); // sentences/bullets (robust to PDF text)

        List<Category> categories = new ArrayList<>();
        categories.add(impact(text, units));
        categories.add(quantification(units));
        categories.add(repetition(text));
        categories.add(buzzwords(text, lower));
        categories.add(fillerWords(text, lower));
        categories.add(pronouns(text));
        categories.add(brevity(units));
        categories.add(readability(text));
        categories.add(dates(text));
        categories.add(sections(lower, text));
        categories.add(length(text));
        return new ResumeCheckResult(overallScore(categories), categories);
    }

    // ---------------- Individual rules ----------------

    /** Weak bullet openers + passive voice. */
    private Category impact(String text, List<String> lines) {
        List<Finding> findings = new ArrayList<>();
        for (String line : lines) {
            if (findings.size() >= MAX_FINDINGS) {
                break;
            }
            String body = ResumeTextUtil.stripBullet(line);
            String bodyLower = body.toLowerCase(Locale.ROOT);
            for (String weak : Lexicon.WEAK_STARTERS.terms()) {
                if (bodyLower.startsWith(weak)) {
                    findings.add(new Finding("bad", body.substring(0, Math.min(weak.length(), body.length())),
                            "Bullet opens with the weak phrase \"" + weak + "\".",
                            "Start with a strong action verb (e.g. Led, Built, Reduced, Automated)."));
                    break;
                }
            }
        }
        Matcher m = PASSIVE.matcher(text);
        while (m.find() && findings.size() < MAX_FINDINGS) {
            findings.add(new Finding("warning", m.group(),
                    "Passive voice — \"" + m.group() + "\".",
                    "Rewrite in active voice led by the action you took."));
        }
        if (findings.isEmpty()) {
            findings.add(new Finding("good", "", "Bullets use strong, active phrasing.", "Keep leading with impact verbs."));
        }
        return category("impact", "Impact & Action Verbs", findings, "Lead every bullet with a strong action verb.");
    }

    private Category quantification(List<String> lines) {
        List<Finding> findings = new ArrayList<>();
        int bullets = 0;
        int quantified = 0;
        for (String line : lines) {
            String body = ResumeTextUtil.stripBullet(line);
            if (!Lexicon.ACTION_VERBS.contains(ResumeTextUtil.firstWord(body).toLowerCase(Locale.ROOT))) {
                continue;
            }
            bullets++;
            if (METRIC.matcher(body).find()) {
                quantified++;
            } else if (findings.size() < MAX_FINDINGS) {
                findings.add(new Finding("warning", ResumeTextUtil.snippet(body, SNIPPET_CHARS),
                        "This achievement has no number to prove impact.",
                        "Add a metric — %, $, count, time saved, or scale."));
            }
        }
        if (bullets == 0 && findings.isEmpty()) {
            findings.add(new Finding("bad", "", "No quantified achievements detected.",
                    "Add figures (%, $, counts, time saved) to demonstrate measurable impact."));
        }
        String ok = bullets > 0
                ? quantified + " of " + bullets + " achievements are quantified — nice."
                : "Quantify impact wherever possible.";
        return category("quantification", "Quantification", findings, ok);
    }

    private Category repetition(String text) {
        Map<String, Integer> counts = new LinkedHashMap<>();
        Matcher matcher = ResumeTextUtil.WORD.matcher(text);
        while (matcher.find()) {
            String word = matcher.group().toLowerCase(Locale.ROOT);
            if (Lexicon.ACTION_VERBS.contains(word)) {
                counts.merge(word, 1, Integer::sum);
            }
        }
        List<Finding> findings = new ArrayList<>();
        for (Map.Entry<String, Integer> e : counts.entrySet()) {
            if (e.getValue() >= 3 && findings.size() < MAX_FINDINGS) {
                findings.add(new Finding("warning", e.getKey(),
                        "\"" + e.getKey() + "\" is used " + e.getValue() + " times.",
                        "Vary it with a more specific action verb so achievements stand out."));
            }
        }
        return category("repetition", "Repetition", findings, "Good variety of action verbs across bullets.");
    }

    private Category buzzwords(String text, String lower) {
        return dictionaryFindings("buzzwords", "Buzzwords", text, lower, Lexicon.BUZZWORDS.terms(),
                buzz -> "\"" + buzz + "\" is a cliché that adds no evidence.",
                "Replace it with a concrete, measurable accomplishment.",
                "No empty clichés — good.", "warning");
    }

    private Category fillerWords(String text, String lower) {
        return dictionaryFindings("fillers", "Filler Words", text, lower, Lexicon.FILLERS.terms(),
                filler -> "\"" + filler + "\" is filler that weakens the statement.",
                "Remove it or replace with a specific detail.",
                "Concise wording — no filler.", "warning");
    }

    private Category pronouns(String text) {
        List<Finding> findings = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        Matcher m = PRONOUN.matcher(text);
        while (m.find() && findings.size() < MAX_FINDINGS) {
            if (seen.add(m.group().toLowerCase(Locale.ROOT))) {
                findings.add(new Finding("warning", m.group(),
                        "First-person pronoun \"" + m.group() + "\".",
                        "Drop personal pronouns — resumes are written in implied first person."));
            }
        }
        return category("pronouns", "Personal Pronouns", findings, "No first-person pronouns — good.");
    }

    private Category brevity(List<String> lines) {
        List<Finding> findings = new ArrayList<>();
        for (String line : lines) {
            String body = ResumeTextUtil.stripBullet(line);
            if (body.length() > LONG_LINE_CHARS && findings.size() < MAX_FINDINGS) {
                findings.add(new Finding("warning", ResumeTextUtil.snippet(body, SNIPPET_CHARS),
                        "This line is " + body.length() + " characters — too long to skim.",
                        "Split it into two concise, single-line bullets."));
            }
        }
        return category("brevity", "Brevity", findings, "Bullets are scannable — good.");
    }

    private Category readability(String text) {
        int words = 0;
        int sentences = 0;
        for (String s : text.split("(?<=[.!?])\\s+|\\R")) {
            int w = ResumeTextUtil.countWords(s);
            if (w > 0) {
                words += w;
                sentences++;
            }
        }
        double avg = sentences == 0 ? 0 : (double) words / sentences;
        List<Finding> findings = new ArrayList<>();
        if (avg > 28) {
            findings.add(new Finding("warning", "",
                    "Sentences average ~" + Math.round(avg) + " words — dense to read.",
                    "Aim for tight, single-idea bullets under ~20 words."));
        }
        return category("readability", "Readability", findings, "Easy to scan — good sentence length.");
    }

    private Category dates(String text) {
        List<Finding> findings = new ArrayList<>();
        if (YEAR.matcher(text).results().count() == 0) {
            findings.add(new Finding("warning", "", "No dates detected.",
                    "Add start/end dates (e.g. Jan 2022 – Present) so recruiters can gauge tenure."));
        }
        return category("dates", "Dates", findings, "Dates are present — good.");
    }

    private Category sections(String lower, String text) {
        List<Finding> findings = new ArrayList<>();
        for (String section : List.of("experience", "education", "skills")) {
            if (!lower.contains(section)) {
                findings.add(new Finding("bad", "", "No \"" + section + "\" section detected.",
                        "Add a clearly labelled " + section + " section for ATS parsing."));
            }
        }
        if (!EMAIL.matcher(text).find()) {
            findings.add(new Finding("bad", "", "No email address detected.",
                    "Add a professional email so recruiters can reach you."));
        }
        if (!PHONE.matcher(text).find()) {
            findings.add(new Finding("warning", "", "No phone number detected.", "Add a phone number to your header."));
        }
        if (!LINK.matcher(text).find()) {
            findings.add(new Finding("warning", "", "No LinkedIn/GitHub/portfolio link detected.",
                    "Add a relevant profile or portfolio link."));
        }
        return category("sections", "Sections & Contact", findings, "Core sections and contact details are present.");
    }

    private Category length(String text) {
        int words = ResumeTextUtil.countWords(text);
        List<Finding> findings = new ArrayList<>();
        if (words < MIN_WORDS) {
            findings.add(new Finding("warning", "", "The resume is short (~" + words + " words).",
                    "Expand with more detail on impact and responsibilities."));
        } else if (words > MAX_WORDS) {
            findings.add(new Finding("warning", "", "The resume is long (~" + words + " words).",
                    "Trim to the most relevant, recent, high-impact content (aim for one page)."));
        }
        return category("length", "Length", findings, "Appropriately sized (~" + words + " words).");
    }

    // ---------------- Shared builders ----------------

    /** Flags each dictionary term found in the text (case-insensitive), capturing the original casing. */
    private Category dictionaryFindings(String key, String label, String text, String lower, List<String> terms,
                                        java.util.function.Function<String, String> issue, String suggestion,
                                        String okSummary, String severity) {
        List<Finding> findings = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        for (String term : terms) {
            int idx = lower.indexOf(term);
            if (idx >= 0 && seen.add(term) && findings.size() < MAX_FINDINGS) {
                findings.add(new Finding(severity, text.substring(idx, idx + term.length()),
                        issue.apply(term), suggestion));
            }
        }
        return category(key, label, findings, okSummary);
    }

    private Category category(String key, String label, List<Finding> findings, String okSummary) {
        int problems = (int) findings.stream()
                .filter(f -> "bad".equals(f.severity()) || "warning".equals(f.severity()))
                .count();
        int score = ResumeTextUtil.clamp(100 - problems * 15, 0, 100);
        String status = problems == 0 ? "good" : problems <= 2 ? "warning" : "bad";
        String summary = problems == 0 ? okSummary : problems + " issue" + (problems == 1 ? "" : "s") + " found.";
        return new Category(key, label, score, status, summary, findings);
    }

    private int overallScore(List<Category> categories) {
        if (categories.isEmpty()) {
            return 0;
        }
        int sum = categories.stream().mapToInt(Category::score).sum();
        return ResumeTextUtil.clamp(Math.round((float) sum / categories.size()), 0, 100);
    }
}
