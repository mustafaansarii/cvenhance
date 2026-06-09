import ContactUs from '../components/contact/contact-us';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';

function ContactUsPage() {
  return (
    <>
      <div
        className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50 dark:border-white/50"
        style={{ backgroundImage: "url('/assest/home_page.png')" }}
      >
        <Navbar />
        <PageHero
          breadcrumb="Contact"
          title="Contact Us"
          description="We are here to help you. Please reach out if you have any questions or want to get in touch with our team."
        />
      </div>
      <ContactUs />
    </>
  )
}

export default ContactUsPage