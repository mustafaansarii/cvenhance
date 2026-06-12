import { Field } from '../shared';
import { renderItem, renderText } from './_parts';

const elegant = {
    code: 'elegant',
    name: 'Elegant',
    accent: '#7c2d12',
    sheetClass: 'font-serif text-slate-900',

    renderHeader: (r, set) => (
        <div className="text-center">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.1em] font-semibold uppercase tracking-[0.2em]" />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="mt-1 block text-[1.05em] italic text-slate-500" />
            <div className="mx-auto mt-2 h-px w-24 bg-[color:var(--rb-accent)]" />
            <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[0.85em] text-slate-500">
                <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" />
                <Field value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn/Portfolio" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <h2 className="mb-2 mt-1 text-center text-[1.05em] font-semibold uppercase tracking-[0.25em] text-[color:var(--rb-accent)]">{title}</h2>
    ),

    renderText,
    renderItem,
};

export default elegant;
