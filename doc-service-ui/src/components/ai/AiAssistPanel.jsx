import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import aiService from '../../services/ai.service';

const CHIPS = [
    { label: 'Improve for ATS', prompt: 'Rewrite this to be ATS-friendly, concise, and quantified.' },
    { label: 'Make concise', prompt: 'Make this shorter and punchier without losing meaning.' },
    { label: 'Add metrics', prompt: 'Rephrase to highlight measurable impact and numbers.' },
    { label: 'Fix grammar', prompt: 'Fix grammar and spelling; keep the meaning.' },
];

/**
 * Shared AI writing assistant. `onAccept(text)` receives the chosen suggestion; the parent decides
 * how to write it back (contentEditable input-dispatch in the form builder, executeEdits in Monaco).
 */
export default function AiAssistPanel({ open, section, currentText = '', format = 'plain', onAccept, onClose, onPaymentRequired }) {
    const [instruction, setInstruction] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null); // { questions:[], suggestions:[] }
    const [answers, setAnswers] = useState([]);

    useEffect(() => {
        if (!open) return undefined;
        setInstruction('');
        setResult(null);
        setAnswers([]);
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

    const hasText = !!(currentText && currentText.trim());
    const suggestions = result?.suggestions || [];
    const questions = result?.questions || [];

    return (
        <div className="no-print fixed inset-0 z-[100002] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
            <div className="flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl" onClick={(e) => e.stopPropagation()}>
                <div className="flex items-center justify-between border-b border-border px-5 py-3.5">
                    <div className="flex items-center gap-2">
                        <span className="text-accent">✨</span>
                        <h3 className="text-sm font-bold text-foreground">AI assistant{section ? ` — ${section}` : ''}</h3>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground transition hover:bg-muted hover:text-foreground">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
                    {hasText && (
                        <div>
                            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Current text</p>
                            <p className="max-h-24 overflow-y-auto whitespace-pre-wrap rounded-lg border border-border bg-muted/40 p-2.5 text-xs text-muted-foreground">{currentText}</p>
                        </div>
                    )}

                    {/* Prompt + quick chips */}
                    {questions.length === 0 && (
                        <>
                            <div className="flex flex-wrap gap-1.5">
                                {CHIPS.map((c) => (
                                    <button key={c.label} disabled={loading} onClick={() => { setInstruction(c.prompt); run(c.prompt); }}
                                        className="rounded-full border border-border px-2.5 py-1 text-xs font-medium text-muted-foreground transition hover:border-accent hover:text-accent disabled:opacity-50">
                                        {c.label}
                                    </button>
                                ))}
                            </div>
                            <div>
                                <textarea value={instruction} onChange={(e) => setInstruction(e.target.value)} rows={2}
                                    placeholder={hasText ? 'Tell the AI what to change (optional)…' : 'Describe what you want to write…'}
                                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" />
                                <div className="mt-2">
                                    <button onClick={() => run()} disabled={loading}
                                        className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60">
                                        {loading ? 'Thinking…' : hasText ? 'Improve with AI' : 'Help me write'}
                                    </button>
                                </div>
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
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" />
                                </div>
                            ))}
                            <button onClick={submitAnswers} disabled={loading}
                                className="w-full rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60">
                                {loading ? 'Generating…' : 'Generate'}
                            </button>
                        </div>
                    )}

                    {/* Suggestions */}
                    {suggestions.length > 0 && (
                        <div className="space-y-2">
                            <p className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Suggestions</p>
                            {suggestions.map((s, i) => (
                                <div key={i} className="rounded-lg border border-border p-3">
                                    <p className="whitespace-pre-wrap text-sm text-foreground">{s}</p>
                                    <button onClick={() => { onAccept?.(s); onClose?.(); }}
                                        className="mt-2 rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/20">
                                        Use this
                                    </button>
                                </div>
                            ))}
                            <button onClick={() => run()} disabled={loading}
                                className="w-full rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-60">
                                {loading ? 'Regenerating…' : 'Regenerate'}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
