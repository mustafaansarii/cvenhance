import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import userService from '../../services/user.service';
import { textFromFile, MAX_UPLOAD_BYTES, MAX_PDF_PAGES, ResumeUploadError } from '../../utils/resumeText';

export default function ResumeUploadButton({
    label = 'Upload resume / CV',
    labelClassName = '',
    confirm,
    onDone,
    className,
    icon,
}) {
    const inputRef = useRef(null);
    const [busy, setBusy] = useState(false);
    const [open, setOpen] = useState(false);
    const [reading, setReading] = useState(false);
    const [fileName, setFileName] = useState('');
    const [fileText, setFileText] = useState('');
    const [jd, setJd] = useState('');

    const openDialog = () => {
        setFileName(''); setFileText(''); setJd('');
        setOpen(true);
    };

    const onChange = async (e) => {
        const file = e.target.files?.[0];
        e.target.value = '';
        if (!file) return;
        if (file.size > MAX_UPLOAD_BYTES) {
            toast.error('File is too large. Please upload a resume under 5 MB.');
            return;
        }
        setReading(true);
        try {
            const text = await textFromFile(file);
            if (!text || !text.trim()) {
                toast.error("Couldn't read any text. Try a text-based PDF or a DOCX.");
                return;
            }
            setFileText(text.trim());
            setFileName(file.name);
        } catch (err) {
            toast.error(err instanceof ResumeUploadError ? err.message : 'Failed to read that file. Try a text-based PDF or a DOCX.');
        } finally {
            setReading(false);
        }
    };

    const submit = async () => {
        if (!fileText && !jd.trim()) {
            toast.error('Upload a resume or paste a job description.');
            return;
        }
        setOpen(false);
        setBusy(true);
        const tailoring = !!jd.trim();
        const id = toast.loading(tailoring ? 'Tailoring to the job…' : 'Importing your resume…');
        try {
            const profile = await userService.importResume(fileText, jd.trim());
            toast.success('Resume updated', { id });
            onDone?.(profile);
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to update resume', { id });
        } finally {
            setBusy(false);
        }
    };

    useEffect(() => {
        if (!open) return undefined;
        const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [open]);

    const canSubmit = !!fileText || !!jd.trim();

    return (
        <>
            <input ref={inputRef} type="file" accept=".pdf,.docx,.txt" className="hidden" onChange={onChange} />
            <button
                type="button"
                onClick={openDialog}
                disabled={busy}
                className={className || 'inline-flex items-center gap-1.5 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent transition hover:bg-accent/10 disabled:opacity-60'}
            >
                {icon || (
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0"><path strokeLinecap="round" strokeLinejoin="round" d="M12 16V4m0 0L8 8m4-4l4 4M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2" /></svg>
                )}
                <span className={labelClassName}>{busy ? 'Working…' : label}</span>
            </button>

            {open && (
                <div
                    className="no-print fixed inset-0 z-[100001] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm"
                    onClick={() => setOpen(false)}
                    role="dialog"
                    aria-modal="true"
                >
                    <div
                        className="w-full max-w-md overflow-hidden rounded-2xl border border-border bg-card shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="px-6 pt-6">
                            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-full bg-accent/10 text-accent">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M14 3v4a1 1 0 0 0 1 1h4M5 3h9l5 5v13a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" /></svg>
                            </div>
                            <h3 className="text-lg font-bold text-foreground">Auto-fill your resume</h3>
                            <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
                                {typeof confirm === 'string'
                                    ? confirm
                                    : 'Give a resume file, a job description, or both. This replaces the details currently on screen.'}
                            </p>

                            {/* Resume file (optional) */}
                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                    Resume file <span className="font-normal text-muted-foreground">(optional)</span>
                                </label>
                                <div className="flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => inputRef.current?.click()}
                                        disabled={reading}
                                        className="shrink-0 rounded-lg border border-border px-3 py-2 text-sm font-semibold text-foreground transition hover:bg-muted disabled:opacity-60"
                                    >
                                        {reading ? 'Reading…' : 'Choose file'}
                                    </button>
                                    <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                                        {fileName || `PDF, DOCX or TXT · under 5 MB · max ${MAX_PDF_PAGES} pages`}
                                    </span>
                                    {fileText && !reading && (
                                        <button
                                            type="button"
                                            onClick={() => { setFileText(''); setFileName(''); }}
                                            className="shrink-0 text-xs font-semibold text-muted-foreground hover:text-foreground"
                                        >
                                            Remove
                                        </button>
                                    )}
                                </div>
                            </div>

                            {/* Job description (optional) */}
                            <div className="mt-4">
                                <label className="mb-1.5 block text-sm font-semibold text-foreground">
                                    Tell us what you'd like to update, or share a job description <span className="font-normal text-muted-foreground">(optional)</span>
                                </label>
                                <textarea
                                    value={jd}
                                    onChange={(e) => setJd(e.target.value)}
                                    rows={5}
                                    placeholder="Paste the job description to tailor your resume to it with AI…"
                                    className="w-full resize-y rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/20"
                                />
                                <p className="mt-1 text-xs text-muted-foreground">
                                    {!fileText && jd.trim()
                                        ? 'AI will tailor your existing resume data to this job — without inventing anything.'
                                        : 'When provided, AI reorders and rephrases your content to match — without inventing anything.'}
                                </p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end gap-2.5 border-t border-border bg-muted/40 px-6 py-4">
                            <button
                                type="button"
                                onClick={() => setOpen(false)}
                                className="rounded-lg px-4 py-2 text-sm font-semibold text-muted-foreground transition hover:bg-muted"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={submit}
                                disabled={!canSubmit || reading}
                                className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover disabled:opacity-50"
                            >
                                {jd.trim() ? 'Tailor & auto-fill' : 'Auto-fill'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
