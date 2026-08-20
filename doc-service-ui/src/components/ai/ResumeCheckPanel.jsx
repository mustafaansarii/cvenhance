import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import resumeCheckerService from '../../services/resumeChecker.service';

const SEVERITY_CHIP = {
    bad: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};
const STATUS_DOT = { good: 'bg-emerald-500', warning: 'bg-amber-500', bad: 'bg-red-500' };
const problemsOf = (c) => (c.findings || []).filter((f) => f.severity === 'bad' || f.severity === 'warning').length;
const scoreText = (s) => (s >= 80 ? 'text-emerald-500' : s >= 55 ? 'text-amber-500' : 'text-red-500');
const scoreBg = (s) => (s >= 80 ? 'bg-emerald-500' : s >= 55 ? 'bg-amber-500' : 'bg-red-500');
const scoreLabel = (s) => (s >= 80 ? 'Strong' : s >= 55 ? 'Needs work' : 'Weak');
const fmtDate = (iso) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Form-builder drawer: analyzes the current resume with the resume-check API and lists past runs. */
export default function ResumeCheckPanel({ open, resume, onClose, onPaymentRequired }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [activeKey, setActiveKey] = useState(null);
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    useEffect(() => {
        if (!open) return undefined;
        setResult(null); setError(null); setActiveKey(null);
        const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    useEffect(() => { if (open) refreshHistory(); }, [open]);

    if (!open) return null;

    function refreshHistory() {
        setHistoryLoading(true);
        resumeCheckerService.getHistory(0, 20)
            .then((page) => setHistory(page.content || []))
            .catch(() => setHistory([]))
            .finally(() => setHistoryLoading(false));
    }

    const buildResumeText = () => {
        const L = [];
        if (resume?.name) L.push(resume.name);
        if (resume?.title) L.push(resume.title);
        if (resume?.location) L.push(resume.location);
        if (resume?.phone) L.push(resume.phone);
        if (resume?.email) L.push(resume.email);
        if (resume?.linkedin || resume?.linkedinUrl) L.push(resume.linkedin || resume.linkedinUrl);
        if (resume?.github || resume?.githubUrl) L.push(resume.github || resume.githubUrl);
        if (resume?.summary) { L.push('\nSUMMARY'); L.push(resume.summary); }
        if (resume?.experience?.length) {
            L.push('\nEXPERIENCE');
            resume.experience.forEach((e) => {
                if (e.primary || e.secondary) L.push(`${e.primary || ''}${e.secondary ? ' — ' + e.secondary : ''}${e.period ? ' (' + e.period + ')' : ''}`);
                (e.bullets || []).forEach((b) => { if (b.text) L.push(`- ${b.text}`); });
            });
        }
        if (resume?.projects?.length) {
            L.push('\nPROJECTS');
            resume.projects.forEach((p) => {
                if (p.primary || p.secondary) L.push(`${p.primary || ''}${p.secondary ? ' — ' + p.secondary : ''}${p.period ? ' (' + p.period + ')' : ''}`);
                (p.bullets || []).forEach((b) => { if (b.text) L.push(`- ${b.text}`); });
            });
        }
        if (resume?.education?.length) {
            L.push('\nEDUCATION');
            resume.education.forEach((e) => {
                if (e.school || e.degree) L.push(`${e.school || ''}${e.degree ? ' — ' + e.degree : ''}${e.period ? ' (' + e.period + ')' : ''}`);
            });
        }
        if (resume?.skills?.length) {
            L.push('\nSKILLS');
            resume.skills.forEach((s) => { if (s.label || s.value) L.push(`${s.label || ''}${s.label && s.value ? ': ' : ''}${s.value || ''}`); });
        }
        ['courses', 'certifications'].forEach((t) => {
            if (resume?.[t]?.length) {
                L.push(`\n${t.toUpperCase()}`);
                resume[t].forEach((c) => { if (c.title || c.issuer) L.push(`${c.title || ''}${c.issuer ? ' — ' + c.issuer : ''}`); });
            }
        });
        ['achievements', 'awards', 'languages', 'publications', 'interests'].forEach((t) => {
            if (resume?.[t]?.length) {
                L.push(`\n${t.toUpperCase()}`);
                resume[t].forEach((it) => { if (it.text) L.push(`- ${it.text}`); });
            }
        });
        return L.filter(Boolean).join('\n');
    };

    const show = (res) => { setResult(res); setActiveKey(res?.categories?.[0]?.key || null); };

    const run = async () => {
        const resumeText = buildResumeText();
        if (!resumeText.trim()) { toast.error('Add some content to your resume first.'); return; }
        setLoading(true); setError(null);
        try {
            const res = await resumeCheckerService.checkResume({ resumeText });
            show(res);
            refreshHistory();
        } catch (err) {
            if (err?.response?.status === 402) {
                toast.error(err?.response?.data?.message || 'Subscribe to a plan to use the resume analyzer.');
                onClose?.(); onPaymentRequired?.();
            } else {
                const msg = err?.response?.data?.message || 'Analysis failed. Please try again.';
                setError(msg); toast.error(msg);
            }
        } finally { setLoading(false); }
    };

    const loadHistoryItem = async (id) => {
        setLoading(true); setError(null);
        try { show(await resumeCheckerService.getHistoryItem(id)); }
        catch (err) { const msg = err?.response?.data?.message || 'Could not load this analysis.'; setError(msg); toast.error(msg); }
        finally { setLoading(false); }
    };

    const categories = result?.categories || [];
    const active = categories.find((c) => c.key === activeKey) || null;

    return (
        <div className="no-print fixed right-0 top-14 bottom-0 z-40 w-80 max-w-[88vw] overflow-y-auto border-l border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Resume analysis</h3>
                <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* History */}
            <div className="mb-4">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">History</p>
                {historyLoading ? (
                    <div className="space-y-1.5">{[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />)}</div>
                ) : history.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No previous analyses. Run one below.</p>
                ) : (
                    <ul className="space-y-1.5">
                        {history.map((h) => (
                            <li key={h.id}>
                                <button onClick={() => loadHistoryItem(h.id)}
                                    className="flex w-full items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-left text-xs text-muted-foreground transition hover:border-accent hover:bg-accent/5">
                                    <span className="flex items-center gap-1.5">
                                        <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${scoreBg(h.overallScore)}`}>{h.overallScore}</span>
                                        <span>Analysis</span>
                                    </span>
                                    <span className="text-[10px] text-muted-foreground">{fmtDate(h.createdAt)}</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                )}
            </div>

            <button onClick={run} disabled={loading}
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60">
                {loading ? 'Analyzing…' : 'Analyze resume'}
            </button>

            {loading && (
                <div className="space-y-3">
                    <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                    {[0, 1, 2].map((i) => <div key={i} className="h-20 animate-pulse rounded-xl bg-muted" />)}
                </div>
            )}

            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <button onClick={run} className="mt-2 text-xs font-semibold text-red-600 hover:underline">Try again</button>
                </div>
            )}

            {result && !loading && (
                <div className="space-y-4">
                    {/* Score */}
                    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
                        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-white ${scoreBg(result.overallScore)}`}>
                            <span className="text-lg font-extrabold leading-none">{result.overallScore}</span>
                            <span className="text-[9px] font-semibold">/ 100</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">{scoreLabel(result.overallScore)}</p>
                            <p className="text-xs text-muted-foreground">Overall resume score</p>
                        </div>
                    </div>

                    {/* Category chips */}
                    <div className="flex flex-wrap gap-1.5">
                        {categories.map((c) => {
                            const n = problemsOf(c);
                            const on = c.key === activeKey;
                            return (
                                <button key={c.key} onClick={() => setActiveKey(c.key)}
                                    className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition ${on ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                                    <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[c.status] || 'bg-slate-400'}`} />
                                    {c.label}<span className="font-semibold">{n || '✓'}</span>
                                </button>
                            );
                        })}
                    </div>

                    {/* Active category findings */}
                    {active && (
                        <div>
                            <div className="flex items-center justify-between">
                                <p className="text-sm font-bold text-foreground">{active.label}</p>
                                <span className={`text-xs font-bold ${scoreText(active.score)}`}>{active.score}/100</span>
                            </div>
                            {active.summary && <p className="mt-1 text-xs text-muted-foreground">{active.summary}</p>}
                            <ul className="mt-3 space-y-2">
                                {(active.findings || []).length === 0 && (
                                    <li className="rounded-lg bg-emerald-50 p-2.5 text-xs text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">No issues here 🎉</li>
                                )}
                                {(active.findings || []).map((f, i) => (
                                    <li key={i} className="rounded-lg border border-border p-2.5">
                                        <span className={`inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${SEVERITY_CHIP[f.severity] || SEVERITY_CHIP.info}`}>{f.severity}</span>
                                        {f.phrase && <p className="mt-1.5 text-xs font-medium italic text-foreground">“{f.phrase}”</p>}
                                        <p className="mt-1 text-xs text-foreground">{f.issue}</p>
                                        <p className="mt-1 text-xs text-muted-foreground"><span className="font-medium text-foreground">Fix:</span> {f.suggestion}</p>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    <button onClick={run} disabled={loading}
                        className="w-full rounded-lg border border-border py-2 text-xs font-semibold text-muted-foreground transition hover:bg-muted disabled:opacity-60">
                        Re-analyze
                    </button>
                </div>
            )}
        </div>
    );
}
