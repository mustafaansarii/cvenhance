import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import {
    SparklesIcon, XMarkIcon, ClipboardDocumentIcon, CheckIcon, ArrowPathIcon, ArrowUturnLeftIcon,
} from '@heroicons/react/24/outline';
import aiService from '../../services/ai.service';

const CHIPS = [
    { label: 'Improve for ATS', prompt: 'Rewrite this to be ATS-friendly, concise, and quantified.' },
    { label: 'Make concise', prompt: 'Make this shorter and punchier without losing meaning.' },
    { label: 'Add metrics', prompt: 'Rephrase to highlight measurable impact and numbers.' },
    { label: 'Fix grammar', prompt: 'Fix grammar and spelling; keep the meaning.' },
];

/**
 * Shared AI writing assistant. `onAccept(text)` receives the chosen suggestion; the parent decides
 * how to write it back (input-dispatch in the form builder, executeEdits in Monaco, or copy).
 */
export default function AiAssistPanel({ open, section, currentText = '', format = 'plain', onAccept, onClose, onPaymentRequired }) {
    const [instruction, setInstruction] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { questions:[], suggestions:[] }
    const [answers, setAnswers] = useState([]);
    const [copied, setCopied] = useState(-1);

    useEffect(() => {
        if (!open) return undefined;
        setInstruction('');
        setResult(null);
        setAnswers([]);
        setCopied(-1);
        const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
        document.addEventListener('keydown', onKey);
        const prev = document.body.style.overflow;
        document.body.style.overflow = 'hidden';
        return () => { document.removeEventListener('keydown', onKey); document.body.style.overflow = prev; };
    }, [open, onClose]);

    if (!open) return null;

    const run = async (extraInstruction, qaAnswers) => {
        setLoading(true);
        try {
            const res = await aiService.assist({
                section,
                currentText,
                format,
                instruction: extraInstruction ?? instruction,
                answers: qaAnswers,
            });
            const questions = res?.questions || [];
            const suggestions = res?.suggestions || [];
            setResult({ questions, suggestions });
            if (questions.length) setAnswers(questions.map(() => ''));
        } catch (err) {
            if (err?.response?.status === 402) {
                toast.error(err?.response?.data?.message || 'Subscribe to a plan to use the AI writing assistant.');
                onClose?.();
                onPaymentRequired?.();
            } else {
                toast.error(err?.response?.data?.message || 'AI request failed. Please try again.');
            }
        } finally {
            setLoading(false);
        }
    };

    const submitAnswers = () => {
        const qa = result.questions.map((q, i) => ({ question: q, answer: answers[i] || '' }));
        run(instruction, qa);
    };

    const copy = async (text, i) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopied(i);
            toast.success('Copied to clipboard');
            setTimeout(() => setCopied((c) => (c === i ? -1 : c)), 1500);
        } catch {
            toast.error('Could not copy');
        }
    };

    const hasText = !!(currentText && currentText.trim());
    const suggestions = result?.suggestions || [];
    const questions = result?.questions || [];

    return (
        <div className="no-print fixed inset-0 z-[100002] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm"
            onClick={onClose} role="dialog" aria-modal="true">
            <div className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden border border-border border-t-2 border-t-accent bg-card shadow-2xl"
                onClick={(e) => e.stopPropagation()}>
                {/* Header */}
                <div className="flex items-center justify-between border-b border-border bg-muted/30 px-5 py-3">
                    <div className="flex items-center gap-2">
                        <SparklesIcon className="h-4 w-4 text-accent" />
                        <h3 className="text-sm font-bold text-foreground">Magic Writer{section ? ` · ${section}` : ''}</h3>
                    </div>
                    <button onClick={onClose} aria-label="Close"
                        className="p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                        <XMarkIcon className="h-4 w-4" />
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                    {hasText && (
                        <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current text</p>
                            <p className="max-h-28 overflow-y-auto whitespace-pre-wrap border-l-2 border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">{currentText}</p>
                        </div>
                    )}

                    {/* Prompt + quick chips */}
                    {questions.length === 0 && (
                        <>
                            <div className="flex flex-wrap gap-1.5">
                                {CHIPS.map((c) => (
                                    <button key={c.label} disabled={loading} onClick={() => { setInstruction(c.prompt); run(c.prompt); }}
                                        className="border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-50">
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={2}
                                    placeholder={hasText ? 'Tell the AI what to change (optional)…' : 'Describe what you want to write…'}
                                    className="w-full resize-none border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
                                <button onClick={() => run()} disabled={loading}
                                    className="mt-2 flex w-full items-center justify-center gap-2 bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60">
                                    <SparklesIcon className="h-4 w-4" />
                                    {loading ? 'Thinking…' : hasText ? 'Improve with AI' : 'Help me write'}
                                </button>
                            </div>
                        </>
                    )}

                    {/* Clarifying questions */}
                    {questions.length > 0 && (
                        <div className="space-y-3">
                            <p className="text-xs text-muted-foreground">Answer a couple of quick questions so the AI can write this well:</p>
                            {questions.map((q, i) => (
                                <div key={i}>
                                    <label className="mb-1 block text-sm font-medium text-foreground">{q}</label>
                                    <input value={answers[i] || ''} onChange={(e) => setAnswers((a) => a.map((v, j) => (j === i ? e.target.value : v)))}
                                        className="w-full border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-1 focus:ring-accent" />
                                </div>
                            ))}
                            <button onClick={submitAnswers} disabled={loading}
                                className="w-full bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60">
                                {loading ? 'Generating…' : 'Generate'}
                            </button>
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="space-y-2.5">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Suggestions</p>
                            {suggestions.map((s, i) => (
                                <div key={i} className="border border-border border-l-2 border-l-accent bg-background">
                                    <div className="flex items-start justify-between gap-2 p-3">
                                        <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm text-foreground">{s}</p>
                                        <button onClick={() => copy(s, i)} title="Copy"
                                            className="shrink-0 p-1 text-muted-foreground transition hover:text-accent">
                                            {copied === i ? <CheckIcon className="h-4 w-4 text-emerald-500" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
                                        </button>
                                    </div>
                                    <div className="flex border-t border-border">
                                        <button onClick={() => copy(s, i)}
                                            className="flex flex-1 items-center justify-center gap-1.5 border-r border-border px-3 py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted hover:text-foreground">
                                            <ClipboardDocumentIcon className="h-3.5 w-3.5" /> Copy
                                        </button>
                                        <button onClick={() => { onAccept?.(s); onClose?.(); }}
                                            className="flex flex-1 items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold text-accent transition hover:bg-accent/10">
                                            <CheckIcon className="h-3.5 w-3.5" /> Use this
                                        </button>
                                    </div>
                                </div>
                            ))}
                            <button onClick={() => run()} disabled={loading}
                                className="flex w-full items-center justify-center gap-1.5 border border-border py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-60">
                                {loading ? <ArrowPathIcon className="h-3.5 w-3.5 animate-spin" /> : <ArrowUturnLeftIcon className="h-3.5 w-3.5" />}
                                {loading ? 'Regenerating…' : 'Regenerate'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
