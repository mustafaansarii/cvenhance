import { Link } from 'react-router-dom';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

export default function ComingSoon({ breadcrumb, title, description }) {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero breadcrumb={breadcrumb} title={title} description={description} />
            </div>

            <main className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6 lg:px-8">
                <span className="inline-flex items-center gap-2 rounded-full border border-accent bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-accent">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent" />
                    Coming soon
                </span>
                <p className="mx-auto mt-5 max-w-lg text-base leading-relaxed text-muted-foreground">
                    We&rsquo;re building this. In the meantime, get your resume ready so you&rsquo;re set the
                    moment it launches.
                </p>
                <div className="mt-7 flex flex-wrap justify-center gap-3">
                    <Link to="/templates?type=CV_AND_RESUME&page=1&size=50" className="rounded-full bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover">
                        Build my resume
                    </Link>
                    <Link to="/" className="rounded-full border border-border px-5 py-2.5 text-sm font-semibold text-muted-foreground transition hover:bg-muted">
                        Back home
                    </Link>
                </div>
            </main>
        </>
    );
}
