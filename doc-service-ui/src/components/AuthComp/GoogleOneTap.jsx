import { useEffect } from 'react';
import authService from '../../services/auth.service';

const GSI_SRC = 'https://accounts.google.com/gsi/client';
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function loadGsi() {
    return new Promise((resolve, reject) => {
        if (window.google?.accounts?.id) { resolve(); return; }
        const existing = document.querySelector(`script[src="${GSI_SRC}"]`);
        if (existing) {
            existing.addEventListener('load', () => resolve());
            existing.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.src = GSI_SRC;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve();
        script.onerror = reject;
        document.head.appendChild(script);
    });
}


export default function GoogleOneTap() {
    useEffect(() => {
        if (!CLIENT_ID || authService.isAuthenticated()) return undefined;

        let cancelled = false;
        loadGsi()
            .then(() => {
                if (cancelled || !window.google?.accounts?.id) return;
                window.google.accounts.id.initialize({
                    client_id: CLIENT_ID,
                    callback: () => authService.loginWithProvider('google'),
                    auto_select: false,
                    cancel_on_tap_outside: true,
                    use_fedcm_for_prompt: true,
                });
                window.google.accounts.id.prompt();
            })
            .catch(() => { /* GSI failed to load — silently skip One Tap */ });

        return () => {
            cancelled = true;
            try { window.google?.accounts?.id?.cancel(); } catch { /* ignore */ }
        };
    }, []);

    return null;
}
