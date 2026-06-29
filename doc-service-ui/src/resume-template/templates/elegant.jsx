import { Field, PeriodField, PhotoField } from '../shared';
import { Bullets } from './_parts';

const accent = 'text-[color:var(--rb-accent)]';

const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[1em] w-[1em] shrink-0 align-[-0.12em]"><path d={d} /></svg>
);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z',
    globe: 'M2 5.5A1.5 1.5 0 013.5 4h17A1.5 1.5 0 0122 5.5v13a1.5 1.5 0 01-1.5 1.5h-17A1.5 1.5 0 012 18.5v-13zM4 8v10h16V8H4zm2 2h8v2H6v-2z',
};

const ContactItem = ({ icon, value, onChange, ph }) => (
    <div className="flex items-start gap-2.5 text-[0.9em] text-slate-700">
        <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded bg-[color:var(--rb-accent)] text-white"><Icon d={ICONS[icon]} /></span>
        <Field value={value} onChange={onChange} ph={ph} className="min-w-0 flex-1 break-words" />
    </div>
);

const elegant = {
    code: 'elegant',
    name: 'Elegant',
    accent: '#2b2b2b',
    sheetClass: 'font-sans text-slate-800',
    layout: {
        type: 'two-column',
        splitHeader: true,
        sidebar: ['summary', 'education', 'skills', 'languages', 'interests', 'awards'],
        sidebarWidth: '33%',
        sidebarClass: 'rounded-xl bg-[#e9e8e4] px-6 py-7',
        gap: 'gap-8',
    },

    renderSidebarHeader: (r, set) => (
        <div className="mb-6">
            <div className="mx-auto h-36 w-36 overflow-hidden rounded-full ring-4 ring-white shadow-md">
                <PhotoField value={r.photo} onChange={(v) => set('photo', v)} className="h-full w-full" />
            </div>
        </div>
    ),

    renderHeader: (r, set) => (
        <div className="mb-2">
            <div className="rounded-md bg-[color:var(--rb-accent)] px-6 py-5 text-white">
                <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.4em] font-bold uppercase leading-none tracking-wide" />
                <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="mt-1.5 block text-[1.05em] uppercase tracking-[0.3em] text-white/85" />
            </div>
            <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-3">
                <ContactItem icon="phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <ContactItem icon="globe" value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="Website / LinkedIn" />
                <ContactItem icon="mail" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <ContactItem icon="pin" value={r.location} onChange={(v) => set('location', v)} ph="Address" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <div className="mb-3 flex items-center gap-3">
            <h2 className="text-[1.05em] font-bold uppercase tracking-[0.18em] text-slate-800">{title}</h2>
            <div className="h-px flex-1 bg-slate-400/60" />
        </div>
    ),

    renderText: (value, onChange, ph, col) => (
        <Field as="p" value={value} onChange={onChange} ph={ph} className={`leading-relaxed ${col === 'sidebar' ? 'text-justify text-slate-600' : 'text-slate-600'}`} />
    ),

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph, col } = ctx;
        const sidebar = col === 'sidebar';

        if (kind === 'exp') {
            return (
                <div className="relative border-l-2 border-slate-300 pb-2 pl-6">
                    <span aria-hidden className="absolute -left-[8px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[color:var(--rb-accent)] bg-white" />
                    <div className="flex items-baseline justify-between gap-3">
                        <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="font-bold text-slate-800" />
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="shrink-0 rounded px-1 text-[0.9em] italic text-slate-500 transition hover:bg-slate-100" />
                    </div>
                    <p className="text-[0.95em] text-slate-600">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} />
                        <span className="px-1.5 text-slate-300">|</span>
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" />
                    </p>
                    <Bullets bullets={bullets} />
                </div>
            );
        }

        if (kind === 'edu') {
            return sidebar ? (
                <div className="mb-3">
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="block font-bold text-slate-800" />
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block text-[0.95em] text-slate-600" />
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="block text-[0.9em] text-slate-500" />
                </div>
            ) : (
                <>
                    <div className="flex items-baseline justify-between gap-3">
                        <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="font-bold text-slate-800" />
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="shrink-0 text-[0.9em] italic text-slate-500" />
                    </div>
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block text-[0.95em] text-slate-600" />
                </>
            );
        }

        if (kind === 'proj') {
            return (
                <div className="relative border-l-2 border-slate-300 pb-2 pl-6">
                    <span aria-hidden className="absolute -left-[8px] top-0.5 h-3.5 w-3.5 rounded-full border-2 border-[color:var(--rb-accent)] bg-white" />
                    <div className="flex items-baseline justify-between gap-3">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="font-bold text-slate-800" />
                        <span className="flex shrink-0 items-baseline gap-3 whitespace-nowrap text-[0.9em]">
                            <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className={`underline ${accent}`} />
                            <Field value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} ph="Live URL" className={`underline ${accent}`} />
                        </span>
                    </div>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block text-[0.95em] italic text-slate-600" />
                    <Bullets bullets={bullets} />
                </div>
            );
        }

        if (kind === 'pair') {
            const pct = Math.max(5, Math.min(100, parseInt(String(item.value || '').replace(/[^0-9]/g, ''), 10) || 70));
            return (
                <div className="mb-2.5 flex items-center gap-3">
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Skill" className="w-28 shrink-0 text-slate-700" />
                    <div className="relative h-1.5 flex-1 rounded-full bg-slate-400/40">
                        <div className="absolute inset-y-0 left-0 rounded-full bg-[color:var(--rb-accent)]" style={{ width: `${pct}%` }} />
                    </div>
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="%" className="w-7 shrink-0 text-right text-[0.7em] text-slate-400" />
                </div>
            );
        }

        if (kind === 'courses') {
            return (
                <p className={sidebar ? 'text-slate-700' : 'text-slate-700'}>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="font-semibold" />
                    <span className="px-1.5 text-slate-400">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} />
                </p>
            );
        }

        return (
            <p className="flex gap-2.5 text-slate-700">
                <span aria-hidden className="mt-[0.5em] h-1.5 w-1.5 shrink-0 rounded-full bg-slate-700" />
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
            </p>
        );
    },
};

export default elegant;
