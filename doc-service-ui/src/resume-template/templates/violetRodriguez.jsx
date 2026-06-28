import { Field, PeriodField } from '../shared';
import { Bullets } from './_parts';

const ink = 'text-[#1a1a2e]';
const accent = 'text-[color:var(--rb-accent)]';
const Icon = ({ d }) => (<svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[0.9em] w-[0.9em] shrink-0 align-[-0.12em]"><path d={d} /></svg>);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    link: 'M3.9 12a3.1 3.1 0 013.1-3.1h3V7H7a5 5 0 100 10h3v-1.9H7A3.1 3.1 0 013.9 12zm5.1 1h6v-2H9v2zm5-6h-3v1.9h3a3.1 3.1 0 010 6.2h-3V17h3a5 5 0 100-10z',
    git: 'M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5A10 10 0 0012 2z',
    pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z',
    cal: 'M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zM5 9h14v10H5V9z',
};
const Contact = ({ icon, value, onChange, ph }) => (
    <span className="inline-flex items-center gap-1.5"><span className="text-slate-400"><Icon d={ICONS[icon]} /></span><Field value={value} onChange={onChange} ph={ph} className="text-slate-600" /></span>
);
const Meta = ({ item, update }) => (
    <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="text-slate-400"><Icon d={ICONS.cal} /></span><PeriodField value={item.period} onChange={(v) => update({ period: v })} className="rounded px-1 transition hover:bg-slate-100" /></span>
        <span className="inline-flex items-center gap-1.5"><span className="text-slate-400"><Icon d={ICONS.pin} /></span><Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" /></span>
    </div>
);

const violetRodriguez = {
    code: 'violet-rodriguez',
    name: 'Violet Rodriguez',
    accent: '#2f7df6',
    sheetClass: 'font-sans text-slate-800',
    layout: { type: 'two-column', sidebar: ['skills', 'projects', 'achievements', 'languages', 'interests', 'awards'], sidebarWidth: '33%', gap: 'gap-8' },

    renderHeader: (r, set) => (
        <div>
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className={`block text-[2.4em] font-bold uppercase leading-none ${ink}`} />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className={`mt-1.5 block text-[1.05em] font-semibold ${accent}`} />
            <div className="mt-2.5 flex flex-wrap gap-x-5 gap-y-1 text-[0.85em]">
                <Contact icon="phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <Contact icon="mail" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <Contact icon="link" value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" />
                <Contact icon="git" value={r.github} onChange={(v) => set('github', v)} ph="GitHub" />
                <Contact icon="pin" value={r.location} onChange={(v) => set('location', v)} ph="Location" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <>
            <h2 className="text-[0.9em] font-semibold uppercase tracking-widest text-slate-400">{title}</h2>
            <div className="mb-3 mt-1 border-b border-slate-300" />
        </>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="leading-relaxed text-slate-600" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;

        if (kind === 'exp') {
            return (
                <>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className={`block text-[1.15em] ${ink}`} />
                    <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`block font-bold ${accent}`} />
                    <Meta item={item} update={update} />
                    <Bullets bullets={bullets} />
                </>
            );
        }

        if (kind === 'edu') {
            return (
                <>
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className={`block text-[1.15em] ${ink}`} />
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className={`block font-bold ${accent}`} />
                    <Meta item={item} update={update} />
                </>
            );
        }

        if (kind === 'proj') {
            return (
                <>
                    <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`block font-bold ${ink}`} />
                    <Bullets bullets={bullets} />
                    <p className="mt-1 text-sm text-slate-500">
                        <span className="font-semibold">GitHub: </span>
                        <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className={accent} />
                    </p>
                </>
            );
        }

        if (kind === 'pair') {
            return (
                <p>
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Skill" className="border-b border-slate-300 pb-0.5 font-semibold text-slate-700" />
                    <span className="px-1.5 text-slate-300">·</span>
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Advanced" className="text-slate-500" />
                </p>
            );
        }

        if (kind === 'courses') {
            return (
                <p>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className={`font-bold ${ink}`} />
                    <span className="px-1.5 text-slate-400">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} className={accent} />
                </p>
            );
        }

        return (
            <div className="flex gap-2.5">
                <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 ${accent}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-3.5 w-3.5"><path d="M12 21s-7-4.5-9.5-9C1 9 2.5 5.5 6 5.5c2 0 3.2 1.3 4 2.4.8-1.1 2-2.4 4-2.4 3.5 0 5 3.5 3.5 6.5C19 16.5 12 21 12 21z" /></svg>
                </span>
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1 text-slate-600" />
            </div>
        );
    },
};

export default violetRodriguez;
