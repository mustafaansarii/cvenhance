import { Field } from '../shared';
import { renderItem, renderText } from './_parts';

const professional = {
    code: 'professional',
    name: 'Professional',
    accent: '#475569',
    sheetClass: 'font-sans text-slate-900',

    renderHeader: (r, set) => (
        <div className="border-b-2 border-slate-700 pb-2">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2em] font-bold uppercase tracking-wide" />
            <div className="mt-1 flex flex-wrap items-center justify-between gap-x-3 gap-y-1 text-[0.85em] text-slate-500">
                <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="font-medium text-slate-600" />
                <div className="flex flex-wrap items-center gap-x-2">
                    <Field value={r.email} onChange={(v) => set('email', v)} ph="Email" /><span className="text-slate-300">·</span>
                    <Field value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" /><span className="text-slate-300">·</span>
                    <Field value={r.location} onChange={(v) => set('location', v)} ph="Location" />
                </div>
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <div className="mb-2">
            <h2 className="text-[0.95em] font-bold uppercase tracking-[0.15em] text-slate-600">{title}</h2>
            <div className="mt-0.5 border-t border-slate-300" />
        </div>
    ),

    renderText,
    renderItem,
};

export default professional;
