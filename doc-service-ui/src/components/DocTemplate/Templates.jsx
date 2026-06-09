import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useSearchParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';


const CATEGORIES = [
    { key: 'CV_AND_RESUME', label: 'CV & Resume' },
    { key: 'JOURNAL_ARTICLES', label: 'Journal Articles' },
    { key: 'BOOKS', label: 'Books' },
    { key: 'CALENDARS', label: 'Calendars' },
    { key: 'FORMAL_LETTERS', label: 'Formal Letters' },
    { key: 'ASSIGNMENTS', label: 'Assignments' },
    { key: 'NEWSLETTERS', label: 'Newsletters' },
    { key: 'POSTERS', label: 'Posters' },
    { key: 'PRESENTATIONS', label: 'Presentations' },
    { key: 'REPORTS', label: 'Reports' }
];

const PAGE_SIZE_OPTIONS = [10, 20, 50];
const DEFAULT_PAGE_SIZE = 10;

const api = axios.create({
    baseURL: '/careerhub/',
    withCredentials: true,
});

async function fetchTemplates(apiPath, docType, pageNo = 1, pageSize = DEFAULT_PAGE_SIZE, keyword = '') {
    const params = { docType, pageNo, pageSize };
    if (keyword.trim()) params.keyword = keyword.trim();
    const res = await api.get(apiPath, { params });
    return res.data;
}

function TemplateCard({ doc, onOpenEditor, isOpening }) {
    return (
        <div className="group relative flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg">
            <div className="relative overflow-hidden bg-slate-50" style={{ aspectRatio: '3/4' }}>
                <img
                    src={doc.documentImageUrl}
                    alt={doc.documentName}
                    className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                    onError={(e) => { e.target.src = 'https://placehold.co/300x400?text=Preview'; }}
                />
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/50 opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    <button
                        onClick={() => onOpenEditor(doc)}
                        disabled={isOpening}
                        className="flex items-center gap-1.5 rounded-full bg-teal-600 px-4 py-1.5 text-xs font-semibold text-white shadow transition hover:bg-teal-500 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                        {isOpening ? (
                            <>
                                <svg className="h-3 w-3 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" strokeLinecap="round" />
                                </svg>
                                Opening…
                            </>
                        ) : (
                            <>
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3 w-3">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                </svg>
                                Start Editing
                            </>
                        )}
                    </button>
                </div>
            </div>

            <div className="flex items-center justify-between gap-2 px-3 py-2.5">
                <p className="truncate text-sm font-medium text-slate-800">
                    {doc.documentName}
                </p>
                <a
                    href={doc.documentPdfUrl}
                    download
                    title="Download PDF"
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-400 transition hover:border-teal-400 hover:text-teal-600"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3" />
                    </svg>
                </a>
            </div>
        </div>
    );
}

function SkeletonCard() {
    return (
        <div className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white animate-pulse">
            <div className="bg-slate-100" style={{ aspectRatio: '3/4' }} />
            <div className="flex items-center justify-between px-3 py-2.5">
                <div className="h-3 w-28 rounded bg-slate-200" />
                <div className="h-7 w-7 rounded-full bg-slate-200" />
            </div>
        </div>
    );
}

function Pagination({ page, totalPages, pageSize, onPageChange, onPageSizeChange }) {
    const buildPages = () => {
        const pages = [];
        const delta = 1;
        const range = [];
        for (let i = Math.max(2, page - delta); i <= Math.min(totalPages - 1, page + delta); i++) {
            range.push(i);
        }
        if (page - delta > 2) range.unshift('...');
        if (page + delta < totalPages - 1) range.push('...');
        if (totalPages > 1) {
            pages.push(1);
            range.forEach((r) => pages.push(r));
            pages.push(totalPages);
        } else {
            pages.push(1);
        }
        return pages;
    };

    return (
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
            <div className="flex items-center gap-2 text-sm text-slate-500">
                <span>Rows per page:</span>
                <select
                    value={pageSize}
                    onChange={(e) => onPageSizeChange(Number(e.target.value))}
                    className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-sm text-slate-700 focus:border-teal-400 focus:outline-none"
                >
                    {PAGE_SIZE_OPTIONS.map((s) => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            <div className="flex items-center gap-1.5">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                    </svg>
                </button>

                {buildPages().map((p, idx) =>
                    p === '...' ? (
                        <span key={`ellipsis-${idx}`} className="flex h-8 w-8 items-center justify-center text-sm text-slate-400">…</span>
                    ) : (
                        <button
                            key={p}
                            onClick={() => onPageChange(p)}
                            className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition ${p === page
                                ? 'border-teal-500 bg-teal-50 text-teal-700'
                                : 'border-slate-200 text-slate-600 hover:border-teal-400 hover:text-teal-600'
                                }`}
                        >
                            {p}
                        </button>
                    )
                )}

                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-teal-400 hover:text-teal-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                    </svg>
                </button>
            </div>

            <p className="text-sm text-slate-500">
                Page <span className="font-medium text-slate-700">{page}</span> of{' '}
                <span className="font-medium text-slate-700">{totalPages}</span>
            </p>
        </div>
    );
}

export default function Templates({
    apiPath = 'doc-templates/metadata',
    hideHeader = false,
}) {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();

    const activeCategory = searchParams.get('docType') || CATEGORIES[0].key;
    const page = Number(searchParams.get('pageNo')) || 1;
    const pageSize = Number(searchParams.get('pageSize')) || DEFAULT_PAGE_SIZE;
    const keyword = searchParams.get('keyword') || '';

    const [inputValue, setInputValue] = useState(keyword);
    const debounceRef = useRef(null);

    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openingId, setOpeningId] = useState(null);

    const isUserDocs = apiPath === 'user-docs/metadata';

    const handleOpenEditor = async (doc) => {
        if (openingId) return;
        setOpeningId(doc.id);
        try {
            if (isUserDocs) {
                const res = await api.get(`user-docs/${doc.id}`);
                navigate(`/doc-editor/${doc.id}`, { state: { doc: res.data } });
            } else {
                const res = await fetch(`/careerhub/user-docs/${doc.id}`, {
                    method: 'POST',
                    credentials: 'include',
                });
                if (!res.ok) {
                    const text = await res.text();
                    throw new Error(text || `Server returned ${res.status}`);
                }
                const savedDoc = await res.json();
                navigate(`/doc-editor/${savedDoc.id}`);
            }
        } catch (err) {
            const msg = err?.response?.data?.message || 'Failed to open template in editor';
            toast.error(msg);
            setOpeningId(null);
        }
    };

    useEffect(() => {
        if (!searchParams.has('docType')) {
            setSearchParams(
                { docType: CATEGORIES[0].key, pageNo: 1, pageSize: DEFAULT_PAGE_SIZE },
                { replace: true }
            );
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    useEffect(() => { setInputValue(keyword); }, [keyword]);

    useEffect(() => {
        setLoading(true);
        setError(null);
        setData(null);
        fetchTemplates(apiPath, activeCategory, page, pageSize, keyword)
            .then(setData)
            .catch((err) => setError(err.message || 'Failed to load templates'))
            .finally(() => setLoading(false));
    }, [apiPath, activeCategory, page, pageSize, keyword]);

    const buildParams = (overrides) => {
        const base = { docType: activeCategory, pageNo: page, pageSize };
        if (keyword) base.keyword = keyword;
        return { ...base, ...overrides };
    };

    const handleSearchChange = (e) => {
        const val = e.target.value;
        setInputValue(val);
        clearTimeout(debounceRef.current);
        debounceRef.current = setTimeout(() => {
            const next = { docType: activeCategory, pageNo: 1, pageSize };
            if (val.trim()) next.keyword = val.trim();
            setSearchParams(next);
        }, 400);
    };

    const handleCategoryChange = (key) => {
        setInputValue('');
        setSearchParams({ docType: key, pageNo: 1, pageSize });
    };

    const handlePageChange = (newPage) => {
        setSearchParams(buildParams({ pageNo: newPage }));
    };

    const handlePageSizeChange = (size) => {
        setSearchParams(buildParams({ pageNo: 1, pageSize: size }));
    };

    const templates = data?.content ?? [];
    const totalPages = data?.totalPages ?? 1;
    const totalElements = data?.totalElements ?? 0;

    return (
        <div className="min-h-screen">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 border-l border-r border-black/50 dark:border-white/50">
                {/* Category tabs */}
                <div className="mb-8 -mx-4 overflow-x-auto px-4 sm:mx-0 sm:px-0">
                    <div className="flex gap-2 pb-1 sm:flex-wrap">
                        {CATEGORIES.map((cat) => (
                            <button
                                key={cat.key}
                                onClick={() => handleCategoryChange(cat.key)}
                                className={`whitespace-nowrap rounded-full px-4 py-1.5 text-sm font-medium transition-all duration-200 ${activeCategory === cat.key
                                    ? 'bg-teal-600 text-white shadow-sm'
                                    : 'border border-slate-200 bg-white text-slate-600 hover:border-teal-400 hover:text-teal-700'
                                    }`}
                            >
                                {cat.label}
                            </button>
                        ))}
                    </div>
                </div>

                {!hideHeader && (
                    <div className="mb-8">
                        <div className="mx-auto w-full max-w-md">
                            <div className="relative">
                                <svg
                                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                                    className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400"
                                >
                                    <circle cx="11" cy="11" r="8" /><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35" />
                                </svg>
                                <input
                                    type="text"
                                    value={inputValue}
                                    onChange={handleSearchChange}
                                    placeholder="Search templates…"
                                    className="w-full rounded-full border border-slate-200 bg-white py-2.5 pl-9 pr-4 text-sm text-slate-800 placeholder-slate-400 shadow-sm outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-400/20"
                                />
                                {inputValue && (
                                    <button
                                        onClick={() => { setInputValue(''); setSearchParams({ docType: activeCategory, pageNo: 1, pageSize }); }}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
                                        aria-label="Clear search"
                                    >
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* Results count */}
                {data && !loading && (
                    <p className="mb-5 text-sm text-slate-500">
                        {totalElements} template{totalElements !== 1 ? 's' : ''} in{' '}
                        <span className="font-medium text-slate-700">
                            {CATEGORIES.find((c) => c.key === activeCategory)?.label}
                        </span>
                    </p>
                )}

                {/* Error state */}
                {error && (
                    <div className="flex flex-col items-center gap-3 py-24 text-center">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-red-50 text-red-400">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-7 w-7">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                            </svg>
                        </div>
                        <p className="text-sm text-slate-500">{error}</p>
                        <button
                            onClick={() => { handlePageChange(1); setError(null); setLoading(true); }}
                            className="mt-1 rounded-full bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-teal-700"
                        >
                            Retry
                        </button>
                    </div>
                )}

                {/* Empty state */}
                {!loading && !error && templates.length === 0 && (
                    <div className="py-24 text-center text-slate-400">
                        No templates available in this category yet.
                    </div>
                )}

                {/* Card grid */}
                {!error && (
                    <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                        {loading
                            ? Array.from({ length: pageSize }).map((_, i) => <SkeletonCard key={i} />)
                            : templates.map((doc) => (
                                <TemplateCard
                                    key={doc.id}
                                    doc={doc}
                                    onOpenEditor={handleOpenEditor}
                                    isOpening={openingId === doc.id}
                                />
                            ))
                        }
                    </div>
                )}

                {/* Pagination */}
                {!loading && !error && totalElements > 0 && (
                    <Pagination
                        page={page}
                        totalPages={totalPages}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        onPageSizeChange={handlePageSizeChange}
                    />
                )}
            </div>
        </div>
    );
}
