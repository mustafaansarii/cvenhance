package com.docservice.careerhub.dto.response;

/**
 * What the current user is entitled to. {@code creditsRemaining} uses -1 to mean unlimited and 0 for
 * a free (or expired) user. {@code validUntil} is an ISO-8601 instant string, or null when not applicable.
 */
public record EntitlementResponse(
        String plan,
        boolean active,
        boolean unlimited,
        int creditsRemaining,
        String validUntil
) {

    public static final int UNLIMITED_CREDITS = -1;

    public static EntitlementResponse free() {
        return new EntitlementResponse("FREE", false, false, 0, null);
    }

    public static EntitlementResponse unlimited(String plan) {
        return new EntitlementResponse(plan, true, true, UNLIMITED_CREDITS, null);
    }
}
