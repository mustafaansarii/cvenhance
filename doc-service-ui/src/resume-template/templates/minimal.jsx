import { Field } from '../shared';
import { renderItem, renderText } from './_parts';

const minimal = {
    code: 'minimal',
    name: 'Minimal',
    accent: '#334155',
    sheetClass: 'font-sans text-slate-900',

    renderHeader: (r, set) => (
        <div>
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2em] font-bold tracking-tight" />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="mt-0.5 block text-[1.05em] text-slate-500" />
            <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.85em] text-slate-500">
                <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" /><span className="text-slate-300">·</span>
                <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" /><span className="text-slate-300">·</span>
                <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" /><span className="text-slate-300">·</span>
                <Field value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn/Portfolio" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <h2 className="mb-2 border-b border-slate-300 pb-1 text-[0.95em] font-bold uppercase tracking-[0.12em] text-[color:var(--rb-accent)]">{title}</h2>
    ),

    renderText,
    renderItem,
};

export default minimal;
