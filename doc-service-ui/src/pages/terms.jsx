import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

function Section({ title, children }) {
    return (
        <section className="mt-7">
            <h2 className="text-base font-bold text-foreground">{title}</h2>
            <div className="mt-2 space-y-2 text-sm leading-relaxed text-muted-foreground">{children}</div>
        </section>
    );
}

export default function TermsPage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Legal"
                    title="Terms & Conditions"
                    description="The terms that govern your use of CVEnhance."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm text-muted-foreground">Last updated on 4 September 2026</p>

                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    These Terms &amp; Conditions (&ldquo;Terms&rdquo;) govern your access to and use of
                    CVEnhance (the &ldquo;Service&rdquo;), available at{' '}
                    <a href="https://www.cvenhance.in" className="font-semibold text-accent hover:underline">
                        www.cvenhance.in
                    </a>
                    , operated by CVEnhance (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;). By
                    creating an account or using the Service, you agree to be bound by these Terms. If you do
                    not agree, please do not use the Service.
                </p>

                <Section title="1. Eligibility & Accounts">
                    <p>
                        You must be at least 18 years old (or have the consent of a parent or legal guardian) to
                        use the Service. You are responsible for all activity that occurs under your account and
                        for keeping your login credentials confidential. You agree to notify us immediately of
                        any unauthorised use of your account.
                    </p>
                </Section>

                <Section title="2. The Service">
                    <p>
                        CVEnhance provides tools to build, edit, analyse, and download resumes and related
                        career documents using AI-assisted and manual features. You retain full ownership of the
                        content you enter. We do not claim any ownership rights over your resume data, personal
                        information, or generated documents.
                    </p>
                </Section>

                <Section title="3. Plans & Payments">
                    <p>
                        Paid plans are <strong>one-time purchases</strong> (not recurring subscriptions) and do
                        not auto-renew. A purchase grants a fixed number of resume download credits (or
                        unlimited credits, depending on the plan) and is valid for{' '}
                        <strong>1 year</strong> from the date of purchase. All prices are displayed in Indian
                        Rupees (INR) on the Pricing page.
                    </p>
                    <p>
                        Payments are processed securely by our payment partner,{' '}
                        <strong>Cashfree Payments</strong>. We do not store your card number, CVV, bank account
                        details, or UPI credentials on our servers. All payment webhook signatures are verified
                        using HMAC-SHA256 to prevent tampering.
                    </p>
                </Section>

                <Section title="4. Cancellations & Refunds">
                    <p>
                        Cancellations and refunds are governed by our{' '}
                        <a href="/refund-policy" className="font-semibold text-accent hover:underline">
                            Cancellation &amp; Refund Policy
                        </a>
                        . Please review it before making a purchase.
                    </p>
                </Section>

                <Section title="5. Acceptable Use">
                    <p>You agree not to:</p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>Attempt to bypass payment, download limits, or access controls.</li>
                        <li>Upload unlawful, defamatory, or infringing content.</li>
                        <li>Use automated bots, scrapers, or other means to access the Service in bulk.</li>
                        <li>Interfere with or disrupt the Service, its servers, or other users&apos; experience.</li>
                        <li>Reverse-engineer, decompile, or extract source code from the Service.</li>
                    </ul>
                </Section>

                <Section title="6. Intellectual Property">
                    <p>
                        The Service — including its templates, design, branding, software, and documentation —
                        is owned by CVEnhance and protected by applicable intellectual property laws. You may
                        use the outputs (your resumes and documents) for your personal, professional, and
                        job-seeking purposes. You may not redistribute, resell, or commercially exploit the
                        templates or software.
                    </p>
                </Section>

                <Section title="7. Privacy & Data Security">
                    <p>
                        Your privacy is important to us. Our{' '}
                        <a href="/privacy-policy" className="font-semibold text-accent hover:underline">
                            Privacy Policy
                        </a>{' '}
                        explains what data we collect, how we use it, and how we protect it. Key security
                        measures include:
                    </p>
                    <ul className="mt-2 list-inside list-disc space-y-1">
                        <li>
                            <strong>AES-256-GCM encryption at rest</strong> for sensitive profile and resume
                            data stored in our database.
                        </li>
                        <li>
                            <strong>HTTPS/TLS encryption in transit</strong> for all communication between your
                            browser and our servers.
                        </li>
                        <li>
                            <strong>BCrypt password hashing</strong> — we never store, log, or transmit your
                            password in plain text.
                        </li>
                    </ul>
                </Section>

                <Section title="8. AI-Powered Features">
                    <p>
                        CVEnhance uses third-party AI providers (such as Google Gemini and OpenAI) to power
                        features like resume import, text improvement, and resume quality analysis. When you
                        use an AI feature, only the specific text you submit for that request is sent to the
                        AI provider. Your data is not used to train third-party AI models.
                    </p>
                    <p>
                        AI-generated content is provided as a suggestion. You are responsible for reviewing and
                        verifying the accuracy of all content in your resume before using it.
                    </p>
                </Section>

                <Section title="9. Disclaimers & Limitation of Liability">
                    <p>
                        The Service is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis
                        without warranties of any kind, express or implied. We do not guarantee employment
                        outcomes, interview invitations, or any specific result from using the Service.
                    </p>
                    <p>
                        To the maximum extent permitted by applicable law, CVEnhance shall not be liable for
                        any indirect, incidental, special, consequential, or punitive damages arising from or
                        related to your use of the Service, including but not limited to loss of data, revenue,
                        or opportunity.
                    </p>
                </Section>

                <Section title="10. Indemnification">
                    <p>
                        You agree to indemnify and hold harmless CVEnhance, its operators, and affiliates from
                        any claims, damages, losses, or expenses (including reasonable legal fees) arising from
                        your use of the Service, your violation of these Terms, or your violation of any
                        third-party rights.
                    </p>
                </Section>

                <Section title="11. Termination">
                    <p>
                        We may suspend or terminate your access to the Service if you violate these Terms,
                        engage in fraudulent activity, or if required by law. You may stop using the Service
                        and request deletion of your account at any time by contacting us.
                    </p>
                </Section>

                <Section title="12. Governing Law & Disputes">
                    <p>
                        These Terms are governed by and construed in accordance with the laws of India. Any
                        disputes arising from or relating to these Terms or the Service shall be subject to the
                        exclusive jurisdiction of the courts in India.
                    </p>
                </Section>

                <Section title="13. Changes to These Terms">
                    <p>
                        We may update these Terms from time to time. When we make material changes, we will
                        update the &ldquo;Last updated&rdquo; date at the top of this page. Your continued use
                        of the Service after such changes constitutes acceptance of the updated Terms.
                    </p>
                </Section>

                <Section title="14. Contact Us">
                    <p>
                        For any questions about these Terms, reach us via the{' '}
                        <a href="/contact-us" className="font-semibold text-accent hover:underline">
                            Contact Us
                        </a>{' '}
                        page or email us at{' '}
                        <a
                            href="mailto:support.cvenhance@gmail.com"
                            className="font-semibold text-accent hover:underline"
                        >
                            support.cvenhance@gmail.com
                        </a>
                        .
                    </p>
                </Section>
            </main>
        </>
    );
}
