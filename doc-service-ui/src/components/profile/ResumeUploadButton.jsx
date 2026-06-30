import { useRef, useState } from 'react';
import toast from 'react-hot-toast';
import userService from '../../services/user.service';
import ConfirmDialog from '../shared/ConfirmDialog';

export default function ResumeUploadButton({ label = 'Upload resume / CV', labelClassName = '', confirm, onDone, className }) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [confirming, setConfirming] = useState(false);

    const pick = () => {
        if (confirm) { setConfirming(true); return; }
        inputRef.current?.click();
    };

    const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

    const onChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > MAX_BYTES) {
            toast.error('File is too large. Please upload a resume under 2 MB.');
            return;
        }
        setBusy(true);
        const id = toast.loading('Reading your resume…');
        try {
            const profile = await userService.importResume(file);
            toast.success('Resume imported', { id });
            onDone?.(profile);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to import resume', { id });
        } finally {
            setBusy(false);
        }
    };

    return (
        <>
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={onChange} />
            <button
                type="button"
                onClick={pick}
                disabled={busy}
                className={className || 'inline-flex items-center gap-1.5 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-60'}
            >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                <span className={labelClassName}>{busy ? 'Reading…' : label}</span>
            </button>
            <ConfirmDialog
                open={confirming}
                title="Auto-fill your resume?"
                message={typeof confirm === 'string' ? confirm : "We'll read your uploaded file and automatically fill in your resume details for you. This replaces what's currently filled in."}
                confirmLabel="Auto-fill"
                cancelLabel="Cancel"
                onCancel={() => setConfirming(false)}
                onConfirm={() => { setConfirming(false); inputRef.current?.click(); }}
            />
        </>
    );
}
