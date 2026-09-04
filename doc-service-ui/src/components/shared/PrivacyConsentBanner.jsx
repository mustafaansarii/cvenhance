import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon, XMarkIcon } from '@heroicons/react/24/outline';

const CONSENT_KEY = 'cvenhance.privacyConsent';
const POLICY_VERSION = '2026-09-04';

function loadConsent() {
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        if (!stored) return null;
        const parsed = JSON.parse(stored);
        return parsed.version === POLICY_VERSION ? parsed : null;
    } catch {
        return null;
    }
}

function saveConsent(accepted) {
    localStorage.setItem(
        CONSENT_KEY,
        JSON.stringify({
            version: POLICY_VERSION,
            accepted,
            respondedAt: new Date().toISOString(),
        }),
    );
}

export default function PrivacyConsentBanner() {
    const [visible, setVisible] = useState(() => loadConsent() === null);

    const handleAccept = () => {
        saveConsent(true);
        setVisible(false);
    };

    const handleDecline = () => {
        saveConsent(false);
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <aside
            role="dialog"
            aria-label="Privacy consent"
            className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card/98 px-4 py-5 shadow-[0_-8px_30px_rgba(0,0,0,0.12)] backdrop-blur-xl sm:px-6"
        >
            <div className="mx-auto flex max-w-5xl flex-col gap-5 sm:flex-row sm:items-start sm:gap-6">
                {/* Icon + Content */}
                <div className="flex min-w-0 flex-1 items-start gap-3">
                    <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-accent/20 bg-accent/10 text-accent">
                        <ShieldCheckIcon className="h-5 w-5" aria-hidden="true" />
                    </div>

                    <div className="min-w-0">
                        <p className="text-sm font-bold text-foreground">
                            We value your privacy
                        </p>
                        <p className="mt-1 text-sm leading-relaxed text-muted-foreground">
                            We use essential cookies to keep you signed in and protect your account.
                            Your profile and resume data is encrypted using{' '}
                            <strong className="text-foreground">AES-256 encryption</strong> and never
                            shared with advertisers. Read our{' '}
                            <Link
                                to="/privacy-policy"
                                className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:text-accent-hover hover:decoration-accent"
                            >
                                Privacy Policy
                            </Link>{' '}
                            and{' '}
                            <Link
                                to="/terms"
                                className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:text-accent-hover hover:decoration-accent"
                            >
                                Terms & Conditions
                            </Link>{' '}
                            for full details.
                        </p>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex shrink-0 items-center gap-3 sm:mt-0.5">
                    <button
                        type="button"
                        onClick={handleDecline}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-border px-4 text-sm font-medium text-muted-foreground transition hover:border-foreground/20 hover:text-foreground focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    >
                        Decline
                    </button>
                    <button
                        type="button"
                        onClick={handleAccept}
                        className="inline-flex h-10 items-center justify-center rounded-lg border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2"
                    >
                        Accept All
                    </button>
                </div>

                {/* Close button (mobile-friendly dismiss) */}
                <button
                    type="button"
                    onClick={handleDecline}
                    className="absolute right-3 top-3 rounded-md p-1 text-muted-foreground transition hover:text-foreground sm:hidden"
                    aria-label="Dismiss"
                >
                    <XMarkIcon className="h-5 w-5" />
                </button>
            </div>
        </aside>
    );
}
