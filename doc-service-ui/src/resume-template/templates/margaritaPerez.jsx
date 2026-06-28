import { Field, PeriodField, PhotoField } from '../shared';
import { Bullets } from './_parts';

const accent = 'text-[color:var(--rb-accent)]';

const margaritaPerez = {
    code: 'margarita-perez',
    name: 'Margarita Perez',
    accent: '#c9a44c',
    sheetClass: 'font-sans text-slate-700 border-8 border-[#4a9fd8]',
    layout: {
        type: 'two-column',
        sidebar: ['experience', 'volunteer', 'education'],
        sidebarWidth: '50%',
        gap: 'gap-10',
        skipSections: ['summary'],
    },

    renderHeader: (r, set) => (
        <div>
            <div className="flex items-start gap-5">
                <div className="h-24 w-28 shrink-0 overflow-hidden rounded">
                    <PhotoField value={r.photo} onChange={(v) => set('photo', v)} className="h-full w-full" />
                </div>
                <div className="min-w-0">
                    <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.2em] font-bold uppercase leading-none text-[#3a9bd6]" />
                    <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className={`mt-1 block text-[1.1em] ${accent}`} />
                    <div className="mt-2 flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
                        <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                        <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                        <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" />
                    </div>
                </div>
            </div>
            <Field as="p" value={r.summary} onChange={(v) => set('summary', v)} ph="Briefly explain why you're a great fit for the role." className="mt-4 text-sm leading-relaxed text-slate-600" />
            <div className="mt-4 border-b-2 border-[color:var(--rb-accent)]" />
        </div>
    ),

    renderTitle: (title) => (
        <h2 className={`mb-3 text-[1.4em] font-normal ${accent}`}>{title}</h2>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="leading-relaxed text-slate-600" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;

        if (kind === 'exp') {
            return (
                <div>
                    <p className="font-bold text-slate-800">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} />
                        <span className="px-1.5 text-slate-400">|</span>
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="font-bold" />
                    </p>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block text-sm italic text-slate-500" />
                    <Bullets bullets={bullets} />
                </div>
            );
        }

        if (kind === 'edu') {
            return (
                <div>
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className="block font-bold text-slate-800" />
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className="block text-sm text-slate-600" />
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="block text-sm text-slate-500" />
                </div>
            );
        }

        if (kind === 'proj') {
            return (
                <div>
                    <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className="block font-bold text-slate-800" />
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block text-sm italic text-slate-500" />
                    <Bullets bullets={bullets} />
                </div>
            );
        }

        if (kind === 'pair') {
            return (
                <p>
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Skill" className="font-semibold text-slate-700" />
                    <span className="px-1 text-slate-300">·</span>
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="" className="text-slate-500" />
                </p>
            );
        }

        if (kind === 'courses') {
            return (
                <p className="text-slate-700">
                    <Field value={item.title} onChange={(v) => update({ title: v })} ph={primaryPh} />
                    <span className="px-1.5 text-slate-300">—</span>
                    <Field value={item.issuer} onChange={(v) => update({ issuer: v })} ph={secondaryPh} className="text-slate-500" />
                </p>
            );
        }

        return (
            <p className="text-slate-700"><Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} /></p>
        );
    },
};

export default margaritaPerez;
