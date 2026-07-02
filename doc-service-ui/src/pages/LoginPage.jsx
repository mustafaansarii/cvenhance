import AuthLayout from '../components/shared/AuthLayout';
import AuthLoginPage from '../components/AuthComp/LoginPage';
import GoogleOneTap from '../components/AuthComp/GoogleOneTap';
import InAppBrowserNotice from '../components/AuthComp/InAppBrowserNotice';

export default function LoginPage() {
    return (
        <AuthLayout
            breadcrumb="Login"
            badge="Welcome back"
            title={<span className="font-serif">Sign in to <span className="italic text-accent">CVEnhance</span></span>}
            description="Access your personalized dashboard, saved roles, and application pipeline. Continue where you left off."
            features={[
                'Track applications across companies in one place',
                'Receive tailored recommendations each time you sign in',
                'Keep your profile synced with the latest opportunities',
            ]}
        >
            <GoogleOneTap />
            <InAppBrowserNotice />
            <AuthLoginPage />
        </AuthLayout>
    );
}