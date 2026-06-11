import { Editable, PeriodField } from '../shared';

/*
 * Template "classic" — serif, centered header, full-width section rules.
 * A design only supplies visual slots; all behaviour comes from ResumeWorkspace.
 */
const classic = {
    code: 'classic',
    name: 'Classic',
    sheetClass: 'font-serif text-[14px] leading-relaxed text-slate-900',

    renderHeader: () => (
        <div className="text-center">
            <Editable ph="YOUR NAME" className="block text-3xl font-bold uppercase tracking-[0.15em]" />
            <Editable ph="The role you are applying for?" className="mt-1 block text-lg text-slate-400" />
            <div className="mt-1 flex flex-wrap items-center justify-center gap-x-2 gap-y-1 text-sm text-slate-500">
                <Editable ph="Phone" /><span className="text-slate-300">•</span>
                <Editable ph="Email" /><span className="text-slate-300">•</span>
                <Editable ph="LinkedIn/Portfolio" /><span className="text-slate-300">•</span>
                <Editable ph="Location" />
            </div>
        </div>
    ),

    renderTitle: (title) => (
        <>
            <h2 className="text-center text-lg font-bold uppercase tracking-wide">{title}</h2>
            <div className="mb-3 mt-1 border-t border-slate-900" />
        </>
    ),

    renderText: (ph) => <Editable as="p" ph={ph} className="text-slate-700" />,

    renderItem: (kind, { primaryPh, secondaryPh, ph }) => {
        if (kind === 'exp') {
            return (
                <>
                    <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                            <Editable ph={primaryPh} className="block text-slate-500" />
                            <Editable ph={secondaryPh} className="block font-semibold" />
                        </div>
                        <div className="shrink-0 text-right">
                            <Editable ph="Location" className="block" />
                            <PeriodField />
                        </div>
                    </div>
                    <ul className="mt-1 list-disc pl-5 text-slate-700">
                        <li><Editable ph="Highlight your accomplishments, using numbers if possible." /></li>
                    </ul>
                </>
            );
        }
        if (kind === 'edu') {
            return (
                <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                        <Editable ph="School / University" className="block font-semibold" />
                        <Editable ph="Degree and field of study" className="block text-slate-600" />
                    </div>
                    <div className="shrink-0 text-right">
                        <Editable ph="Location" className="block" />
                        <PeriodField />
                    </div>
                </div>
            );
        }
        if (kind === 'courses') {
            return (
                <p>
                    <Editable ph={primaryPh} className="text-slate-500" />
                    <span className="px-1.5 text-slate-400">—</span>
                    <Editable ph={secondaryPh} />
                </p>
            );
        }
        return <Editable ph={ph} className="block" />;
    },
};

export default classic;
