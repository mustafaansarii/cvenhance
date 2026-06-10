import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import docService from '../services/doc.service';
import { defaultResume, buildResumeLatex } from '../services/resumeBuilder';

const input =
    'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20';
const label = 'mb-1 block text-xs font-medium text-slate-600';

function Field({ label: l, value, onChange, placeholder, full }) {
    return (
        <div className={full ? 'col-span-2' : ''}>
            <label className={label}>{l}</label>
            <input className={input} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
        </div>
    );
}

export default function ResumeFormEditor() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [resume, setResume] = useState(defaultResume);
    const [compiling, setCompiling] = useState(false);
    const [pdfUrl, setPdfUrl] = useState('');
    const blobRef = useRef(null);

    useEffect(() => () => { if (blobRef.current) URL.revokeObjectURL(blobRef.current); }, []);

    const patch = (changes) => setResume((r) => ({ ...r, ...changes }));
    const setContact = (k, v) => setResume((r) => ({ ...r, contact: { ...r.contact, [k]: v } }));

    const updateList = (key, i, changes) =>
        setResume((r) => ({ ...r, [key]: r[key].map((it, idx) => (idx === i ? { ...it, ...changes } : it)) }));
    const addItem = (key, blank) => setResume((r) => ({ ...r, [key]: [...r[key], blank] }));
    const removeItem = (key, i) => setResume((r) => ({ ...r, [key]: r[key].filter((_, idx) => idx !== i) }));

    const setBullet = (ei, bi, v) =>
        setResume((r) => ({
            ...r,
            experience: r.experience.map((ex, idx) =>
                idx === ei ? { ...ex, bullets: ex.bullets.map((b, j) => (j === bi ? v : b)) } : ex),
        }));
    const addBullet = (ei) =>
        setResume((r) => ({
            ...r,
            experience: r.experience.map((ex, idx) => (idx === ei ? { ...ex, bullets: [...ex.bullets, ''] } : ex)),
        }));

    const handleCompile = async () => {
        if (compiling) return;
        setCompiling(true);
        try {
            const latex = buildResumeLatex(resume);
            const data = await docService.compile(id, latex);
            if (blobRef.current) URL.revokeObjectURL(blobRef.current);
            const url = URL.createObjectURL(new Blob([data], { type: 'application/pdf' }));
            blobRef.current = url;
            setPdfUrl(url);
            toast.success('Preview updated');
        } catch (err) {
            let msg = err?.response?.data?.message || 'Compilation failed';
            if (err?.response?.data instanceof Blob) {
                try { msg = JSON.parse(await err.response.data.text())?.message || msg; } catch { /* ignore */ }
            }
            toast.error(msg);
        } finally {
            setCompiling(false);
        }
    };

    return (
        <div className="flex h-screen flex-col bg-slate-100">
            {/* Toolbar */}
            <div className="flex h-12 shrink-0 items-center justify-between border-b border-slate-200 bg-white px-4">
                <button onClick={() => navigate(-1)} className="flex items-center gap-1 rounded px-1.5 py-1 text-xs text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-3.5 w-3.5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" /></svg>
                    Back
                </button>
                <span className="text-xs font-medium text-slate-500">Resume editor — form mode</span>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigate(`/doc-editor/${id}`)} className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">
                        {'</>'} LaTeX editor
                    </button>
                    {pdfUrl && (
                        <a href={pdfUrl} download="resume.pdf" className="rounded-md px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:bg-slate-100 hover:text-slate-900">Download</a>
                    )}
                    <button onClick={handleCompile} disabled={compiling}
                        className="rounded-md bg-slate-900 px-4 py-1.5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50">
                        {compiling ? 'Compiling…' : 'Preview PDF'}
                    </button>
                </div>
            </div>

            <div className="flex flex-1 overflow-hidden">
                {/* Form */}
                <div className="w-1/2 overflow-y-auto border-r border-slate-200 bg-white p-6">
                    <div className="mx-auto max-w-xl space-y-8">
                        {/* Header */}
                        <section>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Header</h3>
                            <div className="grid grid-cols-2 gap-3">
                                <Field label="Full name" value={resume.name} onChange={(v) => patch({ name: v })} full />
                                <Field label="Title" value={resume.title} onChange={(v) => patch({ title: v })} full />
                                <Field label="Phone" value={resume.contact.phone} onChange={(v) => setContact('phone', v)} />
                                <Field label="Email" value={resume.contact.email} onChange={(v) => setContact('email', v)} />
                                <Field label="LinkedIn / Portfolio" value={resume.contact.linkedin} onChange={(v) => setContact('linkedin', v)} />
                                <Field label="Location" value={resume.contact.location} onChange={(v) => setContact('location', v)} />
                            </div>
                        </section>

                        {/* Summary */}
                        <section>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Summary</h3>
                            <textarea className={`${input} h-24 resize-y`} value={resume.summary}
                                onChange={(e) => patch({ summary: e.target.value })}
                                placeholder="Briefly explain why you're a great fit for the role." />
                        </section>

                        {/* Experience */}
                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Experience</h3>
                                <button onClick={() => addItem('experience', { company: '', role: '', location: '', period: '', bullets: [''] })}
                                    className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ Add</button>
                            </div>
                            <div className="space-y-5">
                                {resume.experience.map((ex, i) => (
                                    <div key={i} className="rounded-xl border border-slate-200 p-4">
                                        <div className="mb-2 flex justify-end">
                                            {resume.experience.length > 1 && (
                                                <button onClick={() => removeItem('experience', i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="Company" value={ex.company} onChange={(v) => updateList('experience', i, { company: v })} />
                                            <Field label="Role / Title" value={ex.role} onChange={(v) => updateList('experience', i, { role: v })} />
                                            <Field label="Location" value={ex.location} onChange={(v) => updateList('experience', i, { location: v })} />
                                            <Field label="Period" value={ex.period} onChange={(v) => updateList('experience', i, { period: v })} placeholder="May 2024 – Present" />
                                        </div>
                                        <div className="mt-3">
                                            <label className={label}>Highlights</label>
                                            <div className="space-y-2">
                                                {ex.bullets.map((b, bi) => (
                                                    <input key={bi} className={input} value={b} onChange={(e) => setBullet(i, bi, e.target.value)}
                                                        placeholder="Accomplishment, with numbers where possible." />
                                                ))}
                                            </div>
                                            <button onClick={() => addBullet(i)} className="mt-2 text-xs font-semibold text-teal-600 hover:text-teal-700">+ Add highlight</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Education */}
                        <section>
                            <div className="mb-3 flex items-center justify-between">
                                <h3 className="text-sm font-bold uppercase tracking-wide text-slate-700">Education</h3>
                                <button onClick={() => addItem('education', { school: '', degree: '', location: '', period: '' })}
                                    className="text-xs font-semibold text-teal-600 hover:text-teal-700">+ Add</button>
                            </div>
                            <div className="space-y-5">
                                {resume.education.map((ed, i) => (
                                    <div key={i} className="rounded-xl border border-slate-200 p-4">
                                        <div className="mb-2 flex justify-end">
                                            {resume.education.length > 1 && (
                                                <button onClick={() => removeItem('education', i)} className="text-xs text-red-400 hover:text-red-600">Remove</button>
                                            )}
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Field label="School" value={ed.school} onChange={(v) => updateList('education', i, { school: v })} />
                                            <Field label="Degree" value={ed.degree} onChange={(v) => updateList('education', i, { degree: v })} />
                                            <Field label="Location" value={ed.location} onChange={(v) => updateList('education', i, { location: v })} />
                                            <Field label="Period" value={ed.period} onChange={(v) => updateList('education', i, { period: v })} />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* Skills */}
                        <section>
                            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-slate-700">Skills</h3>
                            <textarea className={`${input} h-20 resize-y`} value={resume.skills}
                                onChange={(e) => patch({ skills: e.target.value })}
                                placeholder="e.g. Java, Spring Boot, React, SQL, Docker" />
                        </section>
                    </div>
                </div>

                {/* Preview */}
                <div className="flex w-1/2 flex-col bg-slate-300">
                    {pdfUrl ? (
                        <iframe key={pdfUrl} src={pdfUrl} title="PDF preview" className="h-full w-full border-none" />
                    ) : (
                        <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-500">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="h-10 w-10 opacity-40">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <p className="text-sm">Fill the form, then hit <span className="font-semibold text-teal-700">Preview PDF</span></p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
