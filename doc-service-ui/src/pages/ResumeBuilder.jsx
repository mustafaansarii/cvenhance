import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import ResumeWorkspace from '../resume-template/ResumeWorkspace';
import { getTemplate } from '../resume-template/registry';
import userService from '../services/user.service';
import resumeBuilderService from '../services/resume-builder.service';
import ResumeBuilderSkeleton from '../components/shared/ResumeBuilderSkeleton';
import Seo from '../components/shared/Seo';

export default function ResumeBuilder() {
    const { code } = useParams();
    const design = getTemplate(code); // local template design, keyed by code (falls back to classic)
    const [state, setState] = useState({ loading: true, profile: null, authed: false, document: null });

    useEffect(() => {
        let alive = true;
        (async () => {
            let profile = null;
            let authed = false;
            let document = null;
            try {
                const me = await userService.getProfile();
                profile = me?.profileData || null;
                authed = true;
                // Open a backend doc so save/unlock work. If this template code isn't seeded in
                // resume_builder_templates, fall back to a document-less (guest-style) session.
                try { document = await resumeBuilderService.openDocument(design.code); } catch { document = null; }
            } catch {
                // Signed-out visitor: still editable; saving/downloading begins after sign-in.
            }
            if (alive) setState({ loading: false, profile, authed, document });
        })();
        return () => { alive = false; };
    }, [design.code]);

    const templateName = design.name || 'Professional';
    const seo = (
        <Seo
            title={`${templateName} Resume Template — Free AI Resume Builder | CVEnhance`}
            description={`Build an ATS-friendly resume with the ${templateName} template. Fill in your details, get AI writing suggestions, and download a polished PDF — free to start.`}
            keywords={`${templateName} resume template, AI resume builder, ATS resume template, online resume maker, CV builder`}
            path={`/resume-builder/${design.code}`}
        />
    );

    if (state.loading) {
        return (<>{seo}<ResumeBuilderSkeleton /></>);
    }

    return (
        <>
            {seo}
            <ResumeWorkspace
                key={`${design.code}:${state.document?.id || 'visitor'}:${state.authed}`}
                design={design}
                initialProfile={state.profile}
                initialDocument={state.document}
                authed={state.authed}
            />
        </>
    );
}
