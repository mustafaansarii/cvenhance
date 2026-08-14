/* eslint-disable react-refresh/only-export-components */
import { Field, PeriodField } from './shared';

function Bullets({ bullets }) {
    return (
        <ul className="mt-1 list-disc pl-5 text-slate-600">
            {bullets.list.map((bullet) => (
                <li key={bullet.id} className="group/b relative">
                    <Field value={bullet.text} onChange={(value) => bullets.update(bullet.id, value)} ph="Highlight an accomplishment using numbers where possible." />
                    {bullets.list.length > 1 && (
                        <button onMouseDown={(event) => event.preventDefault()} onClick={() => bullets.remove(bullet.id)} title="Remove highlight" className="no-print absolute -left-5 top-1 hidden h-4 w-4 items-center justify-center rounded-full bg-red-50 text-[10px] text-red-500 hover:bg-red-100 group-hover/b:flex">x</button>
                    )}
                </li>
            ))}
            <li className="no-print list-none">
                <button onClick={bullets.add} className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ highlight</button>
            </li>
        </ul>
    );
}

function Entry({ children, variant }) {
    const border = variant === 'minimal' ? '' : 'border-b border-dashed border-slate-200 pb-4';
    return <div className={border}>{children}</div>;
}

function titleClass(variant) {
    if (variant === 'block') return 'bg-slate-900 px-2 py-1 text-sm text-white';
    if (variant === 'simple') return 'border-b border-slate-300 pb-1 text-lg';
    return 'border-b-2 border-slate-800 pb-1 text-lg';
}

function headerClass(variant) {
    if (variant === 'bold') return 'border-l-8 border-[color:var(--rb-accent)] pl-4';
    if (variant === 'minimal') return 'text-center';
    if (variant === 'elegant') return 'border-b border-slate-300 pb-4';
    return '';
}

export function createDataDrivenDesign(template) {
    const config = template.config || {};
    const headerVariant = config.headerVariant || 'classic';
    const sectionVariant = config.sectionTitleVariant || 'rule';
    const layout = config.layout === 'two-column'
        ? {
            type: 'two-column',
            sidebar: config.sidebarSections || ['skills', 'projects', 'achievements', 'languages', 'interests', 'awards'],
            sidebarWidth: config.sidebarWidth || '33%',
            sidebarSide: config.sidebarSide === 'right' ? 'right' : 'left',
            gap: config.gap || 'gap-8',
        }
        : null;

    const renderItem = (kind, context) => {
        const { item, update, bullets, primaryPh, secondaryPh, ph } = context;
        const variant = config.itemVariant || headerVariant;

        if (kind === 'exp') {
            return <Entry variant={variant}>
                <Field value={item.secondary} onChange={(value) => update({ secondary: value })} ph={secondaryPh} className="block text-[1.1em] font-bold text-slate-900" />
                <Field value={item.primary} onChange={(value) => update({ primary: value })} ph={primaryPh} className="block font-semibold text-[color:var(--rb-accent)]" />
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <PeriodField value={item.period} onChange={(value) => update({ period: value })} />
                    <Field value={item.location} onChange={(value) => update({ location: value })} ph="Location" />
                </div>
                <Bullets bullets={bullets} />
            </Entry>;
        }
        if (kind === 'proj') {
            return <Entry variant={variant}>
                <Field value={item.primary} onChange={(value) => update({ primary: value })} ph={primaryPh} className="block text-[1.1em] font-bold text-slate-900" />
                <Field value={item.secondary} onChange={(value) => update({ secondary: value })} ph={secondaryPh} className="block font-semibold text-[color:var(--rb-accent)]" />
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500">
                    <PeriodField value={item.period} onChange={(value) => update({ period: value })} />
                    <Field value={item.githubUrl} onChange={(value) => update({ githubUrl: value })} ph="GitHub URL" className="underline" />
                    <Field value={item.liveUrl} onChange={(value) => update({ liveUrl: value })} ph="Live URL" className="underline" />
                </div>
                <Bullets bullets={bullets} />
            </Entry>;
        }
        if (kind === 'edu') {
            return <Entry variant={variant}>
                <Field value={item.degree} onChange={(value) => update({ degree: value })} ph="Degree and field of study" className="block text-[1.1em] font-bold text-slate-900" />
                <Field value={item.school} onChange={(value) => update({ school: value })} ph="School / University" className="block font-semibold text-[color:var(--rb-accent)]" />
                <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-slate-500"><PeriodField value={item.period} onChange={(value) => update({ period: value })} /><Field value={item.location} onChange={(value) => update({ location: value })} ph="Location" /></div>
            </Entry>;
        }
        if (kind === 'pair') {
            return <p><Field value={item.label} onChange={(value) => update({ label: value })} ph="Category" className="font-bold text-slate-900" /><span className="px-1.5 text-slate-400">:</span><Field value={item.value} onChange={(value) => update({ value })} ph="e.g. Java, Python, SQL" className="text-slate-600" /></p>;
        }
        if (kind === 'courses') {
            return <p><Field value={item.title} onChange={(value) => update({ title: value })} ph={primaryPh} className="font-bold text-slate-900" /><span className="px-1.5 text-slate-400">-</span><Field value={item.issuer} onChange={(value) => update({ issuer: value })} ph={secondaryPh} className="text-[color:var(--rb-accent)]" /></p>;
        }
        return <div className="flex gap-2"><span className="text-[color:var(--rb-accent)]">•</span><Field value={item.text} onChange={(value) => update({ text: value })} ph={ph} className="block flex-1 text-slate-700" /></div>;
    };

    return {
        code: template.templateCode,
        name: template.name,
        accent: config.accent || '#0f766e',
        sheetClass: config.fontFamily === 'serif' ? 'font-serif text-slate-800' : 'font-sans text-slate-800',
        layout,
        renderHeader: (resume, setField) => <div className={headerClass(headerVariant)}>
            <Field value={resume.name} onChange={(value) => setField('name', value)} ph="YOUR NAME" className="block text-[2.45em] font-bold leading-none text-slate-900" />
            <Field value={resume.title} onChange={(value) => setField('title', value)} ph="The role you are applying for" className="mt-1.5 block text-[1.1em] font-semibold text-[color:var(--rb-accent)]" />
            <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-[0.9em] text-slate-600">
                <Field value={resume.phone} onChange={(value) => setField('phone', value)} ph="Phone" />
                <Field value={resume.email} onChange={(value) => setField('email', value)} ph="Email" />
                <Field value={resume.linkedin} onChange={(value) => setField('linkedin', value)} ph="LinkedIn" />
                <Field value={resume.location} onChange={(value) => setField('location', value)} ph="Location" />
            </div>
        </div>,
        renderTitle: (title) => <h2 className={`mt-5 font-bold uppercase tracking-wide text-slate-900 ${titleClass(sectionVariant)}`}>{title}</h2>,
        renderText: (value, onChange, placeholder) => <Field as="p" value={value} onChange={onChange} ph={placeholder} className="leading-relaxed text-slate-600" />,
        renderItem,
    };
}
