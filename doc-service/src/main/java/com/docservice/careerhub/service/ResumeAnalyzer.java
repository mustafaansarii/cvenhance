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
    private static final int DENSE_SENTENCE_WORDS = 28;
    private static final int MIN_WORDS = 350;
    private static final int MAX_WORDS = 950;
    private static final int MAX_FINDINGS = 6;
    private static final int SNIPPET_CHARS = 45;
    private static final int PENALTY_PER_ISSUE = 25;

    private static final Map<String, Double> CATEGORY_WEIGHTS = Map.ofEntries(
            Map.entry("impact", 4.0),
            Map.entry("quantification", 4.0),
            Map.entry("sections", 2.0),
            Map.entry("brevity", 2.0),
            Map.entry("readability", 2.0),
            Map.entry("length", 1.0),
            Map.entry("repetition", 1.0),
            Map.entry("buzzwords", 1.0),
            Map.entry("fillers", 1.0),
            Map.entry("pronouns", 1.0),
            Map.entry("dates", 1.0));

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

    private Category impact(String text, List<String> lines) {
        List<Finding> issues = new ArrayList<>();
        List<Finding> strong = new ArrayList<>();
        Set<String> seenVerbs = new LinkedHashSet<>();
        int strongBullets = 0;
        for (String line : lines) {
            String body = ResumeTextUtil.stripBullet(line);
            if (body.isEmpty()) {
                continue;
            }
            String bodyLower = body.toLowerCase(Locale.ROOT);
            String weakHit = null;
            for (String weak : Lexicon.WEAK_STARTERS.terms()) {
                if (bodyLower.startsWith(weak)) {
                    weakHit = weak;
                    break;
                }
            }
            if (weakHit != null) {
                issues.add(new Finding("bad", body.substring(0, Math.min(weakHit.length(), body.length())),
                        "Bullet opens with the weak phrase \"" + weakHit + "\".",
                        "Start with a strong action verb (e.g. Led, Built, Reduced, Automated)."));
            } else {
                String verb = ResumeTextUtil.firstWord(body);
                if (Lexicon.ACTION_VERBS.contains(verb.toLowerCase(Locale.ROOT))) {
                    strongBullets++;
                    if (seenVerbs.add(verb.toLowerCase(Locale.ROOT))) {
                        strong.add(new Finding("good", verb,
                                "Strong action verb — \"" + verb + "\".",
                                "Great — this bullet leads with impact."));
                    }
                }
            }
        }

        int weakBullets = issues.size();
        int passive = 0;
        Matcher m = PASSIVE.matcher(text);
        while (m.find()) {
            passive++;
            issues.add(new Finding("warning", m.group(),
                    "Passive voice — \"" + m.group() + "\".",
                    "Rewrite in active voice led by the action you took."));
        }
        List<Finding> findings = new ArrayList<>();
        issues.stream().limit(MAX_FINDINGS).forEach(findings::add);
        strong.stream().limit(MAX_FINDINGS).forEach(findings::add);
        if (findings.isEmpty()) {
            findings.add(new Finding("good", "", "Bullets use strong, active phrasing.", "Keep leading with impact verbs."));
        }

        int total = weakBullets + strongBullets;
        int score = total == 0 ? 40 : Math.round(100f * strongBullets / total) - passive * 10;
        return category("impact", "Impact & Action Verbs", findings, "Lead every bullet with a strong action verb.", score);
    }

    private Category quantification(List<String> lines) {
        List<Finding> issues = new ArrayList<>();
        List<Finding> quantified = new ArrayList<>();
        for (String line : lines) {
            String body = ResumeTextUtil.stripBullet(line);
            if (!Lexicon.ACTION_VERBS.contains(ResumeTextUtil.firstWord(body).toLowerCase(Locale.ROOT))) {
                continue;
            }
            if (METRIC.matcher(body).find()) {
                quantified.add(new Finding("good", ResumeTextUtil.snippet(body, SNIPPET_CHARS),
                        "Quantified achievement — backed by a concrete metric.",
                        "Keep proving impact with numbers like this."));
            } else {
                issues.add(new Finding("warning", ResumeTextUtil.snippet(body, SNIPPET_CHARS),
                        "This achievement has no number to prove impact.",
                        "Add a metric — %, $, count, time saved, or scale."));
            }
        }
        int bullets = issues.size() + quantified.size();
        List<Finding> findings = new ArrayList<>();
        issues.stream().limit(MAX_FINDINGS).forEach(findings::add);
        quantified.stream().limit(MAX_FINDINGS).forEach(findings::add);
        if (bullets == 0) {
            findings.add(new Finding("bad", "", "No quantified achievements detected.",
                    "Add figures (%, $, counts, time saved) to demonstrate measurable impact."));
        }
        String ok = bullets > 0
                ? quantified.size() + " of " + bullets + " achievements are quantified — nice."
                : "Quantify impact wherever possible.";

        int score = bullets == 0 ? 20 : Math.round(100f * quantified.size() / bullets);
        return category("quantification", "Quantification", findings, ok, score);
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
        List<Finding> findings = new ArrayList<>();
        int words = 0;
        int sentences = 0;
        for (String line : ResumeTextUtil.sentences(text)) {
            String body = ResumeTextUtil.stripBullet(line);
            int w = ResumeTextUtil.countWords(body);
            if (w == 0) {
                continue;
            }
            words += w;
            sentences++;
            if (w > DENSE_SENTENCE_WORDS && findings.size() < MAX_FINDINGS) {
                findings.add(new Finding("warning", ResumeTextUtil.snippet(body, SNIPPET_CHARS),
                        "This sentence runs ~" + w + " words — dense to read.",
                        "Tighten to a single idea under ~20 words."));
            }
        }
        int avg = sentences == 0 ? 0 : Math.round((float) words / sentences);
        return category("readability", "Readability", findings,
                "Easy to scan — averaging ~" + avg + " words per sentence.");
    }

    private Category dates(String text) {
        List<Finding> findings = new ArrayList<>();
        Set<String> seen = new LinkedHashSet<>();
        Matcher m = YEAR.matcher(text);
        while (m.find() && findings.size() < MAX_FINDINGS) {
            if (seen.add(m.group())) {
                findings.add(new Finding("good", m.group(),
                        "Date present — \"" + m.group() + "\".",
                        "Good — the timeline is clear."));
            }
        }
        boolean hasDates = !seen.isEmpty();
        if (!hasDates) {
            findings.add(new Finding("warning", "", "No dates detected.",
                    "Add start/end dates (e.g. Jan 2022 – Present) so recruiters can gauge tenure."));
        }
        return category("dates", "Dates", findings, "Dates are present — good.", hasDates ? 100 : 40);
    }

    private Category sections(String lower, String text) {
        List<Finding> findings = new ArrayList<>();
        int score = 100;
        for (String section : List.of("experience", "education", "skills")) {
            if (!lower.contains(section)) {
                score -= 30; // a missing core section is a serious ATS problem
                findings.add(new Finding("bad", "", "No \"" + section + "\" section detected.",
                        "Add a clearly labelled " + section + " section for ATS parsing."));
            }
        }
        Matcher email = EMAIL.matcher(text);
        if (email.find()) {
            findings.add(new Finding("good", email.group(), "Email present.", "Good — recruiters can reach you."));
        } else {
            score -= 25;
            findings.add(new Finding("bad", "", "No email address detected.",
                    "Add a professional email so recruiters can reach you."));
        }
        Matcher phone = PHONE.matcher(text);
        if (phone.find()) {
            findings.add(new Finding("good", phone.group().trim(), "Phone number present.", "Good — direct contact is available."));
        } else {
            score -= 12;
            findings.add(new Finding("warning", "", "No phone number detected.", "Add a phone number to your header."));
        }
        Matcher link = LINK.matcher(text);
        if (link.find()) {
            findings.add(new Finding("good", contactToken(text, link.start()),
                    "Profile/portfolio link present.", "Good — this adds credibility."));
        } else {
            score -= 12;
            findings.add(new Finding("warning", "", "No LinkedIn/GitHub/portfolio link detected.",
                    "Add a relevant profile or portfolio link."));
        }
        return category("sections", "Sections & Contact", findings, "Core sections and contact details are present.", score);
    }

    private String contactToken(String text, int idx) {
        int start = idx;
        int end = idx;
        while (start > 0 && !Character.isWhitespace(text.charAt(start - 1))) {
            start--;
        }
        while (end < text.length() && !Character.isWhitespace(text.charAt(end))) {
            end++;
        }
        return text.substring(start, end);
    }

    private Category length(String text) {
        int words = ResumeTextUtil.countWords(text);
        List<Finding> findings = new ArrayList<>();
        int score = 100;
        if (words < MIN_WORDS) {
            score = Math.round(100f * words / MIN_WORDS);
            findings.add(new Finding("warning", "", "The resume is short (~" + words + " words).",
                    "Expand with more detail on impact and responsibilities."));
        } else if (words > MAX_WORDS) {
            score = ResumeTextUtil.clamp(100 - Math.round(100f * (words - MAX_WORDS) / MAX_WORDS), 0, 100);
            findings.add(new Finding("warning", "", "The resume is long (~" + words + " words).",
                    "Trim to the most relevant, recent, high-impact content (aim for one page)."));
        }
        return category("length", "Length", findings, "Appropriately sized (~" + words + " words).", score);
    }

    // ---------------- Shared builders ----------------

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

    private int problemCount(List<Finding> findings) {
        return (int) findings.stream()
                .filter(f -> "bad".equals(f.severity()) || "warning".equals(f.severity()))
                .count();
    }

    private Category category(String key, String label, List<Finding> findings, String okSummary) {
        return category(key, label, findings, okSummary,
                ResumeTextUtil.clamp(100 - problemCount(findings) * PENALTY_PER_ISSUE, 0, 100));
    }

    private Category category(String key, String label, List<Finding> findings, String okSummary, int score) {
        int problems = problemCount(findings);
        String status = score >= 80 ? "good" : score >= 55 ? "warning" : "bad";
        String summary = problems == 0 ? okSummary : problems + " issue" + (problems == 1 ? "" : "s") + " found.";
        return new Category(key, label, ResumeTextUtil.clamp(score, 0, 100), status, summary, findings);
    }

    private int overallScore(List<Category> categories) {
        double weighted = 0;
        double totalWeight = 0;
        for (Category c : categories) {
            double w = CATEGORY_WEIGHTS.getOrDefault(c.key(), 1.0);
            weighted += c.score() * w;
            totalWeight += w;
        }
        if (totalWeight == 0) {
            return 0;
        }
        return ResumeTextUtil.clamp((int) Math.round(weighted / totalWeight), 0, 100);
    }
}
