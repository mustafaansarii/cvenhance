import { Field, PeriodField } from '../shared';
import { Bullets } from './_parts';

const periodCls = 'block whitespace-nowrap rounded px-1 transition hover:bg-slate-100';
const linkCls = 'underline decoration-slate-400 underline-offset-2';

const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[0.85em] w-[0.85em] shrink-0 align-[-0.05em]"><path d={d} /></svg>
);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    linkedin: 'M19 3H5a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2V5a2 2 0 00-2-2zM8.3 18.3H5.7V9.8h2.6v8.5zM7 8.6a1.5 1.5 0 110-3 1.5 1.5 0 010 3zm11.3 9.7h-2.6v-4.1c0-1-.4-1.6-1.2-1.6-.7 0-1.1.5-1.3 1-.1.2-.1.5-.1.7v4h-2.6V9.8h2.6v1.1c.4-.6 1-1.3 2.3-1.3 1.7 0 2.9 1.1 2.9 3.4v5.3z',
    github: 'M12 2a10 10 0 00-3.2 19.5c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.3-3.4-1.3-.5-1.2-1.1-1.5-1.1-1.5-.9-.6.1-.6.1-.6 1 .1 1.5 1 1.5 1 .9 1.5 2.3 1.1 2.9.8.1-.6.3-1.1.6-1.3-2.2-.3-4.6-1.1-4.6-5 0-1.1.4-2 1-2.7-.1-.3-.4-1.3.1-2.6 0 0 .8-.3 2.7 1a9.3 9.3 0 015 0c1.9-1.3 2.7-1 2.7-1 .5 1.3.2 2.3.1 2.6.6.7 1 1.6 1 2.7 0 3.9-2.4 4.7-4.6 5 .3.3.6.9.6 1.8v2.7c0 .3.2.6.7.5A10 10 0 0012 2z',
};
const Contact = ({ icon, value, onChange, ph }) => (
    <span className="inline-flex items-center gap-1"><Icon d={ICONS[icon]} /><Field value={value} onChange={onChange} ph={ph} className={linkCls} /></span>
);

// Two-column timeline row: bold period/label on the left, content on the right.
const Row = ({ left, children }) => (
    <div className="grid grid-cols-[6.5rem_1fr] gap-x-4">
        <div className="font-bold">{left}</div>
        <div className="min-w-0">{children}</div>
    </div>
);

const zayden = {
    code: 'zayden',
    name: 'Zayden',
    accent: '#2563eb',
    sheetClass: 'font-serif text-slate-900',

    renderHeader: (r, set) => (
        <div className="text-center">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.8em] font-bold leading-tight" />
            <div className="mt-1.5 flex flex-wrap items-center justify-center gap-x-5 gap-y-1 text-[0.92em]">
                <Contact icon="phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <Contact icon="mail" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <Contact icon="linkedin" value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" />
                <Contact icon="github" value={r.github} onChange={(v) => set('github', v)} ph="GitHub" />
            </div>
            <div className="mt-2 border-t border-slate-800" />
        </div>
    ),

    renderTitle: () => null,

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="text-slate-800" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;
        if (kind === 'exp') {
            return (
                <Row left={<PeriodField value={item.period} onChange={(v) => update({ period: v })} className={periodCls} />}>
                    <p>
                        <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="font-bold" />
                        <span className="px-1 italic">at</span>
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="italic" />
                        <span className="italic">,</span>{' '}
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="italic" />
                    </p>
                    <Bullets bullets={bullets} />
                </Row>
            );
        }
        if (kind === 'edu') {
            return (
                <Row left={<PeriodField value={item.period} onChange={(v) => update({ period: v })} className={periodCls} />}>
                    <p>
                        <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="font-bold" />
                        <span className="px-1 italic">at</span>
                        <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="italic" />
                        <span className="italic">,</span>{' '}
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="italic" />
                    </p>
                </Row>
            );
        }
        if (kind === 'proj') {
            return (
                <Row left={<span>Projects</span>}>
                    <p>
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="font-bold" />
                        <span className="px-1">(</span>
                        <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="italic text-slate-700" />
                        <span>)</span>
                    </p>
                    <Bullets bullets={bullets} />
                    <div className="flex flex-col">
                        <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className="text-[color:var(--rb-accent)] underline" />
                        <Field value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} ph="Live URL" className="text-[color:var(--rb-accent)] underline" />
                    </div>
                </Row>
            );
        }
        if (kind === 'pair') {
            return (
                <Row left={<span>Skills</span>}>
                    <p>
                        <Field value={item.label} onChange={(v) => update({ label: v })} ph="Category" className="font-bold" />
                        <span className="font-bold">:</span>{' '}
                        <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" />
                    </p>
                </Row>
            );
        }
        if (kind === 'courses') {
            return (
                <Row left={<span>Courses</span>}>
                    <p>
                        <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="font-semibold" />
                        <span className="px-1.5 text-slate-400">—</span>
                        <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} />
                    </p>
                </Row>
            );
        }
        return (
            <Row left={<span>Achievements</span>}>
                <div className="flex gap-2">
                    <span aria-hidden className="mt-[0.55em] h-[3px] w-[3px] shrink-0 rounded-full bg-current" />
                    <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
                </div>
            </Row>
        );
    },
};

export default zayden;
