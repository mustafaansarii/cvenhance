import { useCallback, useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { Helmet } from 'react-helmet-async';
import authService from '../services/auth.service';
import adminService from '../services/admin.service';
import Navbar from '../components/navbar/Navbar';

const STATUS_OPTIONS = ['PENDING', 'COMPILING', 'READY', 'FAILED'];
const SUB_OPTIONS = ['PAID', 'FREE'];
const AUDIT_ACTIONS = [
    'SIGNUP', 'LOGIN', 'OAUTH_LOGIN', 'LOGOUT', 'PROFILE_UPDATED', 'RESUME_IMPORTED',
    'RESUME_ANALYZED', 'AI_ASSIST_USED', 'TEMPLATE_CLAIMED', 'TEMPLATE_UNLOCKED',
    'DOC_DOWNLOADED', 'PAYMENT_ORDER_CREATED', 'PAYMENT_VERIFIED', 'SUBSCRIPTION_GRANTED', 'CONTACT_SUBMITTED',
];

const fmt = (v) => {
    if (v == null || v === '') return '—';
    if (typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(v)) {
        const d = new Date(v);
        if (!Number.isNaN(d.getTime())) return d.toLocaleString();
    }
    if (Array.isArray(v)) return v.join(', ');
    return String(v);
};

const TABS = [
    {
        key: 'users',
        label: 'Users',
        fetch: (p) => adminService.listUsers(p),
        patch: (u) => adminService.updateUsers(u),
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'email', label: 'Email' },
            { key: 'fullName', label: 'Name', edit: 'text' },
            { key: 'verified', label: 'Verified', edit: 'checkbox' },
            { key: 'provider', label: 'Provider' },
            { key: 'createdAt', label: 'Created' },
        ],
    },
    {
        key: 'templates',
        label: 'Doc Templates',
        fetch: (p) => adminService.listTemplates(p),
        patch: (u) => adminService.updateTemplates(u),
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'templateCode', label: 'Code' },
            { key: 'name', label: 'Name', edit: 'text' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status', edit: 'select', options: STATUS_OPTIONS },
            { key: 'subscriptionType', label: 'Plan', edit: 'select', options: SUB_OPTIONS },
            { key: 'createdAt', label: 'Created' },
        ],
    },
    {
        key: 'userDocs',
        label: 'User Docs',
        fetch: (p) => adminService.listUserDocs(p),
        patch: (u) => adminService.updateUserDocs(u),
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'ownerEmail', label: 'Owner' },
            { key: 'templateCode', label: 'Code' },
            { key: 'name', label: 'Name', edit: 'text' },
            { key: 'type', label: 'Type' },
            { key: 'status', label: 'Status', edit: 'select', options: STATUS_OPTIONS },
            { key: 'subscriptionType', label: 'Plan', edit: 'select', options: SUB_OPTIONS },
            { key: 'updatedAt', label: 'Updated' },
        ],
    },
    {
        key: 'audit',
        label: 'Audit Events',
        fetch: (p) => adminService.listAudit(p),
        patch: null,
        hasActionFilter: true,
        columns: [
            { key: 'id', label: 'ID' },
            { key: 'action', label: 'Action' },
            { key: 'actorEmail', label: 'Actor' },
            { key: 'targetType', label: 'Target' },
            { key: 'targetId', label: 'Target ID' },
            { key: 'detail', label: 'Detail' },
            { key: 'ipAddress', label: 'IP' },
            { key: 'createdAt', label: 'When' },
        ],
    },
];

function AdminTable({ tab }) {
    const [rows, setRows] = useState([]);
    const [pageInfo, setPageInfo] = useState({ page: 0, totalPages: 0, totalElements: 0, last: true });
    const [page, setPage] = useState(0);
    const [keyword, setKeyword] = useState('');
    const [searchInput, setSearchInput] = useState('');
    const [action, setAction] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [direction, setDirection] = useState('desc');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [edits, setEdits] = useState({});

    const size = 15;

    const load = useCallback(async () => {
        setLoading(true);
        try {
            const params = { page, size, keyword, sortBy, direction };
            if (tab.hasActionFilter && action) params.action = action;
            const data = await tab.fetch(params);
            setRows(data.content || []);
            setPageInfo({ page: data.page, totalPages: data.totalPages, totalElements: data.totalElements, last: data.last });
            setEdits({});
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [tab, page, keyword, action, sortBy, direction]);

    useEffect(() => { load(); }, [load]);

    // reset when switching tabs
    useEffect(() => {
        setPage(0); setKeyword(''); setSearchInput(''); setAction('');
        setSortBy(''); setDirection('desc'); setEdits({});
    }, [tab]);

    // Click a header to sort by it; click again to flip direction.
    const toggleSort = (key) => {
        setPage(0);
        if (sortBy === key) {
            setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortBy(key);
            setDirection('asc');
        }
    };

    const valueOf = (row, key) => (edits[row.id]?.[key] !== undefined ? edits[row.id][key] : row[key]);

    const setEdit = (id, key, value) => {
        setEdits((prev) => ({ ...prev, [id]: { ...prev[id], [key]: value } }));
    };

    const dirtyCount = Object.keys(edits).length;

    const save = async () => {
        if (!tab.patch || dirtyCount === 0) return;
        const payload = Object.entries(edits).map(([id, fields]) => ({ id: Number(id), ...fields }));
        setSaving(true);
        try {
            await tab.patch(payload);
            toast.success(`Saved ${payload.length} change${payload.length > 1 ? 's' : ''}`);
            await load();
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Save failed');
        } finally {
            setSaving(false);
        }
    };

    const submitSearch = (e) => { e.preventDefault(); setPage(0); setKeyword(searchInput.trim()); };

    const renderCell = (row, col) => {
        const v = valueOf(row, col.key);
        if (!col.edit) return <span className="text-muted-foreground">{fmt(v)}</span>;
        if (col.edit === 'text') {
            return (
                <input
                    value={v ?? ''}
                    onChange={(e) => setEdit(row.id, col.key, e.target.value)}
                    className="w-full min-w-[8rem] rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
                />
            );
        }
        if (col.edit === 'select') {
            return (
                <select
                    value={v ?? ''}
                    onChange={(e) => setEdit(row.id, col.key, e.target.value)}
                    className="rounded border border-border bg-background px-2 py-1 text-sm outline-none focus:border-accent"
                >
                    {col.options.map((o) => <option key={o} value={o}>{o}</option>)}
                </select>
            );
        }
        if (col.edit === 'checkbox') {
            return (
                <input
                    type="checkbox"
                    checked={!!v}
                    onChange={(e) => setEdit(row.id, col.key, e.target.checked)}
                    className="h-4 w-4 accent-[var(--accent,#0f766e)]"
                />
            );
        }
        return fmt(v);
    };

    return (
        <div>
            <div className="mb-3 flex flex-wrap items-center gap-2">
                <form onSubmit={submitSearch} className="flex items-center gap-2">
                    <input
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        placeholder="Search…"
                        className="w-56 rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    />
                    <button type="submit" className="rounded-lg border border-border px-3 py-2 text-sm font-medium hover:bg-muted">Search</button>
                </form>
                {tab.hasActionFilter && (
                    <select
                        value={action}
                        onChange={(e) => { setPage(0); setAction(e.target.value); }}
                        className="rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-accent"
                    >
                        <option value="">All actions</option>
                        {AUDIT_ACTIONS.map((a) => <option key={a} value={a}>{a}</option>)}
                    </select>
                )}
                <div className="ml-auto flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">{pageInfo.totalElements} total</span>
                    {tab.patch && (
                        <button
                            onClick={save}
                            disabled={dirtyCount === 0 || saving}
                            className="rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover disabled:opacity-50"
                        >
                            {saving ? 'Saving…' : `Save${dirtyCount ? ` (${dirtyCount})` : ''}`}
                        </button>
                    )}
                </div>
            </div>

            <div className="overflow-x-auto border border-border">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr className="border-b border-border bg-muted/50 text-left">
                            {tab.columns.map((c) => (
                                <th key={c.key} className="whitespace-nowrap px-3 py-2 font-semibold text-foreground">
                                    <button
                                        type="button"
                                        onClick={() => toggleSort(c.key)}
                                        className={`inline-flex items-center gap-1 transition hover:text-accent ${sortBy === c.key ? 'text-accent' : ''}`}
                                        title={`Sort by ${c.label}`}
                                    >
                                        {c.label}
                                        <span className="text-[10px] leading-none">
                                            {sortBy === c.key ? (direction === 'asc' ? '▲' : '▼') : '↕'}
                                        </span>
                                    </button>
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={tab.columns.length} className="px-3 py-8 text-center text-muted-foreground">Loading…</td></tr>
                        ) : rows.length === 0 ? (
                            <tr><td colSpan={tab.columns.length} className="px-3 py-8 text-center text-muted-foreground">No records</td></tr>
                        ) : rows.map((row) => (
                            <tr key={row.id} className={`border-b border-border last:border-0 ${edits[row.id] ? 'bg-accent/5' : ''}`}>
                                {tab.columns.map((c) => (
                                    <td key={c.key} className="whitespace-nowrap px-3 py-2 align-middle">{renderCell(row, c)}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                    Page {pageInfo.totalPages === 0 ? 0 : pageInfo.page + 1} of {pageInfo.totalPages}
                </span>
                <div className="flex gap-2">
                    <button
                        onClick={() => setPage((p) => Math.max(0, p - 1))}
                        disabled={page === 0 || loading}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                    >Prev</button>
                    <button
                        onClick={() => setPage((p) => p + 1)}
                        disabled={pageInfo.last || loading}
                        className="rounded-lg border border-border px-3 py-1.5 text-sm font-medium hover:bg-muted disabled:opacity-50"
                    >Next</button>
                </div>
            </div>
        </div>
    );
}

export default function AdminPage() {
    const navigate = useNavigate();
    const [authorized, setAuthorized] = useState(null); // null=checking, false=deny, true=allow
    const [activeKey, setActiveKey] = useState('users');

    useEffect(() => {
        let alive = true;
        authService.me()
            .then((me) => { if (alive) setAuthorized(Array.isArray(me?.roles) && me.roles.includes('ADMIN')); })
            .catch(() => { if (alive) setAuthorized(false); });
        return () => { alive = false; };
    }, []);

    useEffect(() => {
        if (authorized === false) {
            toast.error('Admin access required');
            navigate('/', { replace: true });
        }
    }, [authorized, navigate]);

    const activeTab = useMemo(() => TABS.find((t) => t.key === activeKey), [activeKey]);

    return (
        <div className="min-h-screen bg-background">
            <Helmet><title>Admin · CVEnhance</title><meta name="robots" content="noindex" /></Helmet>
            <div
                className="home-page-hero-bg border-b border-black/50 bg-top bg-no-repeat"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
            </div>

            {authorized !== true ? (
                <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">Checking access…</div>
            ) : (
                <div className="mx-auto max-w-7xl px-4 py-8">
                    <h1 className="mb-1 text-2xl font-bold text-foreground">Admin</h1>
                    <p className="mb-6 text-sm text-muted-foreground">Manage users, templates, documents, and review audit activity.</p>

                    <div className="mb-6 flex flex-wrap gap-1 border-b border-border">
                        {TABS.map((t) => (
                            <button
                                key={t.key}
                                onClick={() => setActiveKey(t.key)}
                                className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold transition ${
                                    activeKey === t.key
                                        ? 'border-accent text-accent'
                                        : 'border-transparent text-muted-foreground hover:text-foreground'
                                }`}
                            >
                                {t.label}
                            </button>
                        ))}
                    </div>

                    <AdminTable key={activeKey} tab={activeTab} />
                </div>
            )}
        </div>
    );
}
