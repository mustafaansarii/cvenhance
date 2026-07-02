import { useState } from 'react';
import toast from 'react-hot-toast';
import { isInAppBrowser, isAndroid, openInSystemBrowser } from '../../utils/inAppBrowser';

export default function InAppBrowserNotice() {
    const [inApp] = useState(() => isInAppBrowser());
    if (!inApp) return null;

    const copyLink = async () => {
        try {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link copied — paste it in Chrome or Safari');
        } catch {
            toast.error('Could not copy the link');
        }
    };

    const openBrowser = () => {
        if (!openInSystemBrowser()) copyLink();
    };

    return (
        <div className="mb-4 rounded-xl border border-amber-300 bg-amber-50 p-3.5 text-sm text-amber-900">
            <p className="font-semibold">Google sign-in won’t work in this in-app browser</p>
            <p className="mt-1 text-amber-800">
                You opened this from another app. Open <span className="font-medium">cvenhance.in</span> in
                Chrome or Safari to sign in with Google — or use your email and password below.
            </p>
            <button
                type="button"
                onClick={openBrowser}
                className="mt-2.5 inline-flex items-center gap-1.5 rounded-lg bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-amber-700"
            >
                {isAndroid() ? 'Open in Chrome' : 'Copy link for your browser'}
            </button>
        </div>
    );
}
