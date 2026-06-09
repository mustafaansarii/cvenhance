import React from 'react'
import Navbar from '../components/navbar/Navbar';
import PricingFeture from '../components/pricing/pricing-feture';
import PageHero from '../components/shared/PageHero';

function Pricing() {
  return (
    <>
      <div
        className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50 dark:border-white/50"
        style={{ backgroundImage: "url('/assest/home_page.png')" }}
      >
        <Navbar />
        <PageHero
          breadcrumb="Pricing"
          title="We offer a variety of pricing plans to suit your needs."
          description="Start for free and upgrade whenever you're ready. Transparent pricing, no hidden fees—just what you need to grow."
        />
      </div>
      <PricingFeture />
    </>
  );
}

export default Pricing;