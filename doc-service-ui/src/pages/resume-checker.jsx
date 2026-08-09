import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import aiService from '../services/ai.service';
import PricingModal from '../components/payment/PricingModal';

const inputCls = 'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';
const btnCls = 'rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover';
const ghostBtnCls = 'rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted';

export default function ResumeCheckerPage() {
    const [resumeText, setResumeText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);
    const [pricingOpen, setPricingOpen] = useState(false);

    const run = async () => {
        if (!resumeText.trim()) { toast.error('Paste your resume text first.'); return; }
        setLoading(true); setError(null);
        try {
            const res = await aiService.analyzeAts({ resumeText, targetRole: targetRole.trim() || undefined });
            setResult(res);
        } catch (err) {
            if (err?.response?.status === 402) {
                toast.error(err?.response?.data?.message || 'Subscribe to a plan to use the AI ATS analysis.');
                setPricingOpen(true);
            } else {
                const msg = err?.response?.data?.message || 'AI analysis failed. Please try again.';
                setError(msg); toast.error(msg);
            }
        } finally { setLoading(false); }
    };

    const scoreColor = (s) => (s >= 80 ? 'bg-emerald-500' : s >= 60 ? 'bg-teal-500' : s >= 40 ? 'bg-amber-500' : 'bg-red-500');
    const scoreLabel = (s) => (s >= 80 ? 'Excellent' : s >= 60 ? 'Good' : s >= 40 ? 'Needs work' : 'Poor');

    const linkBtns = (
        <div className="flex flex-wrap justify-center gap-3">
            <Link to="/templates?type=CV_AND_RESUME&page=1&size=50" className={btnCls}>Build & improve my resume</Link>
            <Link to="/profile" className={ghostBtnCls}>Upload my resume</Link>
        </div>
    );

    const strengthIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-4 w-4 shrink-0 text-emerald-500"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>;
    const weaknessIcon = <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-4 w-4 shrink-0 text-amber-500"><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.3 3.86l-8.3 14A1 1 0 003 19h18a1 1 0 00.86-1.5l-8.3-14a1 1 0 00-1.72 0z" /></svg>;

    const renderList = (title, items, cls, icon) => items?.length ? (
        <div>
            <h3 className={`mb-2 text-[11px] font-bold uppercase tracking-wider ${cls}`}>{title}</h3>
            <ul className="space-y-2">
                {items.map((text, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-slate-600">
                        {icon}
                        <span>{text}</span>
                    </li>
                ))}
            </ul>
        </div>
    ) : null;

    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Resume Checker"
                    title="Is your resume good enough?"
                    description="Paste your resume and get an AI-powered ATS score with actionable suggestions."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <div className="rounded-2xl border border-border bg-card p-6 sm:p-8">
                    <label className="mb-1 block text-xs font-medium text-muted-foreground">Paste your resume text</label>
                    <textarea
                        value={resumeText}
                        onChange={(e) => setResumeText(e.target.value)}
                        rows={10}
                        placeholder="Paste the full text of your resume here…"
                        className={inputCls}
                    />

                    <div className="mt-4">
                        <label className="mb-1 block text-xs font-medium text-muted-foreground">
                            Target role <span className="text-muted-foreground/60">(optional)</span>
                        </label>
                        <input
                            type="text"
                            value={targetRole}
                            onChange={(e) => setTargetRole(e.target.value)}
                            placeholder="e.g. Senior Frontend Engineer"
                            className={inputCls}
                        />
                    </div>

                    <button
                        onClick={run}
                        disabled={loading}
                        className="mt-5 flex w-full items-center justify-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover disabled:opacity-60"
                    >
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
                </div>

                {loading && (
                    <div className="mt-8 space-y-4">
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
                    <div className="mt-8 rounded-xl border border-red-200 bg-red-50 p-4">
                        <p className="text-sm text-red-700">{error}</p>
                        <button onClick={run} className="mt-2 text-xs font-semibold text-red-600 hover:underline">Try again</button>
                    </div>
                )}

                {result && !loading && (
                    <div className="mt-8 space-y-6">
                        <div className="flex items-center gap-4 rounded-2xl bg-slate-50 p-5">
                            <div className={`flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-full text-white ${scoreColor(result.score)}`}>
                                <span className="text-xl font-extrabold leading-none">{result.score}</span>
                                <span className="text-[9px] font-semibold uppercase tracking-wide">/ 100</span>
                            </div>
                            <div>
                                <p className="text-base font-bold text-slate-800">{scoreLabel(result.score)}</p>
                                <p className="text-xs text-slate-500">AI-powered ATS compatibility score</p>
                            </div>
                        </div>

                        {renderList('Strengths', result.strengths, 'text-emerald-600', strengthIcon)}
                        {renderList('Weaknesses', result.weaknesses, 'text-amber-600', weaknessIcon)}

                        {result.suggestions?.length > 0 && (
                            <div>
                                <h3 className="mb-2 text-[11px] font-bold uppercase tracking-wider text-teal-600">Suggestions</h3>
                                <ul className="space-y-2">
                                    {result.suggestions.map((s, i) => (
                                        <li key={i} className="flex items-start gap-2 rounded-lg border border-teal-100 bg-teal-50/50 p-2.5 text-sm text-slate-700">
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-teal-500 text-[10px] font-bold text-white">{i + 1}</span>
                                            <span>
                                                {typeof s === 'string' ? s : (s.originalText || s.newText)}
                                                {typeof s !== 'string' && s.action === 'add' && <span className="ml-1 rounded bg-teal-100 px-1 py-px text-[10px] font-bold text-teal-600">add</span>}
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        <div className="pt-2">{linkBtns}</div>
                    </div>
                )}

                {!result && !loading && !error && (
                    <div className="mt-8">{linkBtns}</div>
                )}
            </main>

            <PricingModal
                open={pricingOpen}
                onClose={() => setPricingOpen(false)}
                title="Upgrade to use AI ATS analysis"
            />
        </>
    );
}