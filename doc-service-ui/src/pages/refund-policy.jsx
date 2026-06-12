import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

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
                    description="How cancellations and refunds are handled for purchases on NextCV."
                />
            </div>

            <main className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
                <p className="text-sm text-slate-400">Last updated on 13-06-2026</p>

                <p className="mt-6 text-sm leading-relaxed text-slate-700">
                    MUSTAFA ANSARI believes in helping its customers as far as possible, and has therefore a
                    liberal cancellation policy. Under this policy:
                </p>

                <ul className="mt-4 space-y-4 text-sm leading-relaxed text-slate-700">
                    <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                        <span>
                            Cancellations will be considered only if the request is made immediately after placing
                            the order. However, the cancellation request may not be entertained if the orders have
                            been communicated to the vendors/merchants and they have initiated the process of
                            shipping them.
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                        <span>
                            MUSTAFA ANSARI does not accept cancellation requests for perishable items like flowers,
                            eatables etc. However, refund/replacement can be made if the customer establishes that
                            the quality of product delivered is not good.
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                        <span>
                            In case of receipt of damaged or defective items please report the same to our Customer
                            Service team. The request will, however, be entertained once the merchant has checked and
                            determined the same at his own end. This should be reported within Only same day days of
                            receipt of the products. In case you feel that the product received is not as shown on the
                            site or as per your expectations, you must bring it to the notice of our customer service
                            within Only same day days of receiving the product. The Customer Service Team after
                            looking into your complaint will take an appropriate decision.
                        </span>
                    </li>
                    <li className="flex gap-3">
                        <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal-500" />
                        <span>
                            In case of complaints regarding products that come with a warranty from manufacturers,
                            please refer the issue to them. In case of any Refunds approved by the MUSTAFA ANSARI,
                            it&rsquo;ll take 1-2 Days days for the refund to be processed to the end customer.
                        </span>
                    </li>
                </ul>
            </main>
        </>
    );
}
