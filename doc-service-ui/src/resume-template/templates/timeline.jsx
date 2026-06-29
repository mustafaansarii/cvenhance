import { Field, PeriodField, PhotoField } from '../shared';

const navyText = 'text-[color:var(--rb-accent)]';
const tealText = 'text-[#3a9aa0]';

const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[1em] w-[1em] shrink-0 align-[-0.12em]"><path d={d} /></svg>
);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z',
    insta: 'M12 2.2c3.2 0 3.6 0 4.9.1 1.2.1 1.8.3 2.2.4.6.2 1 .5 1.4.9.4.4.7.8.9 1.4.2.4.4 1 .4 2.2.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 1.2-.3 1.8-.4 2.2-.2.6-.5 1-.9 1.4-.4.4-.8.7-1.4.9-.4.2-1 .4-2.2.4-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-1.2-.1-1.8-.3-2.2-.4a3.7 3.7 0 01-1.4-.9 3.7 3.7 0 01-.9-1.4c-.2-.4-.4-1-.4-2.2C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-1.2.3-1.8.4-2.2.2-.6.5-1 .9-1.4.4-.4.8-.7 1.4-.9.4-.2 1-.4 2.2-.4 1.3-.1 1.7-.1 4.9-.1zM12 6.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zm0 9a3.5 3.5 0 110-7 3.5 3.5 0 010 7zm5.8-9.2a1.3 1.3 0 11-2.6 0 1.3 1.3 0 012.6 0z',
    work: 'M9 3h6a2 2 0 012 2v1h3a2 2 0 012 2v3H1V8a2 2 0 012-2h3V5a2 2 0 012-2zm0 3h6V5H9v1zM1 13h10v2h2v-2h10v6a2 2 0 01-2 2H3a2 2 0 01-2-2v-6z',
    bulb: 'M9 21h6v-1H9v1zm3-19a7 7 0 00-4 12.7V17h8v-2.3A7 7 0 0012 2zm-2 17h4v1h-4v-1z',
    star: 'M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z',
    grad: 'M12 3L1 8l11 5 9-4.1V14h2V8L12 3zM4 12.5V16c0 1.6 3.6 3 8 3s8-1.4 8-3v-3.5l-8 3.6-8-3.6z',
    lang: 'M12.9 3H4a1 1 0 00-1 1v9a1 1 0 001 1h3v3l3-3h2.9a1 1 0 001-1V4a1 1 0 00-1-1zM6 7h6v1.5H6V7zm0 3h4v1.5H6V10zm11 0h3a1 1 0 011 1v6a1 1 0 01-1 1h-2v3l-3-3h-3a1 1 0 01-1-1v-1h5a2 2 0 002-2v-4z',
    hand: 'M12 2a3 3 0 00-3 3v6H7V7a2 2 0 10-4 0v7c0 3.9 3.1 7 7 7h2a6 6 0 006-6V8a2 2 0 10-4 0v3h-2V5a3 3 0 00-3-3z',
};
const TITLE_ICONS = {
    experience: 'work', volunteer: 'hand', courses: 'grad', certifications: 'grad',
    skills: 'bulb', achievements: 'star', awards: 'star', interests: 'bulb',
    education: 'grad', languages: 'lang', projects: 'work', publications: 'grad',
    summary: 'star', references: 'work',
};

const Contact = ({ icon, value, onChange, ph }) => (
    <span className="inline-flex items-center gap-2 text-[0.92em] text-white">
        <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/20"><Icon d={ICONS[icon]} /></span>
        <Field value={value} onChange={onChange} ph={ph} className="text-white" />
    </span>
);

const timeline = {
    code: 'timeline',
    name: 'Timeline',
    accent: '#33475b',
    sheetClass: 'font-sans text-slate-800',
    layout: {
        type: 'two-column',
        sidebarSide: 'right',
        sidebar: ['skills', 'interests', 'achievements', 'education', 'languages', 'awards', 'certifications'],
        sidebarWidth: '36%',
        sidebarClass: 'rounded-xl bg-[#ededed] px-6 py-7',
        gap: 'gap-8',
        skipSections: ['summary'],
    },

    renderHeader: (r, set) => (
        <div className="overflow-hidden rounded-xl">
            <div className="flex items-stretch gap-5 bg-[color:var(--rb-accent)] px-7 py-6">
                <div className="shrink-0 self-center">
                    <div className="h-32 w-32 overflow-hidden rounded-full ring-4 ring-[#3a9aa0]">
                        <PhotoField value={r.photo} onChange={(v) => set('photo', v)} className="h-full w-full" />
                    </div>
                </div>
                <div className="min-w-0 flex-1">
                    <Field value={r.name} onChange={(v) => set('name', v)} ph="Your Name" className="block text-[2.3em] font-bold leading-none text-white" />
                    <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className={`mt-1 block text-[1.1em] tracking-wide ${tealText}`} />
                    <Field as="p" value={r.summary} onChange={(v) => set('summary', v)} ph="Briefly explain why you're a great fit for the role." className="mt-3 block text-[0.85em] leading-relaxed text-white/90" />
                </div>
            </div>
            <div className="flex flex-wrap items-center gap-x-7 gap-y-2 bg-[#3a9aa0] px-7 py-3">
                <Contact icon="mail" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <Contact icon="phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <Contact icon="pin" value={r.location} onChange={(v) => set('location', v)} ph="Location" />
                <Contact icon="insta" value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="Social / LinkedIn" />
            </div>
        </div>
    ),

    renderTitle: (title, col, type) => (
        <div className="mb-3 flex items-center gap-3">
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[color:var(--rb-accent)] text-white"><Icon d={ICONS[TITLE_ICONS[type] || 'star']} /></span>
            <h2 className={`text-[1.2em] font-extrabold uppercase tracking-wide ${navyText}`}>{title}</h2>
        </div>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="leading-relaxed text-slate-600" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph, col, type } = ctx;
        const sidebar = col === 'sidebar';

        if (kind === 'exp') {
            return (
                <>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className={`block text-[1.1em] font-bold ${navyText}`} />
                    <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`block text-[1.05em] ${navyText}`} />
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className={`mt-0.5 block text-[0.9em] italic ${tealText}`} />
                    <ul className="mt-1.5 space-y-1 text-slate-700">
                        {bullets.list.map((b) => (
                            <li key={b.id} className="group/b relative flex gap-2.5">
                                <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3a9aa0]" />
                                <Field value={b.text} onChange={(v) => bullets.update(b.id, v)} ph="Highlight your accomplishments, using numbers if possible." className="block flex-1" />
                                {bullets.list.length > 1 && (
                                    <button onMouseDown={(e) => e.preventDefault()} onClick={() => bullets.remove(b.id)} title="Remove highlight" className="no-print absolute -left-5 top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-500 hover:bg-red-100 group-hover/b:flex">×</button>
                                )}
                            </li>
                        ))}
                        <li className="no-print"><button onClick={bullets.add} className="text-xs font-semibold text-[#3a9aa0] hover:opacity-80">+ highlight</button></li>
                    </ul>
                </>
            );
        }

        if (kind === 'edu') {
            return (
                <div className="mb-2">
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className={`block font-bold ${navyText}`} />
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block text-slate-700" />
                    <p className={`text-[0.9em] italic ${tealText}`}>
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" />
                        {item.location && item.period ? <span className="px-1">·</span> : null}
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} />
                    </p>
                </div>
            );
        }

        if (kind === 'proj') {
            return (
                <div className="mb-2">
                    <div className="flex items-baseline justify-between gap-3">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`font-bold ${navyText}`} />
                        <span className="flex shrink-0 items-baseline gap-3 whitespace-nowrap text-[0.85em]">
                            <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className={`underline ${tealText}`} />
                            <Field value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} ph="Live URL" className={`underline ${tealText}`} />
                        </span>
                    </div>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block text-slate-700" />
                    <ul className="mt-1 space-y-1 text-slate-700">
                        {bullets.list.map((b) => (
                            <li key={b.id} className="group/b relative flex gap-2.5">
                                <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3a9aa0]" />
                                <Field value={b.text} onChange={(v) => bullets.update(b.id, v)} ph="Describe the project." className="block flex-1" />
                            </li>
                        ))}
                        <li className="no-print"><button onClick={bullets.add} className="text-xs font-semibold text-[#3a9aa0] hover:opacity-80">+ highlight</button></li>
                    </ul>
                </div>
            );
        }

        if (kind === 'courses') {
            return (
                <div className="mb-2">
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className={`block font-bold ${navyText}`} />
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} className="block text-slate-700" />
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className={`block text-[0.9em] italic ${tealText}`} />
                </div>
            );
        }

        if (kind === 'pair') {
            // Hard-skill style: plain stacked list (label; optional value inline).
            return (
                <p className="mb-1 text-slate-700">
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Skill" className="font-medium" />
                    {item.value ? <span className="px-1.5 text-slate-400">·</span> : null}
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="" className="text-slate-500" />
                </p>
            );
        }

        // simple kind — languages stack (name + proficiency); soft skills / interests render as pill tags.
        if (type === 'languages') {
            return (
                <div className="mb-2 leading-snug">
                    <Field value={item.text} onChange={(v) => update({ text: v })} ph="Language — proficiency" className="block font-semibold text-slate-800" />
                </div>
            );
        }
        if (sidebar) {
            return (
                <span className="mb-2 mr-2 inline-block rounded-md bg-slate-300/60 px-3 py-1 text-[0.9em] text-slate-700">
                    <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} />
                </span>
            );
        }
        return (
            <p className="flex gap-2.5 text-slate-700">
                <span aria-hidden className="mt-[0.55em] h-1.5 w-1.5 shrink-0 rounded-full bg-[#3a9aa0]" />
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
            </p>
        );
    },
};

export default timeline;
