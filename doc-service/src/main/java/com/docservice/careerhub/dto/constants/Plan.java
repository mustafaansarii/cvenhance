package com.docservice.careerhub.dto.constants;


public enum Plan {
    BASIC(99.0, 1, 1),
    STANDARD(199.0, 5, 2),
    UNLIMITED(399.0, null, 3);

    private final double priceInr;
    private final Integer credits;
    private final int level;

    Plan(double priceInr, Integer credits, int level) {
        this.priceInr = priceInr;
        this.credits = credits;
        this.level = level;
    }

    public double getPriceInr() {
        return priceInr;
    }

    public Integer getCredits() {
        return credits;
    }

    public int getLevel() {
        return level;
    }

    public boolean isUnlimited() {
        return credits == null;
    }
}
