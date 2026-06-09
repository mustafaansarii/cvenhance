import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import userService from '../services/user.service';

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            setLoading(true);
            try {
                const data = await userService.getProfile();
                setProfile(data);
            } catch (err) {
                const message =
                    err?.response?.data?.message ||
                    err?.message ||
                    'Unable to load your profile.';
                toast.error(message);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <div className="mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center justify-center px-4 pb-16 pt-24 lg:px-6 relative">
            <section className="w-full max-w-xl rounded-2xl border border-slate-200 bg-white p-7 shadow-lg">
                <h1 className="mb-1 text-lg font-semibold text-slate-900">
                    My profile
                </h1>
                <p className="mb-6 text-xs text-slate-500">
                    This information comes directly from your CareerHub account.
                </p>

                {loading && (
                    <p className="text-xs text-slate-500">Loading your profile…</p>
                )}

                {profile && !loading && (
                    <dl className="divide-y divide-slate-100 text-sm">
                        {[
                            { label: 'Full name', value: profile.fullName || '-' },
                            { label: 'Email', value: profile.email || '-' },
                            {
                                label: 'Role',
                                value: Array.isArray(profile.role) && profile.role.length > 0
                                    ? profile.role.join(', ')
                                    : '-',
                            },
                        ].map(({ label, value }) => (
                            <div key={label} className="flex items-center justify-between py-3">
                                <dt className="text-slate-500">{label}</dt>
                                <dd className="font-medium text-slate-900">{value}</dd>
                            </div>
                        ))}

                        <div className="flex items-center justify-between py-3">
                            <dt className="text-slate-500">Email verified</dt>
                            <dd>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${profile.verified
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    : 'bg-amber-50 text-amber-700 ring-amber-200'
                                    }`}>
                                    {profile.verified ? 'Verified' : 'Pending verification'}
                                </span>
                            </dd>
                        </div>

                        <div className="flex items-center justify-between py-3">
                            <dt className="text-slate-500">Account status</dt>
                            <dd>
                                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ${profile.active
                                    ? 'bg-emerald-50 text-emerald-700 ring-emerald-200'
                                    : 'bg-red-50 text-red-700 ring-red-200'
                                    }`}>
                                    {profile.active ? 'Active' : 'Disabled'}
                                </span>
                            </dd>
                        </div>
                    </dl>
                )}

                <DeleteAccountSection />
            </section>
        </div>
    );
}

function DeleteAccountSection() {
    const [confirming, setConfirming] = useState(false);
    const [deleting, setDeleting] = useState(false);

    const handleDelete = async () => {
        setDeleting(true);
        try {
            await userService.deleteAccount();
            localStorage.removeItem('isAuthenticated');
            toast.success('Account deleted successfully.');
            window.location.href = '/login';
        } catch (err) {
            const message =
                err?.response?.data?.message ||
                err?.message ||
                'Failed to delete account. Please try again.';
            toast.error(message);
            setDeleting(false);
            setConfirming(false);
        }
    };

    return (
        <div className="mt-8 border-t border-slate-100 pt-6">
            <h2 className="mb-1 text-sm font-semibold text-red-600">Danger Zone</h2>
            <p className="mb-4 text-xs text-slate-500">
                Permanently delete your account and all associated data. This cannot be undone.
            </p>

            {!confirming ? (
                <button
                    onClick={() => setConfirming(true)}
                    className="w-full rounded-xl border border-red-200 bg-red-50 px-4 py-2.5 text-sm font-medium text-red-600 transition hover:bg-red-100"
                >
                    Delete my account
                </button>
            ) : (
                <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm">
                    <p className="mb-3 font-medium text-red-700">
                        Are you sure? This will permanently delete your account.
                    </p>
                    <div className="flex gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={deleting}
                            className="flex-1 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white transition hover:bg-red-700 disabled:opacity-60"
                        >
                            {deleting ? 'Deleting…' : 'Yes, delete my account'}
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            disabled={deleting}
                            className="flex-1 rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50 disabled:opacity-60"
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
