import { useParams } from 'react-router-dom';
import ResumeWorkspace from '../resume-template/ResumeWorkspace';
import { getTemplate } from '../resume-template/registry';

/*
 * Public, no-auth form-based resume builder. The :code route param selects which template design
 * to render (defaults to the classic design when omitted or unknown).
 */
export default function ResumeBuilder() {
    const { code } = useParams();
    const design = getTemplate(code);
    return <ResumeWorkspace key={design.code} design={design} />;
}
