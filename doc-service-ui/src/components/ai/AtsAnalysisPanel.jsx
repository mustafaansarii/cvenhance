import { useEffect, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import aiService from '../../services/ai.service';

export default function AtsAnalysisPanel({ open, resume, onClose, onPaymentRequired, onApplySuggestion }) {
  const [targetRole, setTargetRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [applied, setApplied] = useState({});
  const [history, setHistory] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(false);

  const onCloseRef = useRef(onClose);
  useEffect(() => { onCloseRef.current = onClose; }, [onClose]);

  useEffect(() => {
    if (!open) return undefined;
    setResult(null); setError(null); setTargetRole(''); setApplied({});
    const onKey = (e) => { if (e.key === 'Escape') onCloseRef.current?.(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    setHistoryLoading(true);
    aiService.getAtsHistory(0, 20)
      .then((page) => setHistory(page.content || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  }, [open]);

  if (!open) return null;

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
    if (resume?.courses?.length) {
      L.push('\nCOURSES');
      resume.courses.forEach((c) => { if (c.title || c.issuer) L.push(`${c.title || ''}${c.issuer ? ' — ' + c.issuer : ''}`); });
    }
    if (resume?.certifications?.length) {
      L.push('\nCERTIFICATIONS');
      resume.certifications.forEach((c) => { if (c.title || c.issuer) L.push(`${c.title || ''}${c.issuer ? ' — ' + c.issuer : ''}`); });
    }
    ['achievements', 'awards', 'languages', 'publications', 'interests'].forEach((t) => {
      if (resume?.[t]?.length) {
        L.push(`\n${t.toUpperCase()}`);
        resume[t].forEach((it) => { if (it.text) L.push(`- ${it.text}`); });
      }
    });
    return L.filter(Boolean).join('\n');
  };

  const run = async () => {
    const resumeText = buildResumeText();
    if (!resumeText.trim()) { toast.error('Add some content to your resume first.'); return; }
    setLoading(true); setError(null);
    try {
      const res = await aiService.analyzeAts({ resumeText, targetRole: targetRole.trim() || undefined });
      setResult(res);
      setApplied({});
      // Reload history from the backend so the newly persisted analysis
      // (with its real DB id) appears in the list and is clickable.
      refreshHistory();
    } catch (err) {
      if (err?.response?.status === 402) {
        toast.error(err?.response?.data?.message || 'Subscribe to a plan to use the AI ATS analysis.');
        onClose?.(); onPaymentRequired?.();
      } else {
        const msg = err?.response?.data?.message || 'AI analysis failed. Please try again.';
        setError(msg); toast.error(msg);
      }
    } finally { setLoading(false); }
  };

  const refreshHistory = () => {
    setHistoryLoading(true);
    aiService.getAtsHistory(0, 20)
      .then((page) => setHistory(page.content || []))
      .catch(() => setHistory([]))
      .finally(() => setHistoryLoading(false));
  };

  const loadHistoryItem = async (id) => {
    // Guard against non-numeric / placeholder ids (e.g. a transient fresh item)
    if (id === 'fresh' || id == null || Number.isNaN(Number(id))) {
      setResult(null); setApplied({}); return;
    }
    setLoading(true); setError(null);
    try {
      const res = await aiService.getAtsHistoryItem(id);
      setResult(res);
      setApplied({});
    } catch (err) {
      const msg = err?.response?.data?.message || 'Could not load this analysis.';
      setError(msg); toast.error(msg);
    } finally { setLoading(false); }
  };

  const applySuggestion = (s, i) => {
    if (!onApplySuggestion) { toast.error('Apply is not available on this page.'); return; }
    const ok = onApplySuggestion(s);
    if (ok) {
      setApplied((p) => ({ ...p, [i]: true }));
      toast.success('Suggestion applied to your resume');
    }
  };

  const scoreColor = (s) => (s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-teal-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-500');
  const scoreLabel = (s) => (s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Needs work' : 'Poor');
  const fmtDate = (iso) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  return (
    <div className="no-print fixed right-0 top-14 bottom-0 z-40 w-80 max-w-[88vw] overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-bold text-slate-800">AI ATS Analysis</h3>
        <button onClick={onClose} className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
      </div>

      {/* History list */}
      <div className="mb-4">
        <p className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide text-slate-400">History</p>
        {historyLoading ? (
          <div className="space-y-1.5">
            {[0, 1, 2].map((i) => <div key={i} className="h-10 animate-pulse rounded-lg bg-slate-100" />)}
          </div>
        ) : history.length === 0 ? (
          <p className="text-xs text-slate-400">No previous analyses. Run one below.</p>
        ) : (
          <ul className="space-y-1.5">
            {history.map((h) => (
              <li key={h.id}>
                <button
                  onClick={() => loadHistoryItem(h.id)}
                  className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-2.5 py-1.5 text-left text-xs text-slate-600 transition hover:border-teal-400 hover:bg-teal-50"
                >
                  <span className="flex items-center gap-1.5">
                    <span className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[9px] font-bold text-white ${scoreColor(h.score)}`}>{h.score}</span>
                    <span>{h.targetRole || 'General'}</span>
                  </span>
                  <span className="text-[10px] text-slate-400">{fmtDate(h.createdAt)}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Target role + run */}
      <div className="mb-4">
        <label className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Target role <span className="font-normal normal-case text-slate-300">(optional)</span>
        </label>
        <input type="text" value={targetRole} onChange={(e) => setTargetRole(e.target.value)}
          placeholder="e.g. Senior Frontend Engineer"
          className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/30" />
      </div>

      <button onClick={run} disabled={loading}
        className="mb-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover disabled:opacity-60">
        {loading ? (
          <>
            <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 3a9 9 0 109 9" /></svg>
            Analyzing…
          </>
        ) : (
          <>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 01-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 014.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0112 15a9.065 9.065 0 00-6.23-.693L5 14.5m14.8.8l1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0112 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" /></svg>
            Analyze with AI
          </>
        )}
      </button>

      {loading && (
        <div className="space-y-4">
          <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-4">
            <div className="h-14 w-14 animate-pulse rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-2 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
          {[0, 1, 2].map((i) => (
            <div key={i} className="space-y-2 rounded-xl border border-slate-100 p-3">
              <div className="h-2.5 w-20 animate-pulse rounded bg-slate-200" />
              <div className="h-2 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-2 w-3/4 animate-pulse rounded bg-slate-100" />
            </div>
          ))}
        </div>
      )}

      {error && !loading && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4">
          <p className="text-sm text-red-700">{error}</p>
          <button onClick={run} className="mt-2 text-xs font-semibold text-red-600 hover:underline">Try again</button>
        </div>
      )}

      {result && !loading && (
        <div className="space-y-5">
          <div className="flex items-center justify-between rounded-2xl bg-slate-50 p-4">
            <div className="flex items-center gap-4">
              <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-white ${scoreColor(result.score)}`}>
                <span className="text-xl font-extrabold leading-none">{result.score}</span>
                <span className="text-[9px] font-semibold uppercase tracking-wide">/ 100</span>
              </div>
              <div>
                <p className="text-sm font-bold text-slate-800">{scoreLabel(result.score)}</p>
                <p className="text-xs text-slate-500">AI-powered ATS compatibility score</p>
              </div>
            </div>
            <button onClick={() => loadHistoryItem('fresh')} title="New analysis" className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
            </button>
          </div>

          {result.strengths?.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-emerald-600">Strengths</p>
              <ul className="space-y-2">
                {result.strengths.map((s, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.weaknesses?.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-amber-600">Weaknesses</p>
              <ul className="space-y-2">
                {result.weaknesses.map((w, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.86l-8.3 14A1 1 0 003 19h18a1 1 0 00.86-1.5l-8.3-14a1 1 0 00-1.72 0z" /></svg>
                    <span>{w}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {result.suggestions?.length > 0 && (
            <div>
              <p className="mb-2 text-[11px] font-bold uppercase tracking-wider text-teal-600">Suggestions</p>
              <ul className="space-y-2.5">
                {result.suggestions.map((s, i) => {
                  const done = applied[i];
                  const hasApply = onApplySuggestion && s.newText && s.newText.trim();
                  return (
                    <li key={i} className={`rounded-xl border p-3 text-sm ${done ? 'border-emerald-200 bg-emerald-50/60' : 'border-teal-100 bg-teal-50/50'}`}>
                      <div className="flex items-start gap-2">
                        <span className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold text-white ${done ? 'bg-emerald-500' : 'bg-teal-500'}`}>
                          {done ? '✓' : i + 1}
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="whitespace-pre-wrap text-slate-700">
                            {done ? (
                              <span className="text-emerald-700 line-through decoration-emerald-300">{s.originalText || s.newText}</span>
                            ) : (
                              s.originalText || s.newText
                            )}
                          </p>
                          {s.reason && <p className="mt-1 text-[11px] leading-relaxed text-slate-500">{s.reason}</p>}
                          {hasApply && !done && (
                            <button
                              onClick={() => applySuggestion(s, i)}
                              className="mt-2 inline-flex items-center gap-1 rounded-md bg-accent px-2.5 py-1 text-[11px] font-semibold text-accent-foreground transition hover:bg-accent-hover"
                            >
                              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                              Apply to resume
                            </button>
                          )}
                          {done && <p className="mt-1 text-[11px] font-semibold text-emerald-600">Applied ✓</p>}
                        </div>
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}

          <button onClick={run} disabled={loading}
            className="w-full rounded-lg border border-slate-200 py-2 text-xs font-semibold text-slate-500 transition hover:bg-slate-50 disabled:opacity-60">
            Re-analyze
          </button>
        </div>
      )}
    </div>
  );
}