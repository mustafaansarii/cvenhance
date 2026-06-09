import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import Settings from '../components/settings/Settings';

export default function SettingsPage() {
    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50 dark:border-white/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="Settings"
                    title="Account settings"
                    description="Manage your profile, password, notifications, and active devices — all in one place."
                />
            </div>
            <Settings />
        </>
    );
}
