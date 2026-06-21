import { Field, PeriodField } from '../shared';

export function Bullets({ bullets }) {
    return (
        <ul className="mt-1 list-disc pl-5 text-slate-700">
            {bullets.list.map((b) => (
                <li key={b.id} className="group/b relative">
                    <Field value={b.text} onChange={(v) => bullets.update(b.id, v)} ph="Highlight your accomplishments, using numbers if possible." />
                    {bullets.list.length > 1 && (
                        <button onMouseDown={(e) => e.preventDefault()} onClick={() => bullets.remove(b.id)} title="Remove highlight" className="no-print absolute -left-5 top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-500 hover:bg-red-100 group-hover/b:flex">×</button>
                    )}
                </li>
            ))}
            <li className="no-print list-none">
                <button onClick={bullets.add} className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ highlight</button>
            </li>
        </ul>
    );
}

export const renderText = (value, onChange, ph) => (
    <Field as="p" value={value} onChange={onChange} ph={ph} className="text-slate-700" />
);

export const renderItem = (kind, ctx) => {
    const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;
    if (kind === 'exp') {
        return (
            <>
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block font-semibold" />
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="block text-slate-500" />
                    </div>
                    <div className="shrink-0 text-right">
                        <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="block" />
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} />
                    </div>
                </div>
                <Bullets bullets={bullets} />
            </>
        );
    }
    if (kind === 'edu') {
        return (
            <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block font-semibold" />
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="block text-slate-600" />
                </div>
                <div className="shrink-0 text-right">
                    <Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" className="block" />
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} />
                </div>
            </div>
        );
    }
    if (kind === 'courses') {
        return (
            <p>
                <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} className="text-slate-500" />
                <span className="px-1.5 text-slate-400">—</span>
                <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} />
            </p>
        );
    }
    if (kind === 'pair') {
        return (
            <p>
                <Field value={item.label} onChange={(v) => update({ label: v })} ph="Category" className="font-semibold" />
                <span className="px-1.5 text-slate-400">:</span>
                <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" />
            </p>
        );
    }
    return (
        <div className="flex gap-2 text-slate-700">
            <span aria-hidden className="mt-[0.55em] h-[3px] w-[3px] shrink-0 rounded-full bg-current" />
            <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
        </div>
    );
};
