import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import ResumeWorkspace from '../resume-template/ResumeWorkspace';
import userService from '../services/user.service';
import resumeBuilderService from '../services/resume-builder.service';
import ResumeBuilderSkeleton from '../components/shared/ResumeBuilderSkeleton';
import { createDataDrivenDesign } from '../resume-template/dataDrivenTemplate';

export default function ResumeBuilder() {
    const { code } = useParams();
    const [state, setState] = useState({ loading: true, profile: null, authed: false, template: null, document: null, templates: [], error: null });

    useEffect(() => {
        let alive = true;
        (async () => {
            try {
                const templates = await resumeBuilderService.listTemplates();
                if (!code) {
                    if (alive) setState({ loading: false, profile: null, authed: false, template: null, document: null, templates, error: null });
                    return;
                }
                const template = templates.find((item) => item.templateCode === code) || await resumeBuilderService.getTemplate(code);
                let profile = null;
                let document = null;
                let authed = false;
                try {
                    const me = await userService.getProfile();
                    profile = me?.profileData || null;
                    authed = true;
                    document = await resumeBuilderService.openDocument(template.templateCode);
                } catch {
                    // A signed-out visitor can still use the builder; saving starts after sign-in.
                }
                if (alive) setState({ loading: false, profile, authed, template, document, templates, error: null });
            } catch (error) {
                if (alive) setState({ loading: false, profile: null, authed: false, template: null, document: null, templates: [], error: error?.response?.data?.message || 'Unable to load resume templates.' });
            }
        })();
        return () => { alive = false; };
    }, [code]);

    if (state.loading) {
        return <ResumeBuilderSkeleton />;
    }

    if (!code) {
        return <TemplatePicker templates={state.templates} error={state.error} />;
    }

    if (state.error || !state.template) {
        return <div className="mx-auto max-w-xl px-6 py-24 text-center"><p className="text-sm text-muted-foreground">{state.error || 'Template not found.'}</p><Link to="/resume-builder" className="mt-5 inline-flex rounded-lg bg-accent px-4 py-2 text-sm font-semibold text-accent-foreground">Browse templates</Link></div>;
    }

    const design = createDataDrivenDesign(state.template);
    return <ResumeWorkspace key={`${design.code}:${state.document?.id || 'visitor'}`} design={design} initialProfile={state.profile} initialDocument={state.document} authed={state.authed} />;
}

function TemplatePicker({ templates, error }) {
    return (
        <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
            <div className="mb-8"><h1 className="text-2xl font-bold text-foreground">Choose a resume template</h1><p className="mt-1 text-sm text-muted-foreground">Every template is loaded from the CVEnhance template catalog.</p></div>
            {error ? <p className="text-sm text-red-600">{error}</p> : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {templates.map((template) => <Link key={template.templateCode} to={`/resume-builder/${template.templateCode}`} className="border border-border bg-card p-5 transition hover:border-accent hover:shadow-sm">
                        <div className="h-2 w-12" style={{ backgroundColor: template.config?.accent || '#0f766e' }} />
                        <h2 className="mt-4 font-semibold text-foreground">{template.name}</h2>
                        <p className="mt-1 text-sm text-muted-foreground">{template.description || 'Editable resume template'}</p>
                    </Link>)}
                </div>
            )}
        </main>
    );
}
