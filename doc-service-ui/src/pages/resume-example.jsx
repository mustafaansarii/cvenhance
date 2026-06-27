import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

const ROLES = [
    'Software Engineer', 'Data Scientist', 'Product Manager', 'Marketing',
    'Finance & Accounting', 'Designer', 'Graduate / Entry level', 'Sales',
];

export default function ResumeExamplePage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Resume Examples"
                    title="Generate or explore resume examples"
                    description="Browse role-based resume examples for inspiration, then generate your own in minutes."
                />
            </div>

            <main className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-center text-base leading-relaxed text-muted-foreground">
                    Pick a role to explore matching templates, or jump straight in and let our AI generate a
                    tailored resume from your details.
                </p>

                <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
                    {ROLES.map((role) => (
                        <Link
                            key={role}
                            to={`/templates?type=CV_AND_RESUME&keyword=${encodeURIComponent(role)}`}
                            className="rounded-xl border border-border bg-card px-4 py-3 text-center text-sm font-medium text-muted-foreground transition hover:border-accent hover:bg-accent/10"
                        >
                            {role}
                        </Link>
                    ))}
                </div>

                <div className="mt-9 flex justify-center">
                    <Link to="/templates?type=CV_AND_RESUME&page=1&size=50" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover">
                        Generate my resume
                    </Link>
                </div>
            </main>
        </>
    );
}
