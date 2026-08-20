package com.docservice.careerhub.dto.constants;

import java.util.List;
import java.util.Locale;
import java.util.Set;


public enum Lexicon {

    ACTION_VERBS(
            "developed", "built", "implemented", "managed", "created", "designed", "led", "improved",
            "worked", "handled", "made", "used", "engineered", "architected", "optimized", "reduced",
            "increased", "launched", "delivered", "automated", "integrated", "migrated", "refactored",
            "deployed", "maintained", "analyzed", "researched", "collaborated", "coordinated",
            "spearheaded", "drove", "owned", "shipped", "scaled", "streamlined", "enhanced", "resolved",
            "debugged", "tested", "documented", "mentored", "reviewed", "achieved", "generated"),

    WEAK_STARTERS(
            "responsible for", "worked on", "helped to", "helped with", "helped", "assisted with",
            "assisted in", "assisted", "involved in", "participated in", "duties included",
            "tasks included", "in charge of", "contributed to", "aided", "supported"),

    BUZZWORDS(
            "results-driven", "team player", "hardworking", "hard-working", "dynamic", "detail-oriented",
            "self-motivated", "go-getter", "think outside the box", "synergy", "proven track record",
            "go-to person", "hit the ground running", "value add", "best of breed", "results-oriented"),

    FILLERS(
            "various", "several", "a variety of", "a number of", "successfully", "effectively",
            "efficiently", "basically", "actually", "really", "extremely", "things", "stuff"),

    STOPWORDS(
            "and", "the", "for", "with", "you", "our", "are", "will", "have", "this", "that", "from",
            "your", "who", "all", "any", "must", "should", "able", "job", "role", "team", "work",
            "experience", "years", "including", "etc", "strong", "good", "plus", "using", "into");

    private final List<String> terms;
    private final Set<String> set;

    Lexicon(String... terms) {
        this.terms = List.of(terms);
        this.set = Set.of(terms);
    }

    public List<String> terms() {
        return terms;
    }

    public Set<String> asSet() {
        return set;
    }

    public boolean contains(String token) {
        return token != null && set.contains(token.toLowerCase(Locale.ROOT));
    }
}
