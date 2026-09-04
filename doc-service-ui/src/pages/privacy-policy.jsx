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
                <p className="text-sm text-muted-foreground">Last updated on 4 September 2026</p>

                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    CVEnhance (&ldquo;we&rdquo;, &ldquo;us&rdquo;, &ldquo;our&rdquo;) is an online resume and
                    document builder available at{' '}
                    <a href="https://www.cvenhance.in" className="font-semibold text-accent hover:underline">
                        www.cvenhance.in
                    </a>
                    . This Privacy Policy explains what data we collect, why we collect it, how we use and share
                    it, how we protect it, and what rights you have over your personal information. It applies to
                    all users of CVEnhance and specifically documents how we handle data obtained through Google
                    sign-in.
                </p>

                {/* ── 1. Data We Collect ── */}
                <Section title="1. Data We Collect">
                    <p className="font-semibold text-foreground">Information you provide directly:</p>
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Account information.</strong> When you sign up with email, we collect your
                            full name, email address, and a password (stored only as a salted BCrypt hash — we
                            never store your password in plain text).
                        </Clause>
                        <Clause>
                            <strong>Resume and profile content.</strong> Details you enter to build your resume —
                            including your name, phone number, location, work experience, education, skills,
                            projects, achievements, and any optional profile photo or resume file you upload for
                            import.
                        </Clause>
                        <Clause>
                            <strong>Payment information.</strong> When you purchase a plan, payments are processed
                            securely by our payment partner, Cashfree Payments. We store only transaction
                            references (order ID, status). We do <strong>not</strong> store your card number,
                            CVV, bank account, or UPI details on our servers.
                        </Clause>
                    </ul>

                    <p className="mt-6 font-semibold text-foreground">Information from third-party sign-in:</p>
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Google Sign-In.</strong> When you sign in with Google, we request the{' '}
                            <em>email</em> and <em>profile</em> scopes and receive your name, email address, and
                            Google profile identifier. We do <strong>not</strong> request access to Gmail, Google
                            Drive, Contacts, Calendar, or any other Google service.
                        </Clause>
                        <Clause>
                            <strong>GitHub Sign-In.</strong> If you sign in with GitHub, we receive your name,
                            public profile, and primary email address from GitHub.
                        </Clause>
                    </ul>

                    <p className="mt-6 font-semibold text-foreground">Information collected automatically:</p>
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Device and usage data.</strong> We collect your IP address, browser type
                            (user agent), and session timestamps for security monitoring, rate limiting, and
                            audit logging.
                        </Clause>
                        <Clause>
                            <strong>Cookies.</strong> We use essential cookies to keep you signed in (an
                            HTTP-only, secure authentication cookie). We do not use advertising or tracking
                            cookies.
                        </Clause>
                    </ul>
                </Section>

                {/* ── 2. How We Use Your Data ── */}
                <Section title="2. How We Use Your Data">
                    <ul className="space-y-4">
                        <Clause>To create and authenticate your account and keep you signed in securely.</Clause>
                        <Clause>To display your name and email in your profile and pre-fill your resume fields.</Clause>
                        <Clause>To generate, save, and let you download the resumes and documents you build.</Clause>
                        <Clause>
                            To provide optional AI-assisted features (e.g., importing an uploaded resume,
                            improving resume text, resume quality analysis) when you explicitly use them.
                        </Clause>
                        <Clause>To process purchases, allocate credits, and provide customer support.</Clause>
                        <Clause>To monitor for unauthorized access, enforce rate limits, and maintain an audit trail for security purposes.</Clause>
                        <Clause>
                            We do <strong>not</strong> use Google user data for advertising, profiling, or any
                            purpose unrelated to operating CVEnhance. We do <strong>not</strong> sell your data
                            to anyone.
                        </Clause>
                    </ul>
                </Section>

                {/* ── 3. How We Share Your Data ── */}
                <Section title="3. How We Share Your Data">
                    <p>
                        We do not sell, rent, or trade your personal data. We share the minimum data necessary
                        with the following service providers strictly to operate CVEnhance:
                    </p>
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Cashfree Payments</strong> — to securely process payments and verify
                            transaction status.
                        </Clause>
                        <Clause>
                            <strong>AWS S3 / Supabase</strong> — to securely store generated resume PDF files
                            and uploaded documents.
                        </Clause>
                        <Clause>
                            <strong>Resend</strong> — to send transactional emails such as OTP verification
                            codes. Only your email address is shared.
                        </Clause>
                        <Clause>
                            <strong>Google Gemini / OpenAI</strong> — only the specific resume text you choose to
                            process with AI features is sent for that request. Your data is not used to train
                            third-party AI models.
                        </Clause>
                        <Clause>
                            <strong>Upstash Redis</strong> — for caching and rate limiting. Only anonymised
                            identifiers are stored, not personal content.
                        </Clause>
                    </ul>
                    <p>
                        We may also disclose data if required by applicable law, regulation, or court order.
                    </p>
                    <p>
                        CVEnhance&apos;s use and transfer of information received from Google APIs adheres to the{' '}
                        <a
                            href="https://developers.google.com/terms/api-services-user-data-policy"
                            className="font-semibold text-accent hover:underline"
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            Google API Services User Data Policy
                        </a>
                        , including the Limited Use requirements.
                    </p>
                </Section>

                {/* ── 4. How We Store and Protect Your Data ── */}
                <Section title="4. How We Store and Protect Your Data">
                    <p>
                        We take the security of your personal information seriously and employ multiple layers of
                        protection:
                    </p>
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Encryption at rest.</strong> Sensitive profile and resume data is encrypted
                            using <strong>AES-256-GCM</strong> (Advanced Encryption Standard with 256-bit keys
                            and Galois/Counter Mode) before it is written to our database. Even if the database
                            were compromised, your personal data remains unreadable without the encryption key.
                        </Clause>
                        <Clause>
                            <strong>Encryption in transit.</strong> All traffic between your browser and our
                            servers is encrypted over HTTPS/TLS. API communication between internal services is
                            also encrypted.
                        </Clause>
                        <Clause>
                            <strong>Password hashing.</strong> Passwords are stored only as salted BCrypt hashes
                            — we never store, log, or transmit your password in plain text.
                        </Clause>
                        <Clause>
                            <strong>OTP security.</strong> One-time verification codes are BCrypt-hashed, expire
                            within 5 minutes, and are locked after 5 failed attempts.
                        </Clause>
                        <Clause>
                            <strong>Secure authentication.</strong> JWT access tokens are signed with HMAC-SHA256,
                            stored in HTTP-only cookies (inaccessible to JavaScript), and expire after 1 hour.
                            Sessions are revocable and tracked server-side.
                        </Clause>
                        <Clause>
                            <strong>Payment security.</strong> Payment webhooks are verified using HMAC-SHA256
                            signatures. We never receive or store your card or banking details.
                        </Clause>
                        <Clause>
                            <strong>Access control.</strong> Access to production systems, databases, and secrets
                            is restricted to authorised personnel. All authentication events are audit-logged.
                        </Clause>
                    </ul>
                </Section>

                {/* ── 5. Your Rights ── */}
                <Section title="5. Your Rights">
                    <p>You have the following rights regarding your personal data:</p>
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Access.</strong> You can view and download your profile and resume data at any
                            time through your CVEnhance account.
                        </Clause>
                        <Clause>
                            <strong>Correction.</strong> You can update or correct your personal information
                            directly in your profile or resume editor.
                        </Clause>
                        <Clause>
                            <strong>Deletion.</strong> You can request complete deletion of your account and all
                            associated personal data (including data received from Google) by contacting us.
                        </Clause>
                        <Clause>
                            <strong>Portability.</strong> You can export your resume data as a PDF at any time.
                        </Clause>
                        <Clause>
                            <strong>Withdraw consent.</strong> You can revoke Google or GitHub sign-in access
                            through your respective account settings. You can decline non-essential cookies via
                            our consent banner.
                        </Clause>
                    </ul>
                </Section>

                {/* ── 6. Data Retention and Deletion ── */}
                <Section title="6. Data Retention and Deletion">
                    <ul className="space-y-4">
                        <Clause>
                            We retain your account and resume data for as long as your account is active so you
                            can return to your saved documents.
                        </Clause>
                        <Clause>
                            Payment transaction records are retained for up to 7 years as required by applicable
                            tax and financial regulations.
                        </Clause>
                        <Clause>
                            Security audit logs (IP address, user agent, login events) are retained for up to
                            90 days and then automatically purged.
                        </Clause>
                        <Clause>
                            You can request deletion of your account and all associated personal data at any time
                            by contacting us through the{' '}
                            <a href="/contact-us" className="font-semibold text-accent hover:underline">
                                Contact Us
                            </a>{' '}
                            page or by emailing{' '}
                            <a
                                href="mailto:support.cvenhance@gmail.com"
                                className="font-semibold text-accent hover:underline"
                            >
                                support.cvenhance@gmail.com
                            </a>
                            .
                        </Clause>
                        <Clause>
                            We process verified deletion requests within 30 days and remove your data from our
                            active systems and backups on the next backup cycle.
                        </Clause>
                    </ul>
                </Section>

                {/* ── 7. Children's Privacy ── */}
                <Section title="7. Children&apos;s Privacy">
                    <p>
                        CVEnhance is not directed at children under the age of 13. We do not knowingly collect
                        personal information from children under 13. If you believe we have inadvertently
                        collected such data, please contact us immediately and we will delete it.
                    </p>
                </Section>

                {/* ── 8. Changes to This Policy ── */}
                <Section title="8. Changes to This Policy">
                    <p>
                        We may update this Privacy Policy from time to time to reflect changes in our practices,
                        technology, or legal requirements. When we make material changes, we will update the
                        &ldquo;Last updated&rdquo; date at the top of this page and, where appropriate, notify
                        you via email or a banner within the application. Your continued use of CVEnhance after
                        such changes constitutes acceptance of the updated policy.
                    </p>
                </Section>

                {/* ── 9. Contact Us ── */}
                <Section title="9. Contact Us">
                    <p>
                        For any privacy-related question, data access request, or deletion request, reach us via
                        the{' '}
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
