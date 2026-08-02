import Hero from '../components/homePage/Hero';
import Navbar from '../components/navbar/Navbar';
import HomeSections from '../components/homePage/HomeSections';
import WhatsAppFab from '../components/shared/WhatsAppFab';

function HomePage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-white"
                style={{
                    backgroundImage: "url('/assest/home_page.png')",
                }}
            >
                <Navbar />
                <Hero />
            </div>
            <HomeSections />
            <WhatsAppFab />
        </>
    )
}

export default HomePage;
