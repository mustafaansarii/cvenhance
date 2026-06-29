import { Field, PeriodField, PhotoField } from '../shared';

const accent = 'text-[color:var(--rb-accent)]';

const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[1em] w-[1em] shrink-0 align-[-0.12em]"><path d={d} /></svg>
);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z',
    linkedin: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.3 18.3H5.7V9.8h2.6v8.5zM7 8.6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11.3 9.7h-2.6v-4.1c0-1-.4-1.6-1.2-1.6-.7 0-1.1.5-1.3 1-.1.2-.1.5-.1.7v4h-2.6V9.8h2.6v1.1c.4-.6 1-1.3 2.3-1.3 1.7 0 2.9 1.1 2.9 3.4v5.3z',
};

const ContactLine = ({ icon, value, onChange, ph }) => (
    <div className="flex items-center gap-3 text-[0.92em] text-white/90">
        <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white/10 text-[color:var(--rb-accent)]"><Icon d={ICONS[icon]} /></span>
        <Field value={value} onChange={onChange} ph={ph} className="min-w-0 flex-1 break-words" />
    </div>
);

// Square-marker bullet list to match the template look.
const SquareBullets = ({ bullets, tone = 'dark' }) => {
    const text = tone === 'light' ? 'text-white/85' : 'text-slate-700';
    const dot = tone === 'light' ? 'bg-white/70' : 'bg-slate-800';
    return (
        <ul className={`mt-1.5 space-y-1 ${text}`}>
            {bullets.list.map((b) => (
                <li key={b.id} className="group/b relative flex gap-2.5">
                    <span aria-hidden className={`mt-[0.55em] h-[5px] w-[5px] shrink-0 ${dot}`} />
                    <Field value={b.text} onChange={(v) => bullets.update(b.id, v)} ph="Key responsibility or achievement" className="block flex-1" />
                    {bullets.list.length > 1 && (
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => bullets.remove(b.id)} title="Remove highlight" className="no-print absolute -left-5 top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-500 hover:bg-red-100 group-hover/b:flex">×</button>
                    )}
                </li>
            ))}
            <li className="no-print">
                <button onClick={bullets.add} className="text-xs font-semibold text-[color:var(--rb-accent)] hover:opacity-80">+ highlight</button>
            </li>
        </ul>
    );
};

const ramanSingh = {
    code: 'raman-singh',
    name: 'Raman Singh',
    accent: '#c0974a',
    sheetClass: 'font-sans text-slate-800',
    layout: {
        type: 'two-column',
        splitHeader: true,
        sidebar: ['skills', 'languages', 'interests', 'awards'],
        sidebarWidth: '34%',
        sidebarClass: 'rounded-xl bg-[#1e4642] px-6 py-7 text-white',
        gap: 'gap-7',
    },

    renderSidebarHeader: (r, set) => (
        <div className="mb-6">
            <div className="mx-auto mb-7 h-36 w-36 overflow-hidden rounded-full ring-4 ring-[color:var(--rb-accent)]">
                <PhotoField value={r.photo} onChange={(v) => set('photo', v)} className="h-full w-full" />
            </div>
            <div className="space-y-3">
                <ContactLine icon="phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <ContactLine icon="mail" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <ContactLine icon="pin" value={r.location} onChange={(v) => set('location', v)} ph="Location" />
                <ContactLine icon="linkedin" value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" />
            </div>
        </div>
    ),

    renderHeader: (r, set) => (
        <div className="mb-2">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.6em] font-bold uppercase leading-none tracking-wide text-[#1e4642]" />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="Job title" className={`mt-2 block text-[1em] font-semibold uppercase tracking-[0.3em] ${accent}`} />
        </div>
    ),

    renderTitle: (title, col) => (
        col === 'sidebar' ? (
            <div className="mb-3 rounded-full border-2 border-[color:var(--rb-accent)] py-1 text-center text-[0.9em] font-bold uppercase tracking-[0.22em] text-[color:var(--rb-accent)]">{title}</div>
        ) : (
            <div className="mb-4 rounded-full bg-[color:var(--rb-accent)] py-1.5 text-center text-[0.95em] font-bold uppercase tracking-[0.3em] text-white">{title}</div>
        )
    ),

    renderText: (value, onChange, ph, col) => (
        <Field as="p" value={value} onChange={onChange} ph={ph} className={`leading-relaxed ${col === 'sidebar' ? 'text-white/85' : 'text-slate-600'}`} />
    ),

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph, col } = ctx;
        const sidebar = col === 'sidebar';

        if (kind === 'exp') {
            return (
                <>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block font-bold uppercase tracking-wide text-slate-800" />
                    <p className="mt-0.5 text-[0.95em] text-slate-600">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} />
                        <span className="px-1.5 text-slate-300">|</span>
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" />
                        <span className="px-1.5 text-slate-300">|</span>
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="rounded px-1 transition hover:bg-slate-100" />
                    </p>
                    <SquareBullets bullets={bullets} />
                </>
            );
        }

        if (kind === 'edu') {
            return (
                <>
                    <p>
                        <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="font-bold text-slate-800" />
                        <span className="px-1.5 text-slate-300">|</span>
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="rounded px-1 text-slate-600 transition hover:bg-slate-100" />
                    </p>
                    <p className="text-[0.95em] text-slate-600">
                        <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" />
                        <span className="px-1.5 text-slate-300">,</span>
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" />
                    </p>
                </>
            );
        }

        if (kind === 'proj') {
            return (
                <>
                    <div className="flex items-baseline justify-between gap-3">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="font-bold text-slate-800" />
                        <span className="flex shrink-0 items-baseline gap-3 whitespace-nowrap text-[0.9em]">
                            <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className={`underline ${accent}`} />
                            <Field value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} ph="Live URL" className={`underline ${accent}`} />
                        </span>
                    </div>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block text-[0.95em] italic text-slate-600" />
                    <SquareBullets bullets={bullets} />
                </>
            );
        }

        if (kind === 'pair') {
            return (
                <p className={`flex gap-2.5 ${sidebar ? 'text-white/90' : 'text-slate-700'}`}>
                    <span aria-hidden className={`mt-[0.5em] h-[5px] w-[5px] shrink-0 ${sidebar ? 'bg-white/70' : 'bg-[color:var(--rb-accent)]'}`} />
                    <span className="flex-1">
                        <Field value={item.label} onChange={(v) => update({ label: v })} ph="Skill" className="font-medium" />
                        <Field value={item.value} onChange={(v) => update({ value: v })} ph="" className="text-current/70" />
                    </span>
                </p>
            );
        }

        if (kind === 'courses') {
            return (
                <p className={sidebar ? 'text-white/90' : 'text-slate-700'}>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="font-semibold" />
                    <span className="px-1.5 opacity-50">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} />
                </p>
            );
        }

        return (
            <p className={`flex gap-2.5 ${sidebar ? 'text-white/90' : 'text-slate-700'}`}>
                <span aria-hidden className={`mt-[0.5em] h-[5px] w-[5px] shrink-0 ${sidebar ? 'bg-white/70' : 'bg-[color:var(--rb-accent)]'}`} />
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
            </p>
        );
    },
};

export default ramanSingh;
