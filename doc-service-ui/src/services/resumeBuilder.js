// Builds clean, ATS-friendly LaTeX from a structured resume model — used by the form-based editor.
// The generated LaTeX is compiled by the existing backend (PATCH /api/user-docs/{id}/compile).

export const defaultResume = {
    name: 'Your Name',
    title: 'Your Professional Title',
    contact: { phone: '', email: '', linkedin: '', location: '' },
    summary: '',
    experience: [
        { company: '', role: '', location: '', period: '', bullets: [''] },
    ],
    education: [
        { school: '', degree: '', location: '', period: '' },
    ],
    skills: '',
};

/** Escapes LaTeX special characters so user input can't break compilation. */
export function escapeLatex(value) {
    if (value === null || value === undefined) return '';
    return String(value)
        .replace(/\\/g, '\\textbackslash{}')
        .replace(/([&%$#_{}])/g, '\\$1')
        .replace(/~/g, '\\textasciitilde{}')
        .replace(/\^/g, '\\textasciicircum{}');
}

const e = escapeLatex;

function contactLine(c) {
    return [c.phone, c.email, c.linkedin, c.location]
        .filter((v) => v && v.trim())
        .map(e)
        .join(' $\\bullet$ ');
}

function experienceBlock(items) {
    return items
        .filter((it) => it.company || it.role)
        .map((it) => {
            const bullets = (it.bullets || [])
                .filter((b) => b && b.trim())
                .map((b) => `    \\item ${e(b)}`)
                .join('\n');
            const list = bullets ? `\\begin{itemize}\n${bullets}\n\\end{itemize}` : '';
            return `\\textbf{${e(it.company)}} \\hfill ${e(it.location)}\\\\\n\\textit{${e(it.role)}} \\hfill ${e(it.period)}\n${list}`;
        })
        .join('\n\\vspace{4pt}\n');
}

function educationBlock(items) {
    return items
        .filter((it) => it.school || it.degree)
        .map((it) => `\\textbf{${e(it.school)}} \\hfill ${e(it.location)}\\\\\n\\textit{${e(it.degree)}} \\hfill ${e(it.period)}`)
        .join('\n\\vspace{4pt}\n');
}

function section(title, body) {
    if (!body || !body.trim()) return '';
    return `\\section*{${title}}\n${body}\n`;
}

/** Builds the full LaTeX document from the resume model. */
export function buildResumeLatex(resume) {
    const r = { ...defaultResume, ...resume };
    const header = `\\begin{center}
{\\Huge\\bfseries ${e(r.name)}}\\\\[3pt]
{\\large ${e(r.title)}}\\\\[3pt]
{\\small ${contactLine(r.contact || {})}}
\\end{center}`;

    const skills = (r.skills || '').trim() ? `${e(r.skills)}` : '';

    return `\\documentclass[11pt]{article}
\\usepackage[margin=0.75in]{geometry}
\\usepackage{enumitem}
\\usepackage{titlesec}
\\usepackage[hidelinks]{hyperref}
\\setlist[itemize]{leftmargin=1.2em,topsep=2pt,itemsep=1pt}
\\titleformat{\\section}{\\large\\bfseries\\scshape}{}{0em}{}[\\titlerule]
\\titlespacing*{\\section}{0pt}{10pt}{5pt}
\\pagestyle{empty}
\\begin{document}
${header}
${section('Summary', r.summary ? e(r.summary) : '')}
${section('Experience', experienceBlock(r.experience || []))}
${section('Education', educationBlock(r.education || []))}
${section('Skills', skills)}
\\end{document}`;
}
