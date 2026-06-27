import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
    DocumentTextIcon,
    EllipsisHorizontalIcon,
    PencilSquareIcon,
    CodeBracketIcon,
    MagnifyingGlassIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
} from '@heroicons/react/24/outline';
import docService from '../../services/doc.service';
import authService from '../../services/auth.service';
import { DEFAULT_CODE } from '../../resume-template/registry';

const designCodeFor = (doc) => doc?.templateCode || DEFAULT_CODE;

const CATEGORIES = [
    { key: 'CV_AND_RESUME', label: 'CV & Resume' },
    { key: 'COVER_LETTER', label: 'Cover Letter' },
    { key: 'JOURNAL_ARTICLES', label: 'Journal Articles' },
    { key: 'BOOKS', label: 'Books' },
    { key: 'CALENDARS', label: 'Calendars' },
    { key: 'FORMAL_LETTERS', label: 'Formal Letters' },
    { key: 'ASSIGNMENTS', label: 'Assignments' },
    { key: 'NEWSLETTERS', label: 'Newsletters' },
    { key: 'PRESENTATIONS', label: 'Presentations' },
    { key: 'REPORTS', label: 'Reports' },
];

const PAGE_SIZE_OPTIONS = [50, 80, 100];
const DEFAULT_PAGE_SIZE = 50;

const STATUS_BADGE = {
    READY: 'bg-emerald-50 text-emerald-600',
    PENDING: 'bg-amber-50 text-amber-600',
    COMPILING: 'bg-amber-50 text-amber-600',
    FAILED: 'bg-red-50 text-red-600',
};

function TemplateCard({ doc, actionLabel, onAction, isBusy }) {
    const [menuOpen, setMenuOpen] = useState(false);
    const menuRef = useRef(null);

    useEffect(() => {
        const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);

    const choose = (m) => { setMenuOpen(false); onAction(doc, m); };

    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-border bg-card shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative flex items-center justify-center overflow-hidden bg-muted" style={{ aspectRatio: '3/4' }}>
                {doc.imageUrl ? (
                    <img
                        src={doc.imageUrl}
                        alt={doc.name}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                    />
                ) : (
                    <DocumentTextIcon className="h-12 w-12 text-muted-foreground" />
                )}
                {doc.status && doc.status !== 'READY' && (
                    <span className={`absolute left-2 top-2 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_BADGE[doc.status] || 'bg-muted text-muted-foreground'}`}>
                        {doc.status}
                    </span>
                )}
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        onClick={() => choose('form')}
                        disabled={isBusy}
                        className="flex items-center gap-1.5 rounded-full bg-accent px-4 py-1.5 text-xs font-semibold text-accent-foreground shadow transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isBusy ? 'Opening…' : actionLabel}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <p className="truncate text-sm font-medium text-foreground" title={doc.name}>{doc.name}</p>

                <div ref={menuRef} className="relative shrink-0">
                    <button
                        onClick={() => setMenuOpen((v) => !v)}
                        title="More options"
                        className="flex h-7 w-7 items-center justify-center rounded-full border border-border text-muted-foreground transition hover:border-accent hover:text-accent"
                    >
                        <EllipsisHorizontalIcon className="h-4 w-4" />
                    </button>
                    {menuOpen && (
                        <div className="absolute bottom-9 right-0 z-20 w-52 overflow-hidden rounded-lg border border-border bg-card py-1 shadow-lg">
                            <button onClick={() => choose('form')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"><PencilSquareIcon className="h-4 w-4 text-muted-foreground" /> Edit with form</button>
                            <button onClick={() => choose('latex')} className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm text-muted-foreground hover:bg-muted"><CodeBracketIcon className="h-4 w-4 text-muted-foreground" /> Edit with LaTeX editor</button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-border bg-card animate-pulse">
            <div className="bg-muted" style={{ aspectRatio: '3/4' }} />
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="h-3 w-28 rounded bg-muted" />
                <div className="h-7 w-7 rounded-full bg-muted" />
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }) {
    const safeTotal = Math.max(totalPages, 1);
    const buildPages = () => {
        const pages = [];
        const range = [];
        for (let i = Math.max(2, page - 1); i <= Math.min(safeTotal - 1, page + 1); i++) range.push(i);
        if (page - 1 > 2) range.unshift('...');
        if (page + 1 < safeTotal - 1) range.push('...');
        if (safeTotal > 1) {
            pages.push(1);
            range.forEach((r) => pages.push(r));
            pages.push(safeTotal);
        } else {
            pages.push(1);
        }
        return pages;
    };

    return (
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Rows per page:</span>
                <select value={pageSize} onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="rounded-lg border border-border bg-card px-2 py-1 text-sm text-muted-foreground focus:border-accent focus:outline-none">
                    {PAGE_SIZE_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            <div className="flex items-center gap-1.5">
                <button onClick={() => onPageChange(page - 1)} disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronLeftIcon className="h-4 w-4" />
                </button>
                {buildPages().map((p, idx) =>
                    p === '...' ? (
                        <span key={`e-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-muted-foreground">…</span>
                    ) : (
                        <button key={p} onClick={() => onPageChange(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${p === page ? 'border-accent bg-accent/10 text-accent' : 'border-border text-muted-foreground hover:border-accent hover:text-accent'}`}>
                            {p}
                        </button>
                    )
                )}
                <button onClick={() => onPageChange(page + 1)} disabled={page >= safeTotal}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40">
                    <ChevronRightIcon className="h-4 w-4" />
                </button>
            </div>

            <p className="text-sm text-muted-foreground">
                Page <span className="font-medium text-foreground">{page}</span> of <span className="font-medium text-foreground">{safeTotal}</span>
            </p>
        </div>
    );
}

export default function Templates({ mode = 'templates' }) {
    const isUserDocs = mode === 'user-docs';
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeCategory = searchParams.get('type') || CATEGORIES[0].key;
    const page = Number(searchParams.get('page')) || 1;
    const pageSize = Number(searchParams.get('size')) || DEFAULT_PAGE_SIZE;
    const keyword = searchParams.get('keyword') || '';

    const [inputValue, setInputValue] = useState(keyword);
    const debounceRef = useRef(null);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [busyId, setBusyId] = useState(null);

    const handleAction = async (doc, action = 'form') => {

        if (action === 'form') {
            navigate(`/resume-builder/${designCodeFor(doc)}`);
            return;
        }

        if (busyId) return;
        setBusyId(doc.id);
        try {
            if (isUserDocs) {
                const full = await docService.getUserDoc(doc.id);
                navigate(`/doc-editor/${doc.id}`, { state: { doc: full } });
            } else {
                if (!authService.isAuthenticated()) {
                    toast('Sign in to edit LaTeX');
                    navigate('/login');
                    return;
                }
                const saved = await docService.saveTemplateToAccount(doc.id);
                navigate(`/doc-editor/${saved.id}`, { state: { doc: saved } });
            }
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to open the editor');
            setBusyId(null);
        }
    };

    useEffect(() => {
        if (!searchParams.has('type')) {
            setSearchParams({ type: CATEGORIES[0].key, page: 1, size: DEFAULT_PAGE_SIZE }, { replace: true });
        }

    }, []);

    useEffect(() => { setInputValue(keyword); }, [keyword]);

    useEffect(() => () => clearTimeout(debounceRef.current), []);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setData(null);
        const fetcher = isUserDocs ? docService.listUserDocs : docService.listTemplates;
        fetcher.call(docService, { type: activeCategory, keyword, page: page - 1, size: pageSize })
            .then(setData)
            .catch((err) => setError(err?.response?.data?.message || 'Failed to load templates'))
            .finally(() => setLoading(false));
    }, [isUserDocs, activeCategory, page, pageSize, keyword]);

    const buildParams = (overrides) => {
        const base = { type: activeCategory, page, size: pageSize };
        if (keyword) base.keyword = keyword;
        return { ...base, ...overrides };
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const next = { type: activeCategory, page: 1, size: pageSize };
            if (val.trim()) next.keyword = val.trim();
            setSearchParams(next);
        }, 400);
    };

    const handleCategoryChange = (key) => {
        setInputValue('');
        setSearchParams({ type: key, page: 1, size: pageSize });
    };

    const templates = data?.content ?? [];
    const totalPages = data?.totalPages ?? 1;
    const totalElements = data?.totalElements ?? 0;
    const unlockedDocs = isUserDocs ? templates.filter((d) => d.unlocked) : [];
    const recentDocs = isUserDocs ? templates.filter((d) => !d.unlocked) : [];

    const docGrid = (items) => (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
            {items.map((doc) => (
                <TemplateCard key={doc.id} doc={doc} isBusy={busyId === doc.id} actionLabel="Open" onAction={handleAction} />
            ))}
        </div>
    );

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-l border-r border-border">
                <div className="mb-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 pb-1 sm:flex-wrap">
                        {CATEGORIES.map((cat) => (
                            <button key={cat.key} onClick={() => handleCategoryChange(cat.key)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${activeCategory === cat.key ? 'bg-accent text-accent-foreground shadow-sm' : 'border border-border bg-card text-muted-foreground hover:border-accent hover:text-accent'}`}>
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="mb-8">
                    <div className="mx-auto w-full max-w-md">
                        <div className="relative">
                            <MagnifyingGlassIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                            <input type="text" value={inputValue} onChange={handleSearchChange}
                                placeholder={isUserDocs ? 'Search my documents…' : 'Search templates…'}
                                className="w-full rounded-full border border-border bg-card py-2.5 pl-9 pr-4 text-sm text-foreground placeholder-muted-foreground shadow-sm outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/40" />
                        </div>
                    </div>
                </div>

                {data && !loading && (
                    <p className="mb-5 text-sm text-muted-foreground">
                        {totalElements} {isUserDocs ? 'document' : 'template'}{totalElements !== 1 ? 's' : ''} in{' '}
                        <span className="font-medium text-foreground">{CATEGORIES.find((c) => c.key === activeCategory)?.label}</span>
                    </p>
                )}

                {error && (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                        <p className="text-sm text-muted-foreground">{error}</p>
                        <button onClick={() => setSearchParams(buildParams({ page: 1 }))}
                            className="mt-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground hover:bg-accent-hover">Retry</button>
                    </div>
                )}

                {!loading && !error && templates.length === 0 && (
                    <div className="py-24 text-center text-muted-foreground">
                        {isUserDocs ? 'You have not saved any documents yet.' : 'No templates available in this category yet.'}
                    </div>
                )}

                {!error && loading && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={i} />)}
                    </div>
                )}

                {!error && !loading && isUserDocs && (
                    <>
                        {unlockedDocs.length > 0 && (
                            <section className="mb-8">
                                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">Your resumes</h3>
                                {docGrid(unlockedDocs)}
                            </section>
                        )}
                        {recentDocs.length > 0 && (
                            <section>
                                <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-muted-foreground">
                                    Recently used <span className="font-normal normal-case text-muted-foreground">— locked, unlock to download</span>
                                </h3>
                                {docGrid(recentDocs)}
                            </section>
                        )}
                    </>
                )}

                {!error && !loading && !isUserDocs && (
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                        {templates.map((doc) => (
                            <TemplateCard key={doc.id} doc={doc} isBusy={busyId === doc.id}
                                actionLabel="Start Editing" onAction={handleAction} />
                        ))}
                    </div>
                )}

                {!loading && !error && totalElements > 0 && (
                    <Pagination page={page} totalPages={totalPages} pageSize={pageSize}
                        onPageChange={(p) => setSearchParams(buildParams({ page: p }))}
                        onPageSizeChange={(s) => setSearchParams(buildParams({ page: 1, size: s }))} />
                )}
            </div>
        </div>
    );
}
