import { Field, PeriodField } from '../shared';
import { Bullets } from './_parts';

// Navy is driven by the editable accent (var --rb-accent); orange is this template's fixed secondary.
const navy = 'text-[color:var(--rb-accent)]';
const ORANGE = '#e2671f';
const dateCls = 'block text-left text-sm font-bold text-[color:var(--rb-accent)]';

const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[0.9em] w-[0.9em] shrink-0 align-[-0.1em]"><path d={d} /></svg>
);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    link: 'M3.9 12a3.1 3.1 0 013.1-3.1h3V7H7a5 5 0 100 10h3v-1.9H7A3.1 3.1 0 013.9 12zm5.1 1h6v-2H9v2zm5-6h-3v1.9h3a3.1 3.1 0 010 6.2h-3V17h3a5 5 0 100-10z',
    pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z',
};
const Contact = ({ icon, value, onChange, ph }) => (
    <span className="inline-flex items-center gap-1.5">
        <span style={{ color: ORANGE }}><Icon d={ICONS[icon]} /></span>
        <Field value={value} onChange={onChange} ph={ph} className="font-semibold text-slate-700" />
    </span>
);

const Item = ({ left, children }) => (
    <div className="grid grid-cols-[7.5rem_1fr] gap-x-4">
        <div className="pt-1">{left}</div>
        <div className="relative border-l border-slate-200 pl-5">
            <span aria-hidden className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[color:var(--rb-accent)]" />
            {children}
        </div>
    </div>
);

const timeline = {
    code: 'timeline',
    name: 'Timeline',
    accent: '#1e3a6e',
    sheetClass: 'font-sans text-slate-800',

    renderHeader: (r, set) => (
        <div>
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className={`block text-[2.5em] font-extrabold uppercase leading-none tracking-tight ${navy}`} />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="mt-1.5 block text-[1.15em] font-bold text-[#e2671f]" />
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1.5 text-[0.9em]">
                <Contact icon="phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <Contact icon="mail" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <Contact icon="link" value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" />
                <Contact icon="pin" value={r.location} onChange={(v) => set('location', v)} ph="Location" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <h2 className={`mb-3 text-[1.25em] font-extrabold uppercase tracking-wide ${navy}`}>{title}</h2>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="leading-relaxed text-slate-600" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;

        if (kind === 'exp') {
            return (
                <Item left={<>
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className={dateCls} />
                    <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="mt-1 block text-sm text-slate-500" />
                </>}>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className={`block text-[1.15em] ${navy}`} />
                    <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="block font-bold text-[#e2671f]" />
                    <Bullets bullets={bullets} />
                </Item>
            );
        }

        if (kind === 'proj') {
            return (
                <Item left={<PeriodField value={item.period} onChange={(v) => update({ period: v })} className={dateCls} />}>
                    <div className="flex items-baseline justify-between gap-3">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`block text-[1.15em] ${navy}`} />
                        <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap text-xs">
                            <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className="underline" />
                            <span className="text-slate-400">|</span>
                            <Field value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} ph="Live URL" className="underline" />
                        </span>
                    </div>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block font-bold text-[#e2671f]" />
                    <Bullets bullets={bullets} />
                </Item>
            );
        }

        if (kind === 'edu') {
            return (
                <Item left={<>
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className={dateCls} />
                    <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="mt-1 block text-sm text-slate-500" />
                </>}>
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className={`block text-[1.15em] ${navy}`} />
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block font-bold text-[#e2671f]" />
                </Item>
            );
        }

        if (kind === 'pair') {
            return (
                <p>
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Skill" className="border-b-2 border-slate-200 pb-0.5 font-bold text-slate-800" />
                    <span className="px-1.5 text-slate-400">·</span>
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" className="text-slate-600" />
                </p>
            );
        }

        if (kind === 'courses') {
            return (
                <p>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className={`font-bold ${navy}`} />
                    <span className="px-1.5 text-slate-400">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} className="font-semibold text-[#e2671f]" />
                </p>
            );
        }

        return (
            <div className="flex gap-2.5">
                <svg viewBox="0 0 24 24" fill="currentColor" className="mt-0.5 h-4 w-4 shrink-0" style={{ color: ORANGE }}><path d="M12 2l2.9 6.3 6.9.7-5.1 4.6 1.4 6.8L12 17.8 5.9 20.4l1.4-6.8L2.2 9l6.9-.7L12 2z" /></svg>
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1 text-slate-700" />
            </div>
        );
    },
};

export default timeline;
