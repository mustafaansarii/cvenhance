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

export default function RefundPolicyPage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Legal"
                    title="Cancellation & Refund Policy"
                    description="How cancellations and refunds work for purchases on CVEnhance."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm text-muted-foreground">Last updated on 4 September 2026</p>

                <p className="mt-6 text-sm leading-relaxed text-muted-foreground">
                    CVEnhance provides a digital resume- and document-building service. Plans are one-time
                    purchases that unlock resume download credits and are valid for one year. Because the
                    service is digital and delivered instantly, the following cancellation and refund terms
                    apply.
                </p>

                {/* ── Refund Eligibility ── */}
                <Section title="1. Refund Eligibility">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-border text-left">
                                    <th className="pb-2 pr-4 font-semibold text-foreground">Scenario</th>
                                    <th className="pb-2 pr-4 font-semibold text-foreground">Eligible?</th>
                                    <th className="pb-2 font-semibold text-foreground">Refund Type</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-border">
                                <tr>
                                    <td className="py-3 pr-4">Plan purchased but no download credits used</td>
                                    <td className="py-3 pr-4 font-semibold text-green-600">Yes</td>
                                    <td className="py-3">Full refund</td>
                                </tr>
                                <tr>
                                    <td className="py-3 pr-4">Payment charged but plan/credits not activated</td>
                                    <td className="py-3 pr-4 font-semibold text-green-600">Yes</td>
                                    <td className="py-3">Full refund or plan restoration</td>
                                </tr>
                                <tr>
                                    <td className="py-3 pr-4">Duplicate or accidental charge</td>
                                    <td className="py-3 pr-4 font-semibold text-green-600">Yes</td>
                                    <td className="py-3">Full refund of duplicate amount</td>
                                </tr>
                                <tr>
                                    <td className="py-3 pr-4">Credits partially used</td>
                                    <td className="py-3 pr-4 font-semibold text-accent">Case-by-case</td>
                                    <td className="py-3">Proportional refund for unused credits</td>
                                </tr>
                                <tr>
                                    <td className="py-3 pr-4">All download credits used</td>
                                    <td className="py-3 pr-4 font-semibold text-red-500">No</td>
                                    <td className="py-3">Not eligible — service fully delivered</td>
                                </tr>
                                <tr>
                                    <td className="py-3 pr-4">Plan expired (1-year validity)</td>
                                    <td className="py-3 pr-4 font-semibold text-red-500">No</td>
                                    <td className="py-3">Not eligible</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                </Section>

                {/* ── Cancellation ── */}
                <Section title="2. Cancellations">
                    <ul className="space-y-4">
                        <Clause>
                            A plan can be cancelled before any download credit has been used. Once you have used
                            a credit to unlock or download a resume, that purchase is considered partially or
                            fully fulfilled.
                        </Clause>
                        <Clause>
                            Since plans are one-time purchases (not recurring subscriptions), there is no
                            auto-renewal to cancel. No future charges will occur after your initial purchase.
                        </Clause>
                    </ul>
                </Section>

                {/* ── Refund Process ── */}
                <Section title="3. How to Request a Refund">
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Step 1:</strong> Contact us through the{' '}
                            <a href="/contact-us" className="font-semibold text-accent hover:underline">
                                Contact Us
                            </a>{' '}
                            page or email us at{' '}
                            <a
                                href="mailto:support.cvenhance@gmail.com"
                                className="font-semibold text-accent hover:underline"
                            >
                                support.cvenhance@gmail.com
                            </a>{' '}
                            with your registered email address and a description of the issue.
                        </Clause>
                        <Clause>
                            <strong>Step 2:</strong> We will verify your purchase and credit usage within
                            2 business days and notify you of the outcome.
                        </Clause>
                        <Clause>
                            <strong>Step 3:</strong> Approved refunds are returned to your original payment
                            method within <strong>5–7 business days</strong>, depending on your bank or payment
                            provider. The exact timeline may vary by payment method (UPI, card, net banking).
                        </Clause>
                    </ul>
                </Section>

                {/* ── Exceptions ── */}
                <Section title="4. Exceptions & Special Cases">
                    <ul className="space-y-4">
                        <Clause>
                            <strong>Service outage or technical failure.</strong> If a confirmed technical issue
                            on our end prevented you from using your credits, we will either extend your plan
                            validity or issue a refund at our discretion.
                        </Clause>
                        <Clause>
                            <strong>Promotional or discounted purchases.</strong> Refund amounts for discounted
                            plans will be based on the actual amount paid, not the original price.
                        </Clause>
                        <Clause>
                            <strong>Chargebacks.</strong> If you initiate a chargeback through your bank without
                            first contacting us, your account may be suspended pending resolution.
                        </Clause>
                    </ul>
                </Section>

                {/* ── Contact ── */}
                <Section title="5. Contact Us">
                    <p>
                        For any billing issue, refund request, or payment-related question, reach us through the{' '}
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
                        . We aim to respond within 2 business days.
                    </p>
                </Section>
            </main>
        </>
    );
}
