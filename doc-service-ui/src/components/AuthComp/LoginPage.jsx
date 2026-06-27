import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import OAuthButtons from './OAuthButtons';

const inputClass =
    'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';

export default function AuthLoginPage() {
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await authService.signin(email, password);
            toast.success('Signed in successfully');
            navigate('/');
        } catch (err) {
            const message =
                err?.response?.data?.message || err?.message || 'Unable to sign in. Please try again.';
            toast.error(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-sm">
            <h2 className="mb-1 text-xl font-semibold text-foreground">Sign in</h2>
            <p className="mb-6 text-xs text-muted-foreground">
                Use your email and password to continue.
            </p>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="email" className="block text-xs font-medium text-muted-foreground">Email</label>
                    <input id="email" type="email" required autoComplete="email" value={email}
                        onChange={(event) => setEmail(event.target.value)} className={inputClass} placeholder="you@example.com" />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="password" className="block text-xs font-medium text-muted-foreground">Password</label>
                    <input id="password" type="password" required autoComplete="current-password" value={password}
                        onChange={(event) => setPassword(event.target.value)} className={inputClass} placeholder="Enter your password" />
                </div>

                <button type="submit" disabled={loading}
                    className="flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60">
                    {loading ? 'Signing you in…' : 'Sign in'}
                </button>
            </form>

            <OAuthButtons />

            <p className="mt-5 text-center text-[11px] text-muted-foreground">
                New to CVEnhance?{' '}
                <button type="button" className="font-semibold text-accent hover:text-accent-hover" onClick={() => navigate('/signup')}>
                    Create an account
                </button>
            </p>
        </div>
    );
}
