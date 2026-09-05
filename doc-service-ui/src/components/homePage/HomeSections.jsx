import { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';

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

const TEMPLATES = [
    { src: 'https://i.ibb.co/v4dWrK1j/Vishnu-Singh.jpg', name: 'Modern Tech', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'http://raw.githubusercontent.com/jakegut/resume/refs/heads/master/resume.png', name: 'Classic Professional', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'https://i.ibb.co/7HgSdbL/William-Lucas.jpg', name: 'Engineering Pro', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
    { src: 'https://cdn.enhancv.com/images/1098/i/aHR0cHM6Ly9jZG4uZW5oYW5jdi5jb20vcHJlZGVmaW5lZC1leGFtcGxlcy9vU0ZjUElJdk1rVUhzT2xQQ0gwU3NLRUF0aVprd0N6Q2xPTFRFUFJmL2ltYWdlLnBuZw~~.png', name: 'Enhancv Style', tag: 'Resume', to: '/templates?type=CV_AND_RESUME' },
];

const REVIEWS = [
    { name: 'Khushboo S.', when: '22 hours ago', stars: 5, text: 'The best CV building tool — tailored output for every job description, and the look and feel is truly dynamic.' },
    { name: 'Aisha K.', when: '3 days ago', stars: 5, text: 'Rebuilt my resume in 20 minutes and started getting callbacks the same week.' },
    { name: 'Roseline', when: '4 days ago', stars: 5, text: 'Nicely surprised by the professional level of the templates.' },
    { name: 'Daniel R.', when: '5 days ago', stars: 4, text: 'Finally a builder that does not fight me on formatting. Genuinely professional.' },
];

const FAQS = [
    { q: 'Is CVEnhance free to use?', a: 'Yes. You can build, edit, and download a finished, recruiter-ready PDF resume completely for free.' },
    { q: 'Are the templates ATS-friendly?', a: 'Yes. All our templates use clean layouts and readable fonts that Applicant Tracking Systems can easily parse.' },
    { q: 'Do I need an account to build a resume?', a: 'An account is required to save your progress, so you can return anytime to edit, update, or download your documents.' },
    { q: 'Can I switch templates after filling in my details?', a: 'Yes. You can browse our collection and apply a different design to your resume at any time.' },
    { q: 'Can I add custom sections like Projects or Certifications?', a: 'Absolutely. You can easily add, rename, or reorder any section within the live editor.' }
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
            <div className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
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
    const templateCards = TEMPLATES;

    return (
        <div className="bg-background text-foreground">

            <section className="border-b border-border">
                <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
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

            <section className="relative overflow-hidden border-b border-border mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

            <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

            <section className="relative overflow-hidden border-b border-border bg-muted">
                <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
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

                        <div className="grid gap-5 sm:grid-cols-2">
                            {REVIEWS.map((r, i) => (
                                <MotionDiv key={r.name} custom={i} variants={fadeUp} initial="hidden" whileInView="show" viewport={viewport}
                                    className="rounded-2xl border border-border bg-card p-5 shadow-sm">
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
