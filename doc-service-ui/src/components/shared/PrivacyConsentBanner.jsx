import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheckIcon } from '@heroicons/react/24/outline';

const CONSENT_KEY = 'cvenhance.privacyConsent';
const POLICY_VERSION = '2026-08-14';

function hasAcceptedCurrentPolicy() {
    try {
        const stored = localStorage.getItem(CONSENT_KEY);
        return stored ? JSON.parse(stored).version === POLICY_VERSION : false;
    } catch {
        return false;
    }
}

export default function PrivacyConsentBanner() {
    const [visible, setVisible] = useState(() => !hasAcceptedCurrentPolicy());

    const accept = () => {
        localStorage.setItem(CONSENT_KEY, JSON.stringify({
            version: POLICY_VERSION,
            acceptedAt: new Date().toISOString(),
        }));
        setVisible(false);
    };

    if (!visible) return null;

    return (
        <aside className="fixed inset-x-0 bottom-0 z-50 border-t-2 border-accent bg-background/95 px-4 py-4 shadow-[0_-10px_30px_rgba(15,23,42,0.12)] backdrop-blur-md sm:px-6">
            <div className="mx-auto flex max-w-6xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-start gap-3">
                    <div className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center border border-accent/25 bg-accent/10 text-accent">
                        <ShieldCheckIcon className="h-4 w-4" aria-hidden="true" />
                    </div>
                    <div className="min-w-0">
                        <p className="mb-0.5 text-xs font-bold uppercase tracking-wide text-foreground">Your privacy</p>
                        <p className="max-w-4xl text-sm leading-5 text-muted-foreground">
                            We use cookies and similar technologies to improve your experience, analyze site usage, and personalize content. By continuing to use our website, you agree to our{' '}
                            <Link to="/privacy-policy" className="font-semibold text-accent underline decoration-accent/40 underline-offset-2 transition hover:text-accent-hover hover:decoration-accent">Privacy Policy</Link>.
                        </p>
                    </div>
                </div>
                <button type="button" onClick={accept} className="inline-flex h-10 shrink-0 items-center justify-center border border-accent bg-accent px-5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2">
                    Accept
                </button>
            </div>
        </aside>
    );
}
