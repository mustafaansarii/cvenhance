package com.docservice.careerhub.util;

import java.security.SecureRandom;

/** Generates numeric one-time passwords. */
public final class OtpGenerator {

    private static final SecureRandom RANDOM = new SecureRandom();
    private static final int SIX_DIGIT_BOUND = 1_000_000;

    private OtpGenerator() {
    }

    /** Returns a zero-padded 6-digit OTP, e.g. "004217". */
    public static String sixDigit() {
        return String.format("%06d", RANDOM.nextInt(SIX_DIGIT_BOUND));
    }
}
