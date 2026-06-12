import { Field } from '../shared';
import { renderItem, renderText } from './_parts';

const compact = {
    code: 'compact',
    name: 'Compact',
    accent: '#0891b2',
    sheetClass: 'font-sans text-slate-900 leading-tight',

    renderHeader: (r, set) => (
        <div className="flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="text-[1.8em] font-bold tracking-tight" />
            <div className="flex flex-wrap items-center gap-x-2 text-[0.8em] text-slate-500">
                <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" /><span className="text-slate-300">·</span>
                <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" /><span className="text-slate-300">·</span>
                <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" />
            </div>
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="block w-full text-[1em] font-medium text-[color:var(--rb-accent)]" />
        </div>
    ),

    renderTitle: (title) => (
        <h2 className="mb-1.5 flex items-center gap-2 text-[0.9em] font-bold uppercase tracking-wide text-[color:var(--rb-accent)]">
            <span className="inline-block h-3 w-1 bg-[color:var(--rb-accent)]" />
            {title}
        </h2>
    ),

    renderText,
    renderItem,
};

export default compact;
