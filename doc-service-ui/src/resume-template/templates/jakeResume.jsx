import { Field, PeriodField } from '../shared';
import { Bullets } from './_parts';

const periodCls = 'block whitespace-nowrap rounded px-1 text-right transition hover:bg-slate-100';
const linkCls = 'underline decoration-slate-400 underline-offset-2';

const jakeResume = {
    code: 'jake-s-resume',
    name: "Jake's Resume",
    accent: '#0f172a',
    sheetClass: 'font-serif text-slate-900',

    renderHeader: (r, set) => (
        <div className="text-center">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.7em] font-normal leading-tight" />
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-[0.92em]">
                <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" className={linkCls} />
                <span className="text-slate-400">|</span>
                <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" className={linkCls} />
                <span className="text-slate-400">|</span>
                <Field value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" className={linkCls} />
                <span className="text-slate-400">|</span>
                <Field value={r.github} onChange={(v) => set('github', v)} ph="GitHub" className={linkCls} />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <>
            <h2 className="text-[1.1em] tracking-wide [font-variant:small-caps]">{title}</h2>
            <div className="mb-2 mt-0.5 border-t border-slate-400" />
        </>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="text-slate-800" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;
        if (kind === 'exp') {
            return (
                <>
                    <div className="flex items-baseline justify-between gap-4">
                        <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="font-bold" />
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className={periodCls} />
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="italic" />
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="shrink-0 italic" />
                    </div>
                    <Bullets bullets={bullets} />
                </>
            );
        }
        if (kind === 'edu') {
            return (
                <>
                    <div className="flex items-baseline justify-between gap-4">
                        <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="font-bold" />
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="shrink-0" />
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                        <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="italic" />
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className={`${periodCls} italic`} />
                    </div>
                </>
            );
        }
        if (kind === 'proj') {
            return (
                <>
                    <div className="flex items-baseline justify-between gap-4">
                        <p className="min-w-0 flex-1">
                            <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="font-bold" />
                            <span className="px-1.5 text-slate-500">|</span>
                            <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="italic text-slate-700" />
                        </p>
                        <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap">
                            <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className="text-blue-600 underline" />
                            <span className="text-slate-400">|</span>
                            <Field value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} ph="Live URL" className="text-red-600 underline" />
                        </span>
                    </div>
                    <Bullets bullets={bullets} />
                </>
            );
        }
        if (kind === 'pair') {
            return (
                <p>
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Category" className="font-bold" />
                    <span className="font-bold">:</span>{' '}
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" />
                </p>
            );
        }
        if (kind === 'courses') {
            return (
                <p>
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="font-semibold" />
                    <span className="px-1.5 text-slate-400">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} />
                </p>
            );
        }
        return (
            <div className="flex gap-2">
                <span aria-hidden className="mt-[0.55em] h-[3px] w-[3px] shrink-0 rounded-full bg-current" />
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
            </div>
        );
    },
};

export default jakeResume;
