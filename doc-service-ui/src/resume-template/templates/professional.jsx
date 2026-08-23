import { Field, PeriodField } from '../shared';
import { Bullets } from './_parts';

const ACCENT = '#2f6fed';

/** Small meta/contact icon that scales with the surrounding font size. */
const icon = (d, dd) => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round"
        style={{ width: '1.05em', height: '1.05em' }} className="shrink-0">
        <path d={d} />{dd && <path d={dd} />}
    </svg>
);
const I_PHONE = 'M2.25 6.75c0 8.284 6.716 15 15 15h2.25a2.25 2.25 0 0 0 2.25-2.25v-1.37c0-.52-.35-.97-.85-1.09l-4.42-1.11c-.44-.11-.9.06-1.17.42l-.97 1.29c-.28.38-.77.54-1.21.38a12.04 12.04 0 0 1-7.14-7.14c-.16-.44 0-.93.38-1.21l1.29-.97c.36-.27.53-.73.42-1.17L6.96 3.1A1.13 1.13 0 0 0 5.87 2.25H4.5A2.25 2.25 0 0 0 2.25 4.5z';
const I_MAIL_A = 'M16.5 12a4.5 4.5 0 1 0-9 0 4.5 4.5 0 0 0 9 0z';
const I_MAIL_B = 'M16.5 12v1.5a2.25 2.25 0 0 0 4.5 0V12a9 9 0 1 0-9 9 8.96 8.96 0 0 0 4.5-1.2';
const I_LINK = 'M13.19 8.69a4.5 4.5 0 0 1 1.24 7.24l-4.5 4.5a4.5 4.5 0 0 1-6.36-6.36l1.76-1.76m13.35-.62 1.76-1.76a4.5 4.5 0 0 0-6.37-6.36l-4.5 4.5a4.5 4.5 0 0 0 1.25 7.24';
const I_PIN_A = 'M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0z';
const I_PIN_B = 'M19.5 10.5c0 7.14-7.5 11.25-7.5 11.25S4.5 17.64 4.5 10.5a7.5 7.5 0 1 1 15 0z';
const I_CAL = 'M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5A2.25 2.25 0 0 1 5.25 5.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25M3 18.75A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75M3 18.75V11.25A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5';

const contact = (ic, node) => (
    <span className="flex items-center gap-1.5"><span style={{ color: ACCENT }}>{ic}</span>{node}</span>
);

/** Date + location meta row under a job/education entry. */
const metaRow = (item, update) => (
    <div className="mt-0.5 flex flex-wrap items-center gap-x-4 gap-y-0.5 text-[0.82em] text-slate-500">
        <span className="flex items-center gap-1">{icon(I_CAL)}<PeriodField value={item.period} onChange={(v) => update({ period: v })} /></span>
        <span className="flex items-center gap-1">{icon(I_PIN_A, I_PIN_B)}<Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" /></span>
    </div>
);

const LEVELS = [
    [/(native|mother|bilingual)/i, 5],
    [/(fluent|proficient|advanced|c2|c1)/i, 4],
    [/(intermediate|conversational|b2|b1)/i, 3],
    [/(basic|beginner|elementary|a2|a1)/i, 2],
];
const levelOf = (text) => {
    for (const [re, n] of LEVELS) if (re.test(text || '')) return n;
    return 3;
};

const professional = {
    code: 'professional',
    name: 'Professional',
    accent: ACCENT,
    sheetClass: 'font-sans text-slate-900',

    layout: {
        type: 'two-column',
        sidebarSide: 'right',
        sidebarWidth: '35%',
        gap: 'gap-8',
        splitHeader: true, // header stays in the main (left) column; sidebar starts at the same top
        sidebar: ['achievements', 'skills', 'education', 'certifications', 'courses', 'interests', 'awards', 'publications', 'references'],
    },

    renderHeader: (r, set) => (
        <div>
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.15em] font-extrabold uppercase leading-none tracking-tight" />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="Your headline — separate ideas with |" className="mt-1.5 block text-[1.05em] font-semibold" style={{ color: ACCENT }} />
            <div className="mt-2.5 flex flex-wrap items-center gap-x-4 gap-y-1 text-[0.82em] text-slate-600">
                {contact(icon(I_PHONE), <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />)}
                {contact(icon(I_MAIL_A, I_MAIL_B), <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" />)}
                {contact(icon(I_LINK), <Field value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" />)}
                {contact(icon(I_PIN_A, I_PIN_B), <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" />)}
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <h2 className="mb-2.5 border-b-2 border-slate-900 pb-1 text-[1.05em] font-extrabold uppercase tracking-wide text-slate-900">{title}</h2>
    ),

    renderText: (value, onChange, ph) => (
        <Field as="p" value={value} onChange={onChange} ph={ph} className="text-[0.9em] leading-relaxed text-slate-700" />
    ),

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph, type, col } = ctx;
        const sidebar = col === 'sidebar';

        if (kind === 'exp' || kind === 'proj') {
            const role = kind === 'exp' ? item.secondary : item.primary;
            const org = kind === 'exp' ? item.primary : item.secondary;
            const setRole = (v) => update(kind === 'exp' ? { secondary: v } : { primary: v });
            const setOrg = (v) => update(kind === 'exp' ? { primary: v } : { secondary: v });
            return (
                <>
                    <Field value={role} onChange={setRole} ph={kind === 'exp' ? secondaryPh : primaryPh} className="block text-[1.02em] font-bold text-slate-900" />
                    <Field value={org} onChange={setOrg} ph={kind === 'exp' ? primaryPh : secondaryPh} className="block font-semibold" style={{ color: ACCENT }} />
                    {metaRow(item, update)}
                    <Bullets bullets={bullets} />
                </>
            );
        }

        if (kind === 'edu') {
            return (
                <>
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="block text-[1.02em] font-bold text-slate-900" />
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block font-semibold" style={{ color: ACCENT }} />
                    {metaRow(item, update)}
                </>
            );
        }

        if (kind === 'courses') {
            return (
                <div className={sidebar ? 'border-b border-dashed border-slate-200 pb-2.5' : ''}>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="block font-bold text-slate-900" />
                    <Field as="p" value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} className="mt-0.5 text-[0.88em] leading-relaxed text-slate-600" />
                </div>
            );
        }

        if (kind === 'pair') {
            return (
                <p className="text-[0.9em] leading-relaxed text-slate-700">
                    {item.label && <Field value={item.label} onChange={(v) => update({ label: v })} ph="Category" className="font-semibold text-slate-900" />}
                    {item.label && <span className="px-1 text-slate-400">·</span>}
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" />
                </p>
            );
        }

        // Languages — entry text with a 5-segment proficiency meter.
        if (type === 'languages') {
            const filled = levelOf(item.text);
            return (
                <div className="flex items-center justify-between gap-3">
                    <Field value={item.text} onChange={(v) => update({ text: v })} ph="Language — proficiency" className="text-[0.9em] font-medium text-slate-800" />
                    <span className="flex shrink-0 gap-1">
                        {[1, 2, 3, 4, 5].map((n) => (
                            <span key={n} className="h-2 w-2.5 rounded-[1px]" style={{ backgroundColor: n <= filled ? ACCENT : '#e2e8f0' }} />
                        ))}
                    </span>
                </div>
            );
        }

        // Key Achievements / Interests / Awards / Publications (single-text items).
        return (
            <div className={sidebar ? 'border-b border-dashed border-slate-200 pb-2.5' : ''}>
                <Field as="p" value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="text-[0.9em] leading-relaxed text-slate-700" />
            </div>
        );
    },
};

export default professional;
