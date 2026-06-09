import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import Templates from '../components/DocTemplate/Templates';

export default function DocTemplates() {
    return (
        <>

            <div className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50 dark:border-white/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}>
                <Navbar />
                <PageHero
                    breadcrumb="Document Templates"
                    title="Document Templates"
                    description="Browse, preview, and download professional templates for every need."
                />
            </div>
            <Templates />
        </>
    );
}