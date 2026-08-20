import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { DocumentTextIcon, ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';
import resumeCheckerService from '../../services/resumeChecker.service';

const STATUS_DOT = { good: 'bg-emerald-500', warning: 'bg-amber-500', bad: 'bg-red-500' };
const problemsOf = (c) => (c.findings || []).filter((f) => f.severity === 'bad' || f.severity === 'warning').length;
const scoreText = (s) => (s >= 80 ? 'text-emerald-500' : s >= 55 ? 'text-amber-500' : 'text-red-500');
const scoreBg = (s) => (s >= 80 ? 'bg-emerald-500' : s >= 55 ? 'bg-amber-500' : 'bg-red-500');
const scoreLabel = (s) => (s >= 80 ? 'Strong' : s >= 55 ? 'Needs work' : 'Weak');
const fmtDate = (iso) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

/** Form-builder drawer: a concise ATS summary of the current resume (or an uploaded PDF/DOCX). */
export default function ResumeCheckPanel({ open, resume, buildPdfFile, onClose, onPaymentRequired }) {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [source, setSource] = useState(null); // label of what was analyzed
    const [error, setError] = useState(null);
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    const onCloseRef = useRef(onClose);
    useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

    useEffect(() => {
        if (!open) return undefined;
        setResult(null); setError(null); setSource(null);
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

    const toResult = (entity) => {
        let categories = [];
        try { categories = JSON.parse(entity?.categoriesJson || '[]'); } catch { categories = []; }
        return { overallScore: entity?.overallScore ?? 0, categories };
    };

    const analyze = async ({ resumeText, file, label }) => {
        if (!resumeText.trim()) { toast.error('No resume content to analyze.'); return; }
        setLoading(true); setError(null);
        try {
            const res = await resumeCheckerService.checkResume({ resumeText, file });
            setResult(toResult(res));
            setSource(label);
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

    // Analyze the résumé being built: send its text AND a PDF snapshot of the current document,
    // so history stores/previews the real résumé (not just text).
    const runCurrent = async () => {
        const resumeText = buildResumeText();
        if (!resumeText.trim()) { toast.error('Add some content to your resume first.'); return; }
        setLoading(true); setError(null);
        let file = null;
        try { file = buildPdfFile ? await buildPdfFile() : null; } catch { /* fall back to text-only analysis */ }
        await analyze({ resumeText, file, label: 'Current resume' });
    };

    const loadHistoryItem = async (id) => {
        setLoading(true); setError(null);
        try {
            setResult(toResult(await resumeCheckerService.getHistoryItem(id)));
            setSource('Saved analysis');
        } catch (err) {
            const msg = err?.response?.data?.message || 'Could not load this analysis.'; setError(msg); toast.error(msg);
        } finally { setLoading(false); }
    };

    const cats = result?.categories || [];
    const withIssues = cats.map((c) => ({ c, n: problemsOf(c) })).filter((x) => x.n > 0).sort((a, b) => b.n - a.n);
    const okCount = cats.length - withIssues.length;
    const totalIssues = withIssues.reduce((s, x) => s + x.n, 0);

    return (
        <div className="no-print fixed right-0 top-14 bottom-0 z-40 w-80 max-w-[88vw] overflow-y-auto border-l border-border bg-card p-5 shadow-2xl">
            <div className="mb-4 flex items-center justify-between">
                <h3 className="text-sm font-bold text-foreground">Resume analysis</h3>
                <button onClick={onClose} className="rounded p-1 text-muted-foreground hover:bg-muted hover:text-foreground">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Analyze the current résumé (its text + a PDF snapshot of the document). */}
            <button onClick={runCurrent} disabled={loading}
                className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover disabled:opacity-60">
                {loading ? 'Analyzing…' : 'Analyze current resume'}
            </button>

            {loading && (
                <div className="space-y-3">
                    <div className="h-16 animate-pulse rounded-2xl bg-muted" />
                    {[0, 1, 2].map((i) => <div key={i} className="h-8 animate-pulse rounded-lg bg-muted" />)}
                </div>
            )}

            {error && !loading && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 dark:bg-red-900/20">
                    <p className="text-sm text-red-700 dark:text-red-300">{error}</p>
                    <button onClick={runCurrent} className="mt-2 text-xs font-semibold text-red-600 hover:underline">Try again</button>
                </div>
            )}

            {/* Summary only — full findings & highlights live on the Resume Analyzer page */}
            {result && !loading && (
                <div className="space-y-4">
                    {source && (
                        <p className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
                            <DocumentTextIcon className="h-3.5 w-3.5" /> {source}
                        </p>
                    )}

                    <div className="flex items-center gap-3 rounded-2xl bg-muted/60 p-4">
                        <div className={`flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-full text-white ${scoreBg(result.overallScore)}`}>
                            <span className="text-lg font-extrabold leading-none">{result.overallScore}</span>
                            <span className="text-[9px] font-semibold">/ 100</span>
                        </div>
                        <div>
                            <p className="text-sm font-bold text-foreground">{scoreLabel(result.overallScore)}</p>
                            <p className="text-xs text-muted-foreground">
                                {totalIssues > 0
                                    ? `${totalIssues} issue${totalIssues === 1 ? '' : 's'} across ${withIssues.length} section${withIssues.length === 1 ? '' : 's'}`
                                    : 'No issues found 🎉'}
                            </p>
                        </div>
                    </div>

                    {/* Top fixes — compact list, no per-finding detail */}
                    {withIssues.length > 0 && (
                        <div>
                            <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Top fixes</p>
                            <ul className="space-y-1">
                                {withIssues.slice(0, 6).map(({ c, n }) => (
                                    <li key={c.key} className="flex items-center justify-between rounded-lg border border-border px-2.5 py-1.5 text-xs">
                                        <span className="flex items-center gap-1.5 text-foreground">
                                            <span className={`h-1.5 w-1.5 rounded-full ${STATUS_DOT[c.status] || 'bg-slate-400'}`} />
                                            {c.label}
                                        </span>
                                        <span className={`font-semibold ${scoreText(c.score)}`}>{n} issue{n === 1 ? '' : 's'}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {okCount > 0 && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400">
                            ✓ {okCount} section{okCount === 1 ? '' : 's'} looking good
                        </p>
                    )}

                    <Link to="/resume-checker" target="_blank" rel="noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-border py-2 text-xs font-semibold text-accent transition hover:bg-accent/5">
                        Open full analysis <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5" />
                    </Link>
                </div>
            )}

            {/* History */}
            <div className="mt-6">
                <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">History</p>
                {historyLoading ? (
                    <div className="space-y-1.5">{[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-muted" />)}</div>
                ) : history.length === 0 ? (
                    <p className="text-xs text-muted-foreground">No previous analyses yet.</p>
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
        </div>
    );
}
