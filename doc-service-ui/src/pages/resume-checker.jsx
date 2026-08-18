import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import mammoth from 'mammoth/mammoth.browser';
import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import {
    ArrowUpTrayIcon, DocumentTextIcon,
    ChevronLeftIcon, ChevronRightIcon, ExclamationTriangleIcon, CheckCircleIcon,
    Squares2X2Icon, TagIcon, BriefcaseIcon, ChatBubbleLeftRightIcon, VideoCameraIcon, CodeBracketIcon,
    ArrowTopRightOnSquareIcon, SparklesIcon, ClockIcon,
} from '@heroicons/react/24/outline';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import PdfViewer, { severityColors } from '../components/ai/PdfViewer';
import resumeCheckerService from '../services/resumeChecker.service';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL('pdfjs-dist/legacy/build/pdf.worker.mjs', import.meta.url).toString();

const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

const SEVERITY_CHIP = {
    bad: 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300',
    warning: 'bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300',
    good: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300',
    info: 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
};
const SEVERITY_BAR = { bad: 'border-l-red-400', warning: 'border-l-amber-400', good: 'border-l-emerald-400', info: 'border-l-blue-400' };

const problemsOf = (c) => (c.findings || []).filter((f) => f.severity === 'bad' || f.severity === 'warning').length;

const INTERNAL_TOOLS = [
    { label: 'Resume templates', to: '/templates?type=CV_AND_RESUME&page=1&size=50', icon: Squares2X2Icon },
    { label: 'Cover letters', to: '/templates?type=COVER_LETTER&page=1&size=50', icon: DocumentTextIcon },
    { label: 'Pricing', to: '/pricing', icon: TagIcon },
];
const EXTERNAL_TOOLS = [
    { label: 'Job tracker', href: 'https://jobs.careerhubs.info/', icon: BriefcaseIcon },
    { label: 'AI mock interview', href: 'https://interview.careerhubs.info/', icon: ChatBubbleLeftRightIcon },
    { label: 'Meet', href: 'https://meet.careerhubs.info/', icon: VideoCameraIcon },
    { label: 'CodeShare', href: 'https://code.careerhubs.info/', icon: CodeBracketIcon },
];
async function textFromFile(file) {
    if (/\.docx$/i.test(file.name)) {
        return (await mammoth.extractRawText({ arrayBuffer: await file.arrayBuffer() })).value;
    }
    const pdf = await pdfjsLib.getDocument({ data: new Uint8Array(await file.arrayBuffer()) }).promise;
    const pages = await Promise.all(
        Array.from({ length: pdf.numPages }, async (_, i) =>
            (await (await pdf.getPage(i + 1)).getTextContent()).items.map((x) => x.str).join(' ')),
    );
    return pages.join('\n\n');
}

const scoreHex = (s) => (s >= 80 ? '#10b981' : s >= 55 ? '#f59e0b' : '#ef4444');
const scoreText = (s) => (s >= 80 ? 'text-emerald-500' : s >= 55 ? 'text-amber-500' : 'text-red-500');
const scoreBg = (s) => (s >= 80 ? 'bg-emerald-500' : s >= 55 ? 'bg-amber-500' : 'bg-red-500');
const fmtDate = (iso) => { try { return new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); } catch { return ''; } };

const HeroBar = () => (
    <div className="shrink-0 border-b border-border bg-cover bg-center home-page-hero-bg"
        style={{ backgroundImage: "url('/assest/home_page.png')" }}>
        <Navbar />
    </div>
);

function ScoreRing({ score, size = 104 }) {
    const r = (size - 12) / 2;
    const c = 2 * Math.PI * r;
    return (
        <div className="relative" style={{ width: size, height: size }}>
            <svg width={size} height={size} className="-rotate-90">
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted" />
                <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={scoreHex(score)} strokeWidth="8"
                    strokeLinecap="round" strokeDasharray={c} strokeDashoffset={c - (c * score) / 100} />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreText(score)}`}>{score}</span>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Overall</span>
            </div>
        </div>
    );
}

const Bar = ({ w = '100%', h = 'h-3' }) => <div className={`${h} rounded bg-muted`} style={{ width: w }} />;

/** Full 3-pane skeleton shown while the AI analysis runs. */
function AnalyzingSkeleton() {
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <HeroBar />
            <div className="flex min-h-0 flex-1 animate-pulse flex-col lg:flex-row lg:overflow-hidden">
                <aside className="w-full shrink-0 space-y-3 p-4 lg:w-60 lg:border-r lg:border-border">
                    <div className="mx-auto h-24 w-24 rounded-full bg-muted" />
                    <Bar w="40%" />
                    {Array.from({ length: 6 }).map((_, i) => <div key={i} className="h-8 rounded-lg bg-muted" />)}
                </aside>
                <section className="min-w-0 flex-1 p-5 sm:p-8 lg:border-r lg:border-border">
                    <div className="mx-auto max-w-2xl space-y-4">
                        <div className="h-8 w-52 rounded bg-muted" />
                        <Bar w="70%" />
                        {Array.from({ length: 4 }).map((_, i) => <div key={i} className="h-24 rounded-xl bg-muted" />)}
                    </div>
                </section>
                <section className="hidden w-full shrink-0 bg-muted/60 lg:block lg:h-full lg:w-[540px]" />
            </div>
        </div>
    );
}

export default function ResumeCheckerPage() {
    const navigate = useNavigate();
    const inputRef = useRef(null);
    const [file, setFile] = useState(null);
    const [text, setText] = useState('');
    const [targetRole, setTargetRole] = useState('');
    const [data, setData] = useState(null);
    const [activeIdx, setActiveIdx] = useState(0);
    const [focusIdx, setFocusIdx] = useState(null);
    const [reading, setReading] = useState(false);
    const [analyzing, setAnalyzing] = useState(false);
    const [dragging, setDragging] = useState(false);
    const [history, setHistory] = useState([]);

    const loadHistory = () => {
        resumeCheckerService.getHistory(0, 10)
            .then((page) => setHistory(page?.content || []))
            .catch(() => setHistory([]));
    };
    useEffect(() => { loadHistory(); }, []);

    // Re-open a stored analysis: rebuild results from the saved categories + resume snapshot (text preview).
    const viewHistory = (item) => {
        let cats = [];
        try { cats = JSON.parse(item.categoriesJson || '[]'); } catch { cats = []; }
        setFile(null);
        setText(item.resumeSnapshot || '');
        setData({ overallScore: item.overallScore, categories: cats });
        setActiveIdx(0);
        setFocusIdx(null);
    };

    const categories = data?.categories || [];
    const isPdf = /\.pdf$/i.test(file?.name || '');
    const active = categories[activeIdx] || null;
    const topFixes = categories.map((c, i) => ({ c, i })).filter(({ c }) => problemsOf(c) > 0);
    const completed = categories.map((c, i) => ({ c, i })).filter(({ c }) => problemsOf(c) === 0);

    const highlights = useMemo(() => {
        const findings = active?.findings || [];
        const chosen = focusIdx != null ? findings.filter((_, i) => i === focusIdx) : findings;
        return chosen.filter((f) => f.phrase && f.phrase.trim())
            .map((f) => ({ phrase: f.phrase, color: severityColors[f.severity] || severityColors.warning }));
    }, [active, focusIdx]);

    const select = (i) => { setActiveIdx(i); setFocusIdx(null); };

    const onFile = async (f) => {
        if (!f) return;
        if (!/\.(pdf|docx)$/i.test(f.name)) { toast.error('Upload a PDF or DOCX file.'); return; }
        if (f.size > MAX_BYTES) { toast.error('File is too large (max 2 MB).'); return; }
        setReading(true);
        const id = toast.loading('Reading your resume…');
        try {
            setFile(f);
            setText(await textFromFile(f));
            setData(null);
            toast.success('Resume loaded — click Analyze.', { id });
        } catch {
            toast.error('Unable to read this document.', { id });
        } finally {
            setReading(false);
        }
    };

    const analyze = async () => {
        if (!text.trim()) { toast.error('Upload a resume first.'); return; }
        setAnalyzing(true);
        const id = toast.loading('Analyzing your resume…');
        try {
            const result = await resumeCheckerService.checkResume({ resumeText: text, targetRole });
            setData(result);
            setActiveIdx(0);
            setFocusIdx(null);
            loadHistory();
            toast.success('Analysis ready.', { id });
        } catch (err) {
            const status = err?.response?.status;
            if (status === 401 || status === 403) {
                toast.error('Please sign in to analyze your resume.', { id });
                navigate('/login', { state: { from: '/resume-checker' } });
            } else if (status === 429) {
                toast.error(err?.response?.data?.message || "You've reached today's limit. Try again tomorrow.", { id });
            } else {
                toast.error(err?.response?.data?.message || 'Could not analyze your resume.', { id });
            }
        } finally {
            setAnalyzing(false);
        }
    };

    const reset = () => { setData(null); setFile(null); setText(''); setTargetRole(''); setActiveIdx(0); setFocusIdx(null); };

    const CategoryRow = ({ c, i }) => {
        const n = problemsOf(c);
        const on = i === activeIdx;
        return (
            <button onClick={() => select(i)}
                className={`flex w-full items-center justify-between gap-2 rounded-lg border-l-2 px-3 py-2 text-left text-sm transition ${on ? 'border-l-accent bg-accent/10 font-semibold text-accent' : 'border-l-transparent text-muted-foreground hover:bg-muted'}`}>
                <span className="truncate">{c.label}</span>
                <span className={`shrink-0 text-xs font-semibold tabular-nums ${n ? scoreText(c.score) : 'text-emerald-500'}`}>{n || '✓'}</span>
            </button>
        );
    };

    // ---------- Analyzing: full skeleton ----------
    if (analyzing && !data) return <AnalyzingSkeleton />;

    // ---------- Landing / upload ----------
    if (!data) {
        return (
            <div className="flex min-h-screen flex-col bg-background">
                <div className="border-b border-border bg-cover bg-center home-page-hero-bg"
                    style={{ backgroundImage: "url('/assest/home_page.png')" }}>
                    <Navbar />
                    <PageHero breadcrumb="Resume Analyzer" title="See exactly what to improve"
                        description="Upload your resume and get instant, section-by-section feedback with concrete fixes." />
                </div>

                <main className="mx-auto w-full max-w-5xl flex-1 border-x border-border px-4 pt-10 pb-14"
                    onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                    onDragLeave={() => setDragging(false)}
                    onDrop={(e) => { e.preventDefault(); setDragging(false); onFile(e.dataTransfer.files?.[0]); }}>
                    <input ref={inputRef} type="file" accept=".pdf,.docx" className="hidden"
                        onChange={(e) => onFile(e.target.files?.[0])} />

                    <div className="text-center">
                        <p className="text-[11px] font-semibold uppercase tracking-wider text-accent">See it in action</p>
                        <h3 className="mt-2 font-serif text-2xl font-bold text-foreground sm:text-3xl">Every fix, mapped to your resume</h3>
                        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
                            Scores by category, exact issues with suggested fixes, and matching keywords highlighted right on your resume.
                        </p>

                        {/* Upload / analyze controls */}
                        <div className="mx-auto mt-6 flex w-full max-w-md flex-col items-center gap-2">
                            {!text ? (
                                <button onClick={() => inputRef.current?.click()} disabled={reading}
                                    className={`inline-flex items-center gap-2 rounded-lg px-6 py-3 text-sm font-semibold text-accent-foreground transition disabled:opacity-60 ${dragging ? 'bg-accent-hover scale-105' : 'bg-accent hover:bg-accent-hover'}`}>
                                    <ArrowUpTrayIcon className="h-4 w-4" />
                                    {reading ? 'Reading…' : dragging ? 'Drop it here' : 'Upload your resume'}
                                </button>
                            ) : (
                                <div className="w-full">
                                    <p className="mb-3 flex items-center justify-center gap-2 text-sm text-muted-foreground">
                                        <DocumentTextIcon className="h-4 w-4" /> {file?.name}
                                    </p>
                                    <textarea value={targetRole} onChange={(e) => setTargetRole(e.target.value)} rows={2}
                                        placeholder="Optional: target role or paste a job description…"
                                        className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/30" />
                                    <div className="mt-3 flex gap-2">
                                        <button onClick={() => inputRef.current?.click()}
                                            className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition hover:text-accent">
                                            Change file
                                        </button>
                                        <button onClick={analyze}
                                            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">
                                            <SparklesIcon className="h-4 w-4" /> Analyze resume
                                        </button>
                                    </div>
                                </div>
                            )}
                            <span className="text-xs text-muted-foreground">Drag &amp; drop or click · PDF or DOCX · max 2 MB · parsed in your browser</span>
                        </div>

                        {/* Recent analyses */}
                        {history.length > 0 && (
                            <div className="mx-auto mt-10 max-w-2xl text-left">
                                <p className="mb-2 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                                    <ClockIcon className="h-3.5 w-3.5" /> Recent analyses
                                </p>
                                <ul className="divide-y divide-border overflow-hidden rounded-xl border border-border">
                                    {history.map((h) => (
                                        <li key={h.id}>
                                            <button onClick={() => viewHistory(h)}
                                                className="flex w-full items-center gap-3 px-4 py-3 text-left transition hover:bg-muted">
                                                <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${scoreBg(h.overallScore)}`}>{h.overallScore}</span>
                                                <span className="min-w-0 flex-1">
                                                    <span className="block truncate text-sm font-medium text-foreground">{h.targetRole || 'General analysis'}</span>
                                                    <span className="block text-xs text-muted-foreground">{fmtDate(h.createdAt)}</span>
                                                </span>
                                                <ChevronRightIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                                            </button>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}

                        {/* Preview image */}
                        <div className="group relative mx-auto mt-10 max-w-4xl">
                            <div className="pointer-events-none absolute -inset-4 rounded-3xl bg-accent/10 blur-2xl" />
                            <img src="/resume-analysis.png" alt="Resume analysis: category scores, issues, fixes, and highlighted keywords"
                                loading="lazy" width="2880" height="1626"
                                className="relative w-full shadow-2xl ring-1 ring-border transition duration-500 group-hover:-translate-y-1" />
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    // ---------- Results ----------
    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
            <HeroBar />
            <div className="flex min-h-0 flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden lg:border-x lg:border-border">
                {/* Left rail */}
                <aside className="w-full shrink-0 p-4 lg:w-60 lg:overflow-y-auto lg:border-r lg:border-border">
                    <button onClick={reset}
                        className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg border border-accent/40 bg-accent/10 px-3 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground">
                        <ArrowUpTrayIcon className="h-4 w-4" /> Analyze another file
                    </button>
                    <div className="flex flex-col items-center pb-4">
                        <ScoreRing score={data.overallScore ?? 0} />
                    </div>
                    <p className="mt-2 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Top fixes</p>
                    <nav className="space-y-0.5">
                        {topFixes.length === 0 && <p className="px-3 py-2 text-sm text-emerald-500">No issues 🎉</p>}
                        {topFixes.map(({ c, i }) => <CategoryRow key={c.key} c={c} i={i} />)}
                    </nav>
                    {completed.length > 0 && (
                        <>
                            <p className="mt-5 mb-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Completed</p>
                            <nav className="space-y-0.5">
                                {completed.map(({ c, i }) => <CategoryRow key={c.key} c={c} i={i} />)}
                            </nav>
                        </>
                    )}
                    <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Tools</p>
                    <Link to="/templates?type=CV_AND_RESUME&page=1&size=50"
                        className="flex items-center justify-center gap-2 rounded-lg bg-accent px-3 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">
                        <Squares2X2Icon className="h-4 w-4" /> Browse templates
                    </Link>
                    <nav className="mt-1.5 space-y-0.5">
                        {INTERNAL_TOOLS.slice(1).map((t) => (
                            <Link key={t.label} to={t.to}
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
                                <t.icon className="h-4 w-4" /> {t.label}
                            </Link>
                        ))}
                    </nav>

                    <p className="mt-6 mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">More from CareerHubs</p>
                    <nav className="space-y-0.5">
                        {EXTERNAL_TOOLS.map((t) => (
                            <a key={t.label} href={t.href} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground transition hover:bg-muted hover:text-foreground">
                                <t.icon className="h-4 w-4" />
                                <span className="flex-1 truncate">{t.label}</span>
                                <ArrowTopRightOnSquareIcon className="h-3.5 w-3.5 opacity-60" />
                            </a>
                        ))}
                    </nav>
                </aside>

                {/* Middle detail */}
                <section className="min-w-0 flex-1 p-5 sm:p-8 lg:overflow-y-auto lg:border-r lg:border-border">
                    {active && (
                        <div className="mx-auto max-w-2xl">
                            <div className="mb-5 flex items-center gap-2">
                                <button onClick={() => select((activeIdx - 1 + categories.length) % categories.length)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-accent/10 hover:text-accent">
                                    <ChevronLeftIcon className="h-4 w-4" />
                                </button>
                                <button onClick={() => select((activeIdx + 1) % categories.length)}
                                    className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-muted-foreground transition hover:bg-accent/10 hover:text-accent">
                                    <ChevronRightIcon className="h-4 w-4" />
                                </button>
                            </div>

                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="font-serif text-3xl font-bold text-foreground">{active.label}</h2>
                                    {active.summary && <p className="mt-1.5 text-sm text-muted-foreground">{active.summary}</p>}
                                </div>
                                <span className={`text-5xl font-bold leading-none ${scoreText(active.score)}`}>{problemsOf(active)}</span>
                            </div>

                            <p className="mt-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                                {(active.findings || []).length} {(active.findings || []).length === 1 ? 'note' : 'notes'} found
                            </p>

                            <div className="mt-3 space-y-3">
                                {(active.findings || []).length === 0 && (
                                    <div className="flex items-center gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
                                        <CheckCircleIcon className="h-5 w-5" /> Looks great here — no issues found.
                                    </div>
                                )}
                                {(active.findings || []).map((f, i) => {
                                    const focused = focusIdx === i;
                                    return (
                                        <div key={i} className={`rounded-r-xl border-l-4 p-4 transition ${SEVERITY_BAR[f.severity] || SEVERITY_BAR.info} ${focused ? 'ring-1 ring-accent/40' : ''}`}>
                                            <div className="flex items-center gap-2">
                                                <ExclamationTriangleIcon className={`h-4 w-4 ${scoreText(f.severity === 'good' ? 90 : f.severity === 'warning' ? 60 : 30)}`} />
                                                <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold capitalize ${SEVERITY_CHIP[f.severity] || SEVERITY_CHIP.info}`}>{f.severity}</span>
                                            </div>
                                            {f.phrase && <p className="mt-2 text-sm font-medium italic text-foreground">“{f.phrase}”</p>}
                                            <p className="mt-1.5 text-sm text-foreground">{f.issue}</p>
                                            <p className="mt-1.5 text-sm text-muted-foreground"><span className="font-medium text-foreground">Fix:</span> {f.suggestion}</p>
                                            {f.phrase && f.phrase.trim() && (
                                                <button onClick={() => setFocusIdx(focused ? null : i)}
                                                    className="mt-3 rounded-md bg-accent/10 px-3 py-1 text-xs font-semibold text-accent transition hover:bg-accent/20">
                                                    {focused ? 'Show all' : 'Show in resume'}
                                                </button>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </section>

                {/* Right preview */}
                <section className="w-full shrink-0 lg:h-full lg:w-[540px]">
                    {isPdf ? (
                        <PdfViewer file={file} highlights={highlights} />
                    ) : (
                        <article className="h-full min-h-[60vh] overflow-auto whitespace-pre-wrap bg-muted p-5 font-serif text-sm leading-7 text-foreground">
                            {renderDocx(text, highlights)}
                        </article>
                    )}
                </section>
            </div>
        </div>
    );
}

function renderDocx(text, highlights) {
    const marks = (highlights || []).filter((h) => h.phrase && h.phrase.trim());
    if (!marks.length) return text;
    // Build a whitespace-flexible pattern per phrase (spaces → \s+), then find the matching color.
    const patterns = marks.map((m) => ({
        color: m.color,
        re: new RegExp('^' + m.phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+') + '$', 'i'),
    }));
    const splitter = new RegExp(`(${marks.map((m) => m.phrase.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&').replace(/\s+/g, '\\s+')).join('|')})`, 'ig');
    return text.split(splitter).map((chunk, i) => {
        const hit = chunk && patterns.find((p) => p.re.test(chunk));
        return hit
            ? <mark key={i} style={{ backgroundColor: hit.color, borderRadius: '2px' }}>{chunk}</mark>
            : chunk;
    });
}
