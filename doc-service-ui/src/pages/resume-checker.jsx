import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

const CHECKS = [
    'Name and contact details are present and parseable',
    'A clear professional summary',
    'Experience with quantified, results-driven bullet points',
    'Skills listed and relevant to the role',
    'Education and key achievements included',
    'Clean, single-column, ATS-friendly formatting',
];

export default function ResumeCheckerPage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Resume Checker"
                    title="Is your resume good enough?"
                    description="Check your resume against recruiter and ATS best practices, then fix the gaps in minutes."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-center text-base leading-relaxed text-muted-foreground">
                    Upload your existing resume to import it into CVEnhance, then review it against the checklist
                    below and improve it with our AI-assisted builder.
                </p>

                <ul className="mx-auto mt-8 max-w-xl space-y-3">
                    {CHECKS.map((c) => (
                        <li key={c} className="flex items-start gap-3 text-sm text-muted-foreground">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="mt-0.5 h-4 w-4 shrink-0 text-accent"><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                            <span>{c}</span>
                        </li>
                    ))}
                </ul>

                <div className="mt-9 flex flex-wrap justify-center gap-3">
                    <Link to="/templates?type=CV_AND_RESUME&page=1&size=50" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover">
                        Build &amp; improve my resume
                    </Link>
                    <Link to="/profile" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted">
                        Upload my resume
                    </Link>
                </div>
            </main>
        </>
    );
}
