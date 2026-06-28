import { Field, PeriodField, PhotoField } from '../shared';
import { Bullets } from './_parts';

const accent = 'text-[color:var(--rb-accent)]';
const Icon = ({ d }) => (<svg viewBox="0 0 24 24" fill="currentColor" className="inline-block h-[1em] w-[1em] shrink-0 align-[-0.12em]"><path d={d} /></svg>);
const ICONS = {
    phone: 'M6.6 10.8c1.4 2.8 3.8 5.1 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.4 0 .8-.3 1l-2.2 2.2z',
    mail: 'M3 5h18a1 1 0 011 1v12a1 1 0 01-1 1H3a1 1 0 01-1-1V6a1 1 0 011-1zm9 7L4 7v1l8 5 8-5V7l-8 5z',
    home: 'M12 3l9 8h-3v9h-4v-6H10v6H6v-9H3l9-8z',
};

const ContactLine = ({ icon, label, value, onChange, ph }) => (
    <div className="mb-3">
        <p className="flex items-center gap-2 text-sm font-bold"><span className={accent}><Icon d={ICONS[icon]} /></span>{label}</p>
        <Field value={value} onChange={onChange} ph={ph} className="mt-0.5 block pl-6 text-sm text-white/80" />
    </div>
);

const ankitaTiwari = {
    code: 'ankita-tiwari',
    name: 'Ankita Tiwari',
    accent: '#2aa3d6',
    sheetClass: 'font-sans text-slate-800',
    layout: {
        type: 'two-column',
        splitHeader: true,
        sidebar: ['skills', 'languages', 'interests', 'awards'],
        sidebarWidth: '35%',
        sidebarClass: 'rounded-2xl bg-[#16263a] px-6 py-7 text-white',
        gap: 'gap-7',
    },

    renderSidebarHeader: (r, set) => (
        <div className="mb-6">
            <div className="mx-auto mb-6 h-32 w-32 overflow-hidden rounded-full ring-4 ring-white/80">
                <PhotoField value={r.photo} onChange={(v) => set('photo', v)} className="h-full w-full" />
            </div>
            <div className="mb-3 rounded bg-[color:var(--rb-accent)] py-1 text-center text-sm font-bold uppercase tracking-widest text-white">Contact</div>
            <ContactLine icon="phone" label="Phone" value={r.phone} onChange={(v) => set('phone', v)} ph="Phone" />
            <ContactLine icon="mail" label="Email" value={r.email} onChange={(v) => set('email', v)} ph="Email" />
            <ContactLine icon="home" label="Address" value={r.location} onChange={(v) => set('location', v)} ph="Address" />
        </div>
    ),

    renderHeader: (r, set) => (
        <div className="mb-2">
            <Field value={r.name} onChange={(v) => set('name', v)} ph="YOUR NAME" className="block text-[2.4em] font-extrabold uppercase tracking-wide text-[#16263a]" />
            <Field value={r.title} onChange={(v) => set('title', v)} ph="The role you are applying for?" className="mt-1 block text-[1em] font-semibold uppercase tracking-[0.25em] text-slate-500" />
        </div>
    ),

    renderTitle: (title) => (
        <div className="mb-4 rounded bg-[color:var(--rb-accent)] py-1.5 text-center text-[0.95em] font-bold uppercase tracking-[0.2em] text-white">{title}</div>
    ),

    renderText: (value, onChange, ph) => <Field as="p" value={value} onChange={onChange} ph={ph} className="leading-relaxed text-slate-600" />,

    renderItem: (kind, ctx) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph, col } = ctx;
        const sidebar = col === 'sidebar';

        if (kind === 'pair') {
            return (
                <p className={`flex gap-2 ${sidebar ? 'text-white/90' : 'text-slate-700'}`}>
                    <span className={accent}>•</span>
                    <span><Field value={item.label} onChange={(v) => update({ label: v })} ph="Skill" className="font-semibold" /><Field value={item.value} onChange={(v) => update({ value: v })} ph="" className="text-current/70" /></span>
                </p>
            );
        }

        if (kind === 'simple') {
            return (
                <p className={`flex gap-2 ${sidebar ? 'text-white/90' : 'text-slate-700'}`}>
                    <span className={accent}>•</span>
                    <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
                </p>
            );
        }

        if (kind === 'exp') {
            return (
                <div className="relative border-l-2 border-[color:var(--rb-accent)]/40 pl-5">
                    <span aria-hidden className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-[color:var(--rb-accent)] bg-white" />
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className={`block font-bold uppercase ${accent}`} />
                    <p className="text-sm text-slate-600">
                        <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} /><span className="px-1.5 text-slate-300">|</span><Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" />
                    </p>
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="mb-1 block text-sm text-slate-500" />
                    <Bullets bullets={bullets} />
                </div>
            );
        }

        if (kind === 'edu') {
            return (
                <div className="relative border-l-2 border-[color:var(--rb-accent)]/40 pl-5">
                    <span aria-hidden className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-[color:var(--rb-accent)] bg-white" />
                    <Field value={item.degree} onChange={(v) => update({ degree: v })} ph="Degree and field of study" className={`block font-bold uppercase ${accent}`} />
                    <p className="text-sm text-slate-600">
                        <Field value={item.school} onChange={(v) => update({ school: v })} ph="School / University" /><span className="px-1.5 text-slate-300">|</span><Field value={item.location} onChange={(v) => update({ location: v })} ph="Location" />
                    </p>
                    <PeriodField value={item.period} onChange={(v) => update({ period: v })} className="block text-sm text-slate-500" />
                </div>
            );
        }

        if (kind === 'proj') {
            return (
                <div className="relative border-l-2 border-[color:var(--rb-accent)]/40 pl-5">
                    <span aria-hidden className="absolute -left-[7px] top-1 h-3 w-3 rounded-full border-2 border-[color:var(--rb-accent)] bg-white" />
                    <Field value={item.primary} onChange={(v) => update({ primary: v })} ph={primaryPh} className={`block font-bold uppercase ${accent}`} />
                    <Field value={item.secondary} onChange={(v) => update({ secondary: v })} ph={secondaryPh} className="block text-sm text-slate-600" />
                    <Bullets bullets={bullets} />
                </div>
            );
        }

        return (
            <p className={`flex gap-2 ${sidebar ? 'text-white/90' : 'text-slate-700'}`}>
                <span className={accent}>•</span>
                <Field value={item.text} onChange={(v) => update({ text: v })} ph={ph} className="block flex-1" />
            </p>
        );
    },
};

export default ankitaTiwari;
