import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

function Clause({ children }) {
    return (
        <li className="flex gap-3">
            <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            <span>{children}</span>
        </li>
    );
}

function Section({ title, children }) {
    return (
        <section className="mt-8">
            <h2 className="text-lg font-bold text-foreground">{title}</h2>
            <div className="mt-3 space-y-4 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </section>
    );
}

export default function PrivacyPolicyPage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Legal"
                    title="Privacy Policy"
                    description="How CVEnhance collects, uses, stores, shares, and protects your data — including data from Google."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm text-muted-foreground">Last updated on 5 July 2026</p>

                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    CVEnhance (“we”, “us”) is an online resume and document builder available at{' '}
                    <a href="https://www.cvenhance.in" className="font-semibold text-accent hover:underline">www.cvenhance.in</a>.
                    This policy explains what data we collect, how we use it, who we share it with, how we protect it,
                    and how you can delete it. It applies to all users and specifically documents how we handle data
                    obtained through Google sign-in.
                </p>

                <Section title="Data we access and collect">
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Google account data (via Google Sign-In).</strong> When you choose to sign in with
                            Google, we request the <em>email</em> and <em>profile</em> scopes and receive your
                            name, email address, and Google profile identifier. We do not request access to Gmail,
                            Google Drive, Contacts, Calendar, or any other Google service.
                        </Clause>
                        <Clause>
                            <strong>Other sign-in providers.</strong> If you sign in with GitHub, we receive your name,
                            public profile, and email address from GitHub.
                        </Clause>
                        <Clause>
                            <strong>Account & resume content you provide.</strong> Details you enter to build your
                            resume — such as your name, contact details, work experience, education, skills, projects,
                            an optional profile photo, and any resume file you upload for import.
                        </Clause>
                        <Clause>
                            <strong>Payment information.</strong> When you purchase a plan, payments are processed by
                            our payment provider (Cashfree). We do not store your card or bank details on our servers.
                        </Clause>
                    </ul>
                </Section>

                <Section title="How we use your data">
                    <ul className="space-y-4">
                        <Clause>To create and authenticate your account and keep you signed in.</Clause>
                        <Clause>To display your name and email in your profile and pre-fill your resume.</Clause>
                        <Clause>To generate, save, and let you download the resumes and documents you build.</Clause>
                        <Clause>To provide optional AI-assisted features (for example, importing an uploaded resume and improving resume text) when you use them.</Clause>
                        <Clause>To process purchases and provide customer support.</Clause>
                        <Clause>We do <strong>not</strong> use Google user data for advertising, and we do <strong>not</strong> sell your data.</Clause>
                    </ul>
                </Section>

                <Section title="How we share your data">
                    <p>
                        We do not sell your personal data. We share the minimum data necessary with the following
                        service providers strictly to operate CVEnhance:
                    </p>
                    <ul className="space-y-4">
                        <Clause><strong>Cashfree</strong> — to process payments.</Clause>
                        <Clause><strong>Supabase</strong> — secure storage of generated resume/document files.</Clause>
                        <Clause><strong>Resend</strong> — to send transactional emails such as verification codes.</Clause>
                        <Clause><strong>Google Gemini (Google AI)</strong> — only the specific resume text you choose to process with AI features is sent for that request; it is not used to train models.</Clause>
                    </ul>
                    <p>
                        We may also disclose data if required by law. CVEnhance’s use and transfer of information
                        received from Google APIs adheres to the{' '}
                        <a href="https://developers.google.com/terms/api-services-user-data-policy" className="font-semibold text-accent hover:underline" target="_blank" rel="noopener noreferrer">
                            Google API Services User Data Policy
                        </a>, including the Limited Use requirements.
                    </p>
                </Section>

                <Section title="How we store and protect your data">
                    <ul className="space-y-4">
                        <Clause>Data is stored in a managed PostgreSQL database with access restricted to the application.</Clause>
                        <Clause>All traffic is encrypted in transit over HTTPS/TLS.</Clause>
                        <Clause>Passwords (for email sign-up) are stored only as salted hashes, never in plain text.</Clause>
                        <Clause>Access to systems and secrets is limited to authorized personnel.</Clause>
                    </ul>
                </Section>

                <Section title="Data retention and deletion">
                    <ul className="space-y-4">
                        <Clause>
                            We retain your account and resume data for as long as your account is active so you can
                            return to your saved documents.
                        </Clause>
                        <Clause>
                            You can request deletion of your account and all associated personal data (including data
                            received from Google) at any time by contacting us through the{' '}
                            <a href="/contact-us" className="font-semibold text-accent hover:underline">Contact Us</a> page
                            or by emailing <a href="mailto:support@cvenhance.in" className="font-semibold text-accent hover:underline">support@cvenhance.in</a>.
                        </Clause>
                        <Clause>
                            We process verified deletion requests within 30 days and remove your data from our active
                            systems and backups on the next backup cycle.
                        </Clause>
                    </ul>
                </Section>

                <Section title="Contact us">
                    <p>
                        For any privacy question or request, reach us via the{' '}
                        <a href="/contact-us" className="font-semibold text-accent hover:underline">Contact Us</a> page
                        or at <a href="mailto:support@cvenhance.in" className="font-semibold text-accent hover:underline">support@cvenhance.in</a>.
                    </p>
                </Section>
            </main>
        </>
    );
}
