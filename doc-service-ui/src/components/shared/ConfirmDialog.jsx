import { useEffect } from 'react';

export default function ConfirmDialog({
    open,
    title = 'Are you sure?',
    message,
    confirmLabel = 'Confirm',
    cancelLabel = 'Cancel',
    tone = 'accent', // 'accent' | 'danger'
    onConfirm,
    onCancel,
}) {
    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') onCancel?.(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [open, onCancel]);

    if (!open) return null;

    const confirmCls = tone === 'danger'
        ? 'bg-red-600 text-white hover:bg-red-700'
        : 'bg-accent text-accent-foreground hover:bg-accent-hover';

    return (
        <div
            className="no-print fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
            onClick={onCancel}
            role="dialog"
            aria-modal="true"
        >
            <div
                className="w-full max-w-sm overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="px-6 pt-6">
                    <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z" /></svg>
                    </div>
                    <h3 className="text-lg font-bold text-foreground">{title}</h3>
                    {message && <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{message}</p>}
                </div>
                <div className="mt-6 flex justify-end gap-2.5 border-t border-border bg-muted/40 px-6 py-4">
                    <button
                        type="button"
                        onClick={onCancel}
                        className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
                    >
                        {cancelLabel}
                    </button>
                    <button
                        type="button"
                        onClick={onConfirm}
                        className={`rounded-lg px-4 py-2 text-sm font-semibold shadow-sm transition ${confirmCls}`}
                    >
                        {confirmLabel}
                    </button>
                </div>
            </div>
        </div>
    );
}
