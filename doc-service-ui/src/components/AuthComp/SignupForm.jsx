import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import authService from '../../services/auth.service';
import OAuthButtons from './OAuthButtons';

const inputClass =
    'w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40';

const buttonClass =
    'flex w-full items-center justify-center rounded-xl bg-accent px-4 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition hover:bg-accent-hover disabled:cursor-not-allowed disabled:opacity-60';

export default function SignupForm() {
    const navigate = useNavigate();
    const [step, setStep] = useState('details');
    const [fullName, setFullName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);

    const errorMessage = (err, fallback) =>
        err?.response?.data?.message || err?.message || fallback;

    const submitDetails = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            const { message } = await authService.signup(fullName, email, password);
            toast.success(message || `OTP sent to ${email}`);
            setStep('otp');
        } catch (err) {
            toast.error(errorMessage(err, 'Unable to start signup. Please try again.'));
        } finally {
            setLoading(false);
        }
    };

    const submitOtp = async (event) => {
        event.preventDefault();
        setLoading(true);
        try {
            await authService.register(fullName, email, password, otp);
            toast.success('Email verified! Please sign in.');
            setTimeout(() => navigate('/login'), 1000);
        } catch (err) {
            toast.error(errorMessage(err, 'Verification failed. Please check the code and try again.'));
        } finally {
            setLoading(false);
        }
    };

    const resendOtp = async () => {
        setLoading(true);
        try {
            await authService.signup(fullName, email, password);
            toast.success('A new code is on its way.');
        } catch (err) {
            toast.error(errorMessage(err, 'Could not resend the code.'));
        } finally {
            setLoading(false);
        }
    };

    if (step === 'otp') {
        return (
            <div className="w-full max-w-sm">
                <h2 className="mb-1 text-xl font-semibold text-foreground">Verify your email</h2>
                <p className="mb-6 text-xs text-muted-foreground">
                    Enter the 6-digit code we sent to <span className="font-medium">{email}</span>. It expires in 5 minutes.
                </p>

                <form onSubmit={submitOtp} className="space-y-4">
                    <div className="space-y-1.5">
                        <label htmlFor="otp" className="block text-xs font-medium text-muted-foreground">
                            Verification code
                        </label>
                        <input
                            id="otp"
                            type="text"
                            inputMode="numeric"
                            maxLength={6}
                            required
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                            className={`${inputClass} text-center tracking-[0.5em]`}
                            placeholder="••••••"
                        />
                    </div>

                    <button type="submit" disabled={loading} className={buttonClass}>
                        {loading ? 'Verifying…' : 'Verify & create account'}
                    </button>
                </form>

                <div className="mt-5 flex items-center justify-between text-[11px] text-muted-foreground">
                    <button type="button" className="font-semibold text-accent hover:text-accent-hover"
                        onClick={() => setStep('details')}>
                        ← Edit details
                    </button>
                    <button type="button" disabled={loading}
                        className="font-semibold text-accent hover:text-accent-hover disabled:opacity-60"
                        onClick={resendOtp}>
                        Resend code
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="w-full max-w-sm">
            <h2 className="mb-1 text-xl font-semibold text-foreground">Create your account</h2>
            <p className="mb-6 text-xs text-muted-foreground">
                We'll email you a 6-digit code to verify your address.
            </p>

            <form onSubmit={submitDetails} className="space-y-4">
                <div className="space-y-1.5">
                    <label htmlFor="fullName" className="block text-xs font-medium text-muted-foreground">Full name</label>
                    <input id="fullName" type="text" required autoComplete="name" value={fullName}
                        onChange={(e) => setFullName(e.target.value)} className={inputClass} placeholder="Alex Johnson" />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="signup-email" className="block text-xs font-medium text-muted-foreground">Email</label>
                    <input id="signup-email" type="email" required autoComplete="email" value={email}
                        onChange={(e) => setEmail(e.target.value)} className={inputClass} placeholder="you@example.com" />
                </div>

                <div className="space-y-1.5">
                    <label htmlFor="signup-password" className="block text-xs font-medium text-muted-foreground">Password</label>
                    <input id="signup-password" type="password" required autoComplete="new-password" value={password}
                        onChange={(e) => setPassword(e.target.value)} className={inputClass} placeholder="At least 6 characters" />
                </div>

                <button type="submit" disabled={loading} className={buttonClass}>
                    {loading ? 'Sending code…' : 'Continue'}
                </button>
            </form>

            <OAuthButtons />

            <p className="mt-5 text-center text-[11px] text-muted-foreground">
                Already have an account?{' '}
                <button type="button" className="font-semibold text-accent hover:text-accent-hover" onClick={() => navigate('/login')}>
                    Sign in
                </button>
            </p>
        </div>
    );
}
