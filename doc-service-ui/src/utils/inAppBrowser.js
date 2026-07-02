const IN_APP_PATTERNS = [
    'FBAN', 'FBAV', 'FB_IAB',
    'Instagram',
    'LinkedInApp',
    'Line/',
    'Twitter',
    'WhatsApp',
    'Snapchat',
    'Pinterest',
    'MicroMessenger',          
    'GSA/',               
    '; wv)',
];

export function isInAppBrowser() {
    if (typeof navigator === 'undefined') return false;
    const ua = navigator.userAgent || '';
    return IN_APP_PATTERNS.some((token) => ua.includes(token));
}

export function isAndroid() {
    return typeof navigator !== 'undefined' && /Android/i.test(navigator.userAgent || '');
}

export function isIOS() {
    return typeof navigator !== 'undefined' && /iPhone|iPad|iPod/i.test(navigator.userAgent || '');
}


export function openInSystemBrowser() {
    const { host, pathname, search, hash } = window.location;
    if (isAndroid()) {
        const intentUrl = `intent://${host}${pathname}${search}${hash}#Intent;scheme=https;package=com.android.chrome;end`;
        window.location.href = intentUrl;
        return true;
    }
    return false;
}
