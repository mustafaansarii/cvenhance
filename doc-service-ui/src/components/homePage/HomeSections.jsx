import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import docService from '../../services/doc.service';

const MotionDiv = motion.div;

const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    show: (i = 0) => ({ opacity: 1, y: 0, transition: { duration: 0.5, delay: i * 0.08 } }),
};
const viewport = { once: true, amount: 0.2 };

const TRUST_LOGOS = ['Google', 'Amazon', 'Microsoft', 'Meta', 'Netflix', 'Stripe'];

const STATS = [
    { value: '500K+', label: 'documents created', tint: 'bg-muted text-foreground' },
    { value: '40+', label: 'professional templates', tint: 'bg-muted text-foreground' },
    { value: '6 years', label: 'helping job seekers', tint: 'bg-muted text-foreground' },
    { value: '98%', label: 'pass ATS checks', tint: 'bg-muted text-foreground' },
];

const FEATURES = [
    { title: 'AI-assisted writing', desc: 'Turn rough notes into polished, recruiter-ready bullet points in seconds.', path: 'M9.5 3a1 1 0 011 1 4 4 0 004 4 1 1 0 010 2 4 4 0 00-4 4 1 1 0 01-2 0 4 4 0 00-4-4 1 1 0 010-2 4 4 0 004-4 1 1 0 011-1z' },
    { title: 'ATS-friendly', desc: 'Clean, parsable layouts that sail through applicant tracking systems.', path: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
    { title: 'Live PDF preview', desc: 'Edit on the left, watch your compiled PDF update live on the right.', path: 'M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.5 12C3.7 7.9 7.5 5 12 5s8.3 2.9 9.5 7c-1.2 4.1-5 7-9.5 7s-8.3-2.9-9.5-7z' },
    { title: 'Designer templates', desc: 'Dozens of professionally crafted templates for every document type.', path: 'M4 5a1 1 0 011-1h14a1 1 0 011 1v4H4V5zm0 6h7v9H5a1 1 0 01-1-1v-8zm9 0h7v8a1 1 0 01-1 1h-6v-9z' },
];

const ATS_PILLS = [
    { title: 'Readable contact information', path: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
    { title: 'Full experience parsing', path: 'M9 17v-6h13M9 7h13M5 7h.01M5 12h.01M5 17h.01' },
    { title: 'Optimized skills section', path: 'M13 10V3L4 14h7v7l9-11h-7z' },
];

const STEPS = [
    { n: '01', title: 'Pick a template', desc: 'Choose from polished, ATS-ready designs for resumes, cover letters and more.' },
    { n: '02', title: 'Make it yours', desc: 'Edit content in the live editor — the PDF preview updates as you type.' },
    { n: '03', title: 'Download & apply', desc: 'Export a pixel-perfect PDF and save it to your account for later edits.' },
];

const TEMPLATES = [
    { src: 'https://i.ibb.co/v4dWrK1j/Vishnu-Singh.jpg', name: 'Modern Tech', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'http://raw.githubusercontent.com/jakegut/resume/refs/heads/master/resume.png', name: 'Classic Professional', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'https://i.ibb.co/7HgSdbL/William-Lucas.jpg', name: 'Engineering Pro', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'https://cdn.enhancv.com/images/1098/i/aHR0cHM6Ly9jZG4uZW5oYW5jdi5jb20vcHJlZGVmaW5lZC1leGFtcGxlcy9vU0ZjUElJdk1rVUhzT2xQQ0gwU3NLRUF0aVprd0N6Q2xPTFRFUFJmL2ltYWdlLnBuZw~~.png', name: 'Enhancv Style', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
];

const REVIEWS = [
    { name: 'Khushboo S.', when: '22 hours ago', stars: 5, text: 'The best CV building tool — tailored output for every job description, and the look and feel is truly dynamic.' },
    { name: 'Virgil', when: '1 day ago', stars: 5, text: 'Very easy to draft a CV with lots of templates to choose from.' },
    { name: 'Collins', when: '2 days ago', stars: 5, text: 'It aids in generating a good, outstanding, comprehensive resume.' },
    { name: 'Aisha K.', when: '3 days ago', stars: 5, text: 'Rebuilt my resume in 20 minutes and started getting callbacks the same week.' },
    { name: 'Roseline', when: '4 days ago', stars: 5, text: 'Nicely surprised by the professional level of the templates.' },
    { name: 'Daniel R.', when: '5 days ago', stars: 4, text: 'Finally a builder that does not fight me on formatting. Genuinely professional.' },
];

const FAQS = [
    { q: 'Is CVEnhance free to use?', a: 'Yes. You can build a resume, fill in your details, and download a PDF for free — no payment required to get a finished, recruiter-ready document.' },
    { q: 'Do I need an account to build a resume?', a: 'No. You can open the resume builder and download a PDF without signing in. Creating an account simply lets us save your details and reuse them next time.' },
    { q: 'What is the difference between the form editor and the LaTeX editor?', a: 'The form editor is the default — you fill in structured fields and see a live preview, no coding needed. The LaTeX editor is for advanced users who want to tweak the raw LaTeX of the same template. Use the ⋯ menu on any template to switch.' },
    { q: 'Are CVEnhance resumes ATS-friendly?', a: 'Yes. Every template uses clean, single-column-friendly layouts with standard section headings and readable fonts, so applicant tracking systems can parse your name, experience, and skills without dropping content.' },
    { q: 'How do I download my resume as a PDF?', a: 'Click “Download PDF” in the builder. It produces a crisp, multi-page US-Letter PDF with proper margins — page breaks fall between sections so nothing gets cut in half.' },
    { q: 'Can I edit my resume after I have started?', a: 'Of course. Edit any field inline, drag headings to reorder sections, add or remove sections, and re-download anytime. If you are signed in, your edits are saved back to your account on download.' },
    { q: 'Will my saved details pre-fill the builder?', a: 'Yes. Once you add your details under Profile → Resume details, every template you open is automatically pre-filled with your information. If you have not added anything yet, the form shows example content you can replace.' },
    { q: 'Can I switch templates without re-typing everything?', a: 'Yes. Your information lives in one place and flows into whichever template you pick, so changing the design never means re-entering your experience, education, or skills.' },
    { q: 'How do I sign in or create an account?', a: 'Use your email and password, or continue with Google or GitHub. If you sign in with a social account for the first time, an account is created for you automatically.' },
    { q: 'Can I add sections like Projects, Certifications, or Awards?', a: 'Yes. Use “Add section” at the bottom of the builder to add Projects, Certifications, Achievements, Awards, Languages, Volunteering, Publications, and more — then reorder them by dragging the headings.' }
];

function FaqItem({ item, isOpen, onToggle }) {
    return (
        <div className="rounded-2xl border border-border bg-card transition hover:border-accent">
            <button
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                aria-expanded={isOpen}
            >
                <span className="text-sm font-semibold sm:text-base text-foreground">{item.q}</span>
                <svg
                    viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
                    className={`h-5 w-5 shrink-0 text-accent transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            <div className={`grid overflow-hidden px-5 transition-all duration-300 ease-in-out ${isOpen ? 'grid-rows-[1fr] pb-5 opacity-100' : 'grid-rows-[0fr] opacity-0'}`}>
                <div className="overflow-hidden">
                    <p className="text-sm leading-relaxed text-muted-foreground">{item.a}</p>
                </div>
            </div>
        </div>
    );
}

function FaqSection() {
    const [open, setOpen] = useState(0);
    return (
        <section className="border-t border-border">
            <div className="mx-auto max-w-3xl px-4 py-24 sm:px-6 lg:px-8">
                <MotionDiv variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport} className="text-center">
                    <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Frequently asked questions</h2>
                    <p className="mt-4 text-base text-muted-foreground">Everything you need to know about building documents with CVEnhance.</p>
                </MotionDiv>
                <div className="mt-12 space-y-3">
                    {FAQS.map((item, i) => (
                        <FaqItem key={item.q} item={item} isOpen={open === i} onToggle={() => setOpen(open === i ? -1 : i)} />
                    ))}
                </div>
            </div>
        </section>
    );
}

function FeatureIcon({ path }) {
    return (
        <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-accent/10 text-accent">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6">
                <path strokeLinecap="round" strokeLinejoin="round" d={path} />
            </svg>
        </div>
    );
}

function Stars({ count = 5 }) {
    return (
        <div className="flex gap-0.5">
            {Array.from({ length: 5 }).map((_, i) => (
                <span key={i} className={`flex h-5 w-5 items-center justify-center rounded ${i < count ? 'bg-accent' : 'bg-muted'}`}>
                    <svg viewBox="0 0 20 20" fill="white" className="h-3 w-3">
                        <path d="M10 1.5l2.6 5.27 5.82.85-4.21 4.1.99 5.8L10 14.77l-5.2 2.75.99-5.8L1.58 7.62l5.82-.85L10 1.5z" />
                    </svg>
                </span>
            ))}
        </div>
    );
}

export default function HomeSections() {
    const [liveTemplates, setLiveTemplates] = useState([]);
    useEffect(() => {
        let alive = true;
        docService.listTemplates({ type: 'CV_AND_RESUME', page: 0, size: 8 })
            .then((data) => {
                if (!alive) return;
                const cards = (data?.content || [])
                    .filter((t) => t.imageUrl)
                    .slice(0, 4)
                    .map((t) => ({ src: t.imageUrl, name: t.name, to: `/resume-builder/${t.templateCode}` }));
                setLiveTemplates(cards);
            })
            .catch(() => { /* keep fallback */ });
        return () => { alive = false; };
    }, []);
    const templateCards = liveTemplates.length ? liveTemplates : TEMPLATES;

    return (
        <div className="bg-background text-foreground">

            <section className="border-b border-border">
                <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
                    <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                        Trusted by job seekers hired at
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-x-10 gap-y-4">
                        {TRUST_LOGOS.map((logo) => (
                            <span key={logo} className="text-lg font-bold tracking-tight text-muted-foreground">{logo}</span>
                        ))}
                    </div>
                </div>
            </section>

            <section className="relative overflow-hidden border-b border-border mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
                <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end sm:gap-6">
                    <div className="max-w-xl">
                        <span className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                            Templates
                        </span>
                        <h2 className="mt-4 font-serif text-2xl font-bold tracking-tight sm:text-4xl text-foreground">Templates that recruiters love</h2>
                        <p className="mt-3 text-sm text-muted-foreground sm:mt-4 sm:text-base">Field-tested, ATS-safe, and fully editable. Pick one and make it yours.</p>
                    </div>
                    <Link to="/templates" className="group inline-flex shrink-0 items-center gap-1.5 rounded-full border border-accent/40 px-5 py-2.5 text-sm font-semibold text-accent transition hover:bg-accent hover:text-accent-foreground">
                        Browse all templates
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 transition-transform group-hover:translate-x-0.5"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" /></svg>
                    </Link>
                </div>

                <div className="mx-auto mt-10 grid max-w-8xl grid-cols-2 gap-4 sm:mt-14 sm:grid-cols-4 sm:gap-6">
                    {templateCards.map((t, i) => (
                        <MotionDiv key={t.name + i} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                            <Link to={t.to || '/templates'} className="group block overflow-hidden bg-card shadow-md ring-1 ring-border transition hover:-translate-y-1 hover:shadow-lg" style={{ aspectRatio: '3/4' }}>
                                <img
                                    src={t.src}
                                    alt={t.name}
                                    className="h-full w-full object-cover object-top transition-transform duration-300 group-hover:scale-[1.03]"
                                    onError={(e) => { e.currentTarget.src = 'https://placehold.co/600x800?text=Template'; }}
                                />
                            </Link>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="grid items-center gap-12 lg:grid-cols-2">
                    <div className="grid grid-cols-2 gap-5">
                        {STATS.map((s, i) => (
                            <MotionDiv
                                key={s.label}
                                custom={i}
                                variants={fadeUp}
                                initial="hidden"
                                whileInView="show"
                                viewport={viewport}
                                className={`rounded-3xl p-7 ${s.tint} ${i % 2 === 1 ? 'mt-8' : ''}`}
                            >
                                <p className="text-4xl font-extrabold tracking-tight sm:text-5xl">{s.value}</p>
                                <p className="mt-2 text-sm font-medium opacity-80">{s.label}</p>
                            </MotionDiv>
                        ))}
                    </div>

                    <MotionDiv variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                        <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl text-foreground">
                            Chosen by <span className="text-accent">thousands</span> of job applicants worldwide
                        </h2>
                        <p className="mt-5 text-base leading-relaxed text-muted-foreground">
                            CVEnhance is a document builder that helps you create applications with impact and professionalism — trusted at every step of the job hunt to emphasize your experience, value, and skills.
                        </p>
                        <p className="mt-4 text-base leading-relaxed text-muted-foreground">
                            We pair flexible, ATS-friendly templates with an intuitive editor and a live PDF preview, so you can present a complete, polished application in minutes.
                        </p>
                        <Link to="/templates" className="mt-7 inline-flex items-center gap-1.5 text-sm font-semibold text-accent hover:text-accent-hover">
                            Explore templates
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" /></svg>
                        </Link>
                    </MotionDiv>
                </div>
            </section>

            <section className="border-y border-border">
                <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
                    <div className="mx-auto max-w-2xl text-center">
                        <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-foreground">Everything you need to get hired</h2>
                        <p className="mt-4 text-base text-muted-foreground">The builder handles design and formatting, so you can focus on the words that land the job.</p>
                    </div>
                    <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {FEATURES.map((f, i) => (
                            <MotionDiv key={f.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                className="rounded-2xl border border-border bg-card p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-lg">
                                <FeatureIcon path={f.path} />
                                <h3 className="text-base font-semibold text-foreground">{f.title}</h3>
                                <p className="mt-2 text-sm text-muted-foreground">{f.desc}</p>
                            </MotionDiv>
                        ))}
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[2rem] border border-border bg-muted px-6 py-14 sm:px-12 lg:py-20">
                    <div className="relative grid items-center gap-12 lg:grid-cols-2">
                        <MotionDiv variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                            <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight text-foreground sm:text-4xl">
                                Resumes optimized for Applicant Tracking Systems
                            </h2>
                            <p className="mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                                Every template is tested against top ATS software for full compatibility — clean layouts, readable fonts, and standard section titles, so nothing gets lost.
                            </p>
                            <Link to="/templates?type=CV_AND_RESUME" className="mt-8 inline-flex items-center gap-1.5 rounded-full bg-accent hover:bg-accent-hover px-6 py-3 text-sm font-semibold text-accent-foreground shadow-lg transition">
                                Build an ATS-friendly resume
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" /></svg>
                            </Link>
                        </MotionDiv>

                        <div className="space-y-4">
                            {ATS_PILLS.map((p, i) => (
                                <MotionDiv key={p.title} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                    className={`flex items-center gap-4 rounded-2xl border border-border bg-card p-4 ${i === 1 ? 'lg:ml-12' : i === 2 ? 'lg:ml-6' : ''}`}>
                                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent">
                                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-6 w-6"><path strokeLinecap="round" strokeLinejoin="round" d={p.path} /></svg>
                                    </span>
                                    <span className="text-sm font-semibold text-foreground">{p.title}</span>
                                </MotionDiv>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <section className="mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-2xl text-center">
                    <h2 className="font-serif text-3xl font-bold tracking-tight sm:text-4xl text-foreground">From blank page to PDF in 3 steps</h2>
                </div>
                <div className="mt-14 grid gap-8 md:grid-cols-3">
                    {STEPS.map((s, i) => (
                        <MotionDiv key={s.n} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}>
                            <span className="text-5xl font-extrabold text-accent/25">{s.n}</span>
                            <h3 className="mt-3 text-lg font-semibold text-foreground">{s.title}</h3>
                            <p className="mt-2 text-sm text-muted-foreground">{s.desc}</p>
                        </MotionDiv>
                    ))}
                </div>
            </section>

            <section className="relative overflow-hidden border-y border-border bg-muted">
                <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-8">
                    <div className="grid items-start gap-8 lg:grid-cols-[1fr_1.4fr]">
                        <div className="lg:sticky lg:top-24">
                            <h2 className="font-serif text-3xl font-bold leading-tight tracking-tight sm:text-4xl text-foreground">Trusted by executives &amp; senior professionals</h2>
                            <div className="mt-6 inline-flex items-center gap-3 rounded-2xl border border-border bg-card px-5 py-4 shadow-sm">
                                <Stars count={5} />
                                <div>
                                    <p className="text-lg font-bold text-foreground">4.8 / 5</p>
                                    <p className="text-xs text-muted-foreground">5,270+ happy customers</p>
                                </div>
                            </div>
                        </div>

                        <div className="columns-1 gap-5 sm:columns-2 [&>*]:mb-5">
                            {REVIEWS.map((r, i) => (
                                <MotionDiv key={r.name} custom={i % 3} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                    className="break-inside-avoid rounded-2xl border border-border bg-card p-5 shadow-sm">
                                    <Stars count={r.stars} />
                                    <p className="mt-2 text-xs text-muted-foreground">{r.when}</p>
                                    <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{r.text}</p>
                                    <p className="mt-4 text-sm font-semibold text-foreground">— {r.name}</p>
                                </MotionDiv>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <FaqSection />
        </div>
    );
}
