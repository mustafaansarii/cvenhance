import { useEffect, useRef, useState } from 'react';

/*
 * Shared engine pieces for the form-based resume builder.
 * Every template design reuses these — only the visual layout (Header / SectionTitle / item slots)
 * differs per template. See templates/*.jsx and registry.js.
 */

/* ── Page geometry (US Letter @96dpi) ────────────────────────────────── */
export const PAGE_W = 816;        // 8.5in
export const PAGE = 1056;         // 11in
export const GAP = 40;            // gap between page cards on screen
export const STRIDE = PAGE + GAP;
export const MARGIN = 48;         // on-screen page padding (0.5in)

let _id = 0;
export const nextId = () => ++_id;

/* ── Section catalog (shared across all designs) ─────────────────────── */
export const SECTION_CATALOG = [
    { type: 'summary', title: 'Summary', kind: 'text', ph: "Briefly explain why you're a great fit for the role." },
    { type: 'experience', title: 'Experience', kind: 'exp', primaryPh: 'Company Name', secondaryPh: 'Title', addLabel: 'experience' },
    { type: 'education', title: 'Education', kind: 'edu', addLabel: 'education' },
    { type: 'skills', title: 'Skills', kind: 'simple', ph: 'Your Skill', addLabel: 'skill' },
    { type: 'projects', title: 'Projects', kind: 'exp', primaryPh: 'Project Name', secondaryPh: 'Tech / Role', addLabel: 'project' },
    { type: 'courses', title: 'Training / Courses', kind: 'courses', primaryPh: 'Course Title', secondaryPh: 'Which institution provided the course?', addLabel: 'course' },
    { type: 'certifications', title: 'Certifications', kind: 'courses', primaryPh: 'Certification', secondaryPh: 'Issuing organization', addLabel: 'certification' },
    { type: 'achievements', title: 'Key Achievements', kind: 'simple', ph: 'Describe a key achievement', addLabel: 'achievement' },
    { type: 'awards', title: 'Awards', kind: 'simple', ph: 'Award or honor', addLabel: 'award' },
    { type: 'languages', title: 'Languages', kind: 'simple', ph: 'Language — proficiency', addLabel: 'language' },
    { type: 'volunteer', title: 'Volunteering', kind: 'exp', primaryPh: 'Organization', secondaryPh: 'Role', addLabel: 'entry' },
    { type: 'publications', title: 'Publications', kind: 'simple', ph: 'Publication, journal, year', addLabel: 'publication' },
    { type: 'interests', title: 'Interests', kind: 'simple', ph: 'Interest', addLabel: 'interest' },
    { type: 'references', title: 'References', kind: 'text', ph: 'Available upon request.' },
];
export const META = Object.fromEntries(SECTION_CATALOG.map((s) => [s.type, s]));
export const NEEDS_ITEMS = new Set(['exp', 'edu', 'simple', 'courses']);

/* ── Editable text (uncontrolled contentEditable; the DOM is the data) ─ */
export function Editable({ as: Tag = 'span', ph, className = '' }) {
    return <Tag contentEditable suppressContentEditableWarning spellCheck={false} data-ph={ph} className={`editable ${className}`} />;
}

/* ── Month/Year period picker → "Jan 2020 - Present" / "Jan 2020 - Dec 2020" ── */
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const YEARS = (() => { const now = new Date().getFullYear(); const a = []; for (let y = now + 6; y >= 1980; y--) a.push(y); return a; })();
const selectCls = 'flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-700 focus:border-teal-400 focus:outline-none disabled:opacity-40';

function PeriodRow({ label, m, y, onM, onY, disabled }) {
    return (
        <div className="mb-2.5">
            <p className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
            <div className="flex gap-2">
                <select value={m} onChange={(e) => onM(e.target.value)} disabled={disabled} className={selectCls}>
                    <option value="">Month</option>
                    {MONTHS.map((mm) => <option key={mm} value={mm}>{mm}</option>)}
                </select>
                <select value={y} onChange={(e) => onY(e.target.value)} disabled={disabled} className={selectCls}>
                    <option value="">Year</option>
                    {YEARS.map((yy) => <option key={yy} value={yy}>{yy}</option>)}
                </select>
            </div>
        </div>
    );
}

export function PeriodField({ className = 'block w-full rounded px-1 text-right text-slate-500 transition hover:bg-teal-50' }) {
    const [open, setOpen] = useState(false);
    const [v, setV] = useState({ sm: '', sy: '', em: '', ey: '', present: false });
    const ref = useRef(null);
    useEffect(() => {
        const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
        document.addEventListener('mousedown', h);
        return () => document.removeEventListener('mousedown', h);
    }, []);
    const upd = (k, val) => setV((s) => ({ ...s, [k]: val }));
    const fmt = (m, y) => (y ? (m ? `${m} ${y}` : `${y}`) : '');
    const start = fmt(v.sm, v.sy);
    const end = v.present ? 'Present' : fmt(v.em, v.ey);
    const label = start || end ? [start, end].filter(Boolean).join(' - ') : '';
    return (
        <span ref={ref} className="relative block">
            <button type="button" onClick={() => setOpen((o) => !o)} className={className}>
                {label ? label : <span className="period-ph text-slate-400">Date period</span>}
            </button>
            {open && (
                <div className="no-print absolute right-0 z-50 mt-1 w-64 rounded-xl border border-slate-200 bg-white p-3 text-left shadow-xl">
                    <PeriodRow label="Start" m={v.sm} y={v.sy} onM={(x) => upd('sm', x)} onY={(x) => upd('sy', x)} />
                    <PeriodRow label="End" m={v.em} y={v.ey} onM={(x) => upd('em', x)} onY={(x) => upd('ey', x)} disabled={v.present} />
                    <label className="mt-1 flex items-center gap-2 text-xs font-medium text-slate-600">
                        <input type="checkbox" checked={v.present} onChange={(e) => upd('present', e.target.checked)} className="h-3.5 w-3.5 accent-teal-500" />
                        I currently work / study here
                    </label>
                </div>
            )}
        </span>
    );
}

/* ── Add / Remove controls ───────────────────────────────────────────── */
export function AddButton({ onClick, children }) {
    return (
        <button onClick={onClick} className="no-print mt-2 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-semibold text-teal-600 transition hover:bg-teal-50">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" /></svg>
            {children}
        </button>
    );
}

export function RemoveButton({ onClick }) {
    return (
        <button onMouseDown={(e) => e.preventDefault()} onClick={onClick} title="Remove" className="no-print absolute -left-6 top-0 hidden h-6 w-6 items-center justify-center rounded-full bg-red-50 text-red-500 transition hover:bg-red-100 group-hover/item:flex group-focus-within/item:flex">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3 w-3"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
        </button>
    );
}
