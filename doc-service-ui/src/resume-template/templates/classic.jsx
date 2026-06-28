import { Field, PeriodField } from '../shared';
import { Bullets } from './_parts';

// Headings/name use a fixed near-black (text-[#1a1a2e]); the editable accent (var --rb-accent)
// drives the blue. NOTE: class strings must be literal so Tailwind can detect them.
const ink = 'text-[#1a1a2e]';
const accent = 'text-[color:var(--rb-accent)]';

const Icon = ({ d }) => (
    <svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[0.95em] w-[0.95em] shrink-0 align-[-0.12em]"><path d={d} /></svg>
);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    link: 'M3.9 12a3.1 3.1 0 013.1-3.1h3V7H7a5 5 0 100 10h3v-1.9H7A3.1 3.1 0 013.9 12zm5.1 1h6v-2H9v2zm5-6h-3v1.9h3a3.1 3.1 0 010 6.2h-3V17h3a5 5 0 100-10z',
    pin: 'M12 2a7 7 0 00-7 7c0 5 7 13 7 13s7-8 7-13a7 7 0 00-7-7zm0 9.5A2.5 2.5 0 1112 6a2.5 2.5 0 010 5.5z',
    cal: 'M7 2v2H5a2 2 0 00-2 2v13a2 2 0 002 2h14a2 2 0 002-2V6a2 2 0 00-2-2h-2V2h-2v2H9V2H7zM5 9h14v10H5V9z',
};
const Contact = ({ icon, value, onChange, ph }) => (
    <span className="inline-flex items-center gap-1.5">
        <span className={accent}><Icon d={ICONS[icon]} /></span>
        <Field value={value} onChange={onChange} ph={ph} className="font-semibold text-slate-700" />
    </span>
);

const MetaRow = ({ item, update }) => (
    <div className="mt-1 flex flex-wrap items-center gap-x-5 gap-y-1 text-sm text-slate-500">
        <span className="inline-flex items-center gap-1.5"><span className="text-slate-400"><Icon d={ICONS.cal} /></span><PeriodField value={item.period} onChange={(v) => update({ period: v })} className="rounded px-1 transition hover:bg-slate-100" /></span>
        <span className="inline-flex items-center gap-1.5"><span className="text-slate-400"><Icon d={ICONS.pin} /></span><Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" /></span>
    </div>
);

const Entry = ({ children }) => (
    <div className="border-b border-dashed border-slate-200 pb-4">{children}</div>
);

const classic = {
    code: 'classic',
    name: 'Classic',
    accent: '#3b6fe0',
    sheetClass: 'font-sans text-slate-800',

    renderHeader: (r, set) => (
        <div>
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className={`block text-[2.6em] font-bold leading-none ${ink}`} />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className={`mt-1.5 block text-[1.15em] font-bold ${accent}`} />
            <div className="mt-3 flex flex-wrap gap-x-8 gap-y-1.5 text-[0.9em]">
                <Contact icon="phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
                <Contact icon="mail" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
                <Contact icon="link" value={r.linkedin} onChange={(v) => set('linkedin', v)} ph="LinkedIn" />
                <Contact icon="pin" value={r.location} onChange={(v) => set('location', v)} ph="Location" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <>
            <h2 className={`text-[1.35em] font-bold uppercase tracking-tight ${ink}`}>{title}</h2>
            <div className="mb-3 mt-1 border-b-2 border-[#1a1a2e]" />
        </>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="leading-relaxed text-slate-600" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = ctx;

        if (kind === 'exp') {
            return (
                <Entry>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className={`block text-[1.2em] ${ink}`} />
                    <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`block font-bold ${accent}`} />
                    <MetaRow item={item} update={update} />
                    <Bullets bullets={bullets} />
                </Entry>
            );
        }

        if (kind === 'proj') {
            return (
                <Entry>
                    <div className="flex items-baseline justify-between gap-3">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`block text-[1.2em] ${ink}`} />
                        <span className="flex shrink-0 items-baseline gap-1.5 whitespace-nowrap text-xs">
                            <Field value={item.githubUrl} onChange={(v) => update({ githubUrl: v })} ph="GitHub URL" className={`underline ${accent}`} />
                            <span className="text-slate-400">|</span>
                            <Field value={item.liveUrl} onChange={(v) => update({ liveUrl: v })} ph="Live URL" className={`underline ${accent}`} />
                        </span>
                    </div>
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className={`block font-bold ${accent}`} />
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-slate-500">
                        <span className="text-slate-400"><Icon d={ICONS.cal} /></span>
                        <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="rounded px-1 transition hover:bg-slate-100" />
                    </div>
                    <Bullets bullets={bullets} />
                </Entry>
            );
        }

        if (kind === 'edu') {
            return (
                <Entry>
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className={`block text-[1.2em] ${ink}`} />
                    <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" className={`block font-bold ${accent}`} />
                    <MetaRow item={item} update={update} />
                </Entry>
            );
        }

        if (kind === 'pair') {
            return (
                <p>
                    <Field value={item.label} onChange={(v) => update({ label: v })} ph="Category" className={`font-bold ${ink}`} />
                    <span className="px-1.5 text-slate-400">:</span>
                    <Field value={item.value} onChange={(v) => update({ value: v })} ph="e.g. Java, Python, SQL" className="text-slate-600" />
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
                <span className={`mt-0.5 ${accent}`}>
                    <svg viewBox="0 0 24 24" fill="currentColor" className="h-4 w-4"><path d="M5 3a1 1 0 00-1 1v17h2v-7h6l.5 2H19a1 1 0 001-1V6a1 1 0 00-1-1h-6l-.5-2H5z" /></svg>
                </span>
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1 text-slate-700" />
            </div>
        );
    },
};

export default classic;
