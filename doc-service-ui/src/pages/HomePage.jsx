import Hero from '../components/homePage/Hero';
import Navbar from '../components/navbar/Navbar';

function HomePage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50 dark:border-white/50"
                style={{
                    backgroundImage: "url('/assest/home_page.png')",
                }}
            >
                <Navbar />
                <Hero />
            </div>
        </>
    )
}

export default HomePage;
