import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import aiService from '../../services/ai.service';

export default function JdTailorPanel({ open, resume, onClose, onPaymentRequired, onApplyTailored }) {
  const [jobDescription, setJobDescription] = useState('');
  const [section, setSection] = useState('full');
  const [loading, setLoading] = useState(false);
  const [tailoredResult, setTailoredResult] = useState('');
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!open) return undefined;
    setJobDescription('');
    setSection('full');
    setTailoredResult('');
    setError(null);
    setCopied(false);
    const onKey = (e) => { if (e.key === 'Escape') onClose?.(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; document.removeEventListener('keydown', onKey); };
  }, [open, onClose]);

  if (!open) return null;

  const buildResumeText = () => {
    const L = [];
    if (resume?.name) L.push(resume.name);
    if (resume?.title) L.push(resume.title);
    if (resume?.summary) { L.push('\nSUMMARY'); L.push(resume.summary); }
    if (resume?.experience?.length) {
      L.push('\nEXPERIENCE');
      resume.experience.forEach((e) => {
        if (e.primary || e.secondary) L.push(`${e.primary || ''}${e.secondary ? ' — ' + e.secondary : ''}`);
        (e.bullets || []).forEach((b) => { if (b.text) L.push(`- ${b.text}`); });
      });
    }
    if (resume?.projects?.length) {
      L.push('\nPROJECTS');
      resume.projects.forEach((p) => {
        if (p.primary || p.secondary) L.push(`${p.primary || ''}${p.secondary ? ' — ' + p.secondary : ''}`);
        (p.bullets || []).forEach((b) => { if (b.text) L.push(`- ${b.text}`); });
      });
    }
    if (resume?.skills?.length) {
      L.push('\nSKILLS');
      resume.skills.forEach((s) => { if (s.label || s.value) L.push(`${s.label || ''}: ${s.value || ''}`); });
    }
    return L.filter(Boolean).join('\n');
  };

  const handleTailor = async () => {
    if (!jobDescription.trim()) {
      toast.error('Please paste a Job Description.');
      return;
    }
    const resumeText = buildResumeText();
    if (!resumeText.trim()) {
      toast.error('Your resume is empty. Add content before tailoring.');
      return;
    }

    setLoading(true);
    setError(null);
    setTailoredResult('');

    try {
      const res = await aiService.tailorResume({
        resumeText,
        jobDescription: jobDescription.trim(),
        section: section === 'full' ? undefined : section,
      });
      if (res?.tailoredResume) {
        setTailoredResult(res.tailoredResume);
        toast.success('Resume tailored to Job Description!');
      } else {
        setError('No tailored result returned. Please try again.');
      }
    } catch (err) {
      if (err?.response?.status === 402) {
        toast.error(err?.response?.data?.message || 'Subscribe to a plan to use AI resume tailoring.');
        onClose?.();
        onPaymentRequired?.();
      } else {
        const msg = err?.response?.data?.message || 'Tailoring failed. Please try again.';
        setError(msg);
        toast.error(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!tailoredResult) return;
    navigator.clipboard.writeText(tailoredResult);
    setCopied(true);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="no-print fixed inset-0 z-[100002] flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-sm" onClick={onClose} role="dialog" aria-modal="true">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-2xl" onClick={(e) => e.stopPropagation()}>
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 bg-gradient-to-r from-teal-500/10 via-emerald-500/10 to-transparent px-6 py-4">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-500 text-white shadow-md shadow-teal-500/30">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800">RAG Job Description Resume Tailor</h3>
              <p className="text-xs text-slate-500">Vector search extracts key requirements from the JD to optimize your resume.</p>
            </div>
          </div>
          <button onClick={onClose} className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 space-y-4 overflow-y-auto p-6">
          {!tailoredResult && (
            <>
              <div>
                <label className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-slate-500">
                  Target Job Description <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  rows={6}
                  placeholder="Paste the full job posting, key responsibilities, or desired qualifications here..."
                  className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3.5 text-sm text-slate-700 placeholder:text-slate-400 focus:border-teal-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-teal-500/20"
                />
              </div>

              <div className="flex items-center gap-3">
                <label className="text-xs font-semibold uppercase tracking-wider text-slate-500">Focus Section:</label>
                <select
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 focus:border-teal-500 focus:outline-none"
                >
                  <option value="full">Full Resume</option>
                  <option value="summary">Summary</option>
                  <option value="experience">Experience Bullets</option>
                  <option value="skills">Skills</option>
                </select>
              </div>

              {error && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700">
                  {error}
                </div>
              )}

              <button
                onClick={handleTailor}
                disabled={loading || !jobDescription.trim()}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-600 py-3 text-sm font-bold text-white shadow-lg shadow-teal-500/25 transition hover:from-teal-600 hover:to-emerald-700 disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path strokeLinecap="round" d="M12 3a9 9 0 109 9" /></svg>
                    Extracting JD vectors & tailoring resume…
                  </>
                ) : (
                  <>
                    <span>✨</span> Tailor Resume with RAG
                  </>
                )}
              </button>
            </>
          )}

          {tailoredResult && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">Tailored Resume Output</span>
                <button
                  onClick={handleCopy}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50"
                >
                  {copied ? '✓ Copied' : 'Copy Output'}
                </button>
              </div>

              <div className="max-h-80 overflow-y-auto whitespace-pre-wrap rounded-xl border border-teal-100 bg-teal-50/30 p-4 text-sm leading-relaxed text-slate-800">
                {tailoredResult}
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  onClick={() => setTailoredResult('')}
                  className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                >
                  Tailor Again
                </button>
                {onApplyTailored && (
                  <button
                    onClick={() => { onApplyTailored(tailoredResult); onClose?.(); }}
                    className="rounded-xl bg-teal-600 px-5 py-2 text-xs font-bold text-white shadow-md transition hover:bg-teal-700"
                  >
                    Apply Output
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
