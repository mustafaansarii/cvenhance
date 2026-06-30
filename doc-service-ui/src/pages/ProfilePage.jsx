import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Navbar from '../components/navbar/Navbar';
import PageHero from '../components/shared/PageHero';
import ProfileDetailsForm from '../components/profile/ProfileDetailsForm';
import ResumeUploadButton from '../components/profile/ResumeUploadButton';
import userService from '../services/user.service';
import paymentService, { PLAN_CREDITS } from '../services/payment.service';

function initialsOf(profile) {
    const base = (profile?.fullName || profile?.email || '?').trim();
    const parts = base.split(/[\s@.]+/).filter(Boolean);
    return (parts[0]?.[0] || '?').concat(parts[1]?.[0] || '').toUpperCase();
}

export default function ProfilePage() {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [entitlement, setEntitlement] = useState(null);

    useEffect(() => {
        (async () => {
            setLoading(true);
            try {
                setProfile(await userService.getProfile());
            } catch (err) {
                toast.error(err?.response?.data?.message || err?.message || 'Unable to load your profile.');
            } finally {
                setLoading(false);
            }
        })();
        paymentService.getEntitlement().then(setEntitlement).catch(() => {});
    }, []);

    const saveDetails = async (data) => {
        try {
            const updated = await userService.updateProfile(data);
            setProfile(updated);
            setEditing(false);
            toast.success('Details saved');
        } catch (err) {
            toast.error(err?.response?.data?.message || 'Failed to save details');
        }
    };

    const details = profile?.profileData || null;

    return (
        <>
            <div
                className="relative w-full overflow-hidden bg-top bg-no-repeat home-page-hero-bg border-b border-black/50"
                style={{ backgroundImage: "url('/assest/home_page.png')" }}
            >
                <Navbar />
                <PageHero
                    breadcrumb="My Account"
                    title="My Profile"
                    description="Manage your account and the resume details we reuse to pre-fill the builder."
                />
            </div>

            <div>
                <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
                    {loading ? (
                        <div className="space-y-6">
                            <div className="h-28 animate-pulse border border-border bg-muted" />
                            <div className="h-72 animate-pulse border border-border bg-muted" />
                        </div>
                    ) : profile ? (
                        <div className="space-y-6">

                            <section className="border border-border bg-card p-6 sm:p-8">
                                <div className="flex flex-wrap items-center justify-between gap-4">
                                    <div className="flex items-center gap-4">
                                        <div className="flex h-16 w-16 shrink-0 items-center justify-center border border-border text-xl font-bold text-muted-foreground">
                                            {initialsOf(profile)}
                                        </div>
                                        <div className="min-w-0">
                                            <h1 className="truncate font-serif text-2xl font-bold text-foreground">{profile.fullName || 'Your name'}</h1>
                                            <p className="truncate text-sm text-muted-foreground">{profile.email || '—'}</p>
                                        </div>
                                    </div>
                                    <CreditsBadge entitlement={entitlement} />
                                </div>
                            </section>

                            <section className="border border-border bg-card p-6 sm:p-8">
                                <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
                                    <div>
                                        <h2 className="text-base font-bold text-foreground">Resume details</h2>
                                        <p className="mt-0.5 text-sm text-muted-foreground">Saved to your account and used to pre-fill the resume builder.</p>
                                    </div>
                                    {!editing && (
                                        <div className="flex shrink-0 flex-wrap items-center justify-end gap-2">
                                            <ResumeUploadButton
                                                confirm={details ? "We'll read your uploaded file and automatically fill in your details for you. This replaces your current details." : null}
                                                onDone={(p) => { setProfile((prev) => ({ ...prev, profileData: p })); setEditing(false); }}
                                            />
                                            <button onClick={() => setEditing(true)} className="border border-slate-900 bg-slate-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">
                                                {details ? 'Edit details' : 'Add details'}
                                            </button>
                                        </div>
                                    )}
                                </div>

                                {editing ? (
                                    <ProfileDetailsForm initial={details} onCancel={() => setEditing(false)} onSave={saveDetails} />
                                ) : details && Object.keys(details).length ? (
                                    <DetailsSummary d={details} />
                                ) : (
                                    <EmptyDetails onAdd={() => setEditing(true)} />
                                )}
                            </section>
                        </div>
                    ) : (
                        <div className="border border-border bg-card p-10 text-center text-sm text-muted-foreground">
                            Unable to load your profile. Please refresh the page.
                        </div>
                    )}
                </main>
            </div>
        </>
    );
}

function EmptyDetails({ onAdd }) {
    return (
        <div className="flex flex-col items-center justify-center gap-3 border border-dashed border-border py-12 text-center">
            <p className="text-sm text-muted-foreground">No resume details yet — add your experience, education and skills once and reuse them everywhere.</p>
            <button onClick={onAdd} className="border border-slate-900 bg-slate-900 px-5 py-2 text-sm font-semibold text-white transition hover:bg-slate-700">Add details</button>
        </div>
    );
}

function CreditsBadge({ entitlement }) {
    if (!entitlement) return null;

    if (entitlement.unlimited) {
        return (
            <div className="border border-border bg-accent/10 px-4 py-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide text-accent">Downloads</p>
                <p className="text-lg font-extrabold text-accent">Unlimited</p>
                <p className="text-[11px] text-accent">{entitlement.plan} plan</p>
            </div>
        );
    }

    if (entitlement.active) {
        const total = PLAN_CREDITS[entitlement.plan];
        const remaining = Math.max(0, entitlement.creditsRemaining ?? 0);
        return (
            <div className="border border-border bg-muted px-4 py-3 text-center">
                <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Downloads left</p>
                <p className="text-lg font-extrabold text-foreground">
                    {remaining} <span className="text-muted-foreground">/ {Number.isFinite(total) ? total : '∞'}</span>
                </p>
                <p className="text-[11px] text-muted-foreground">{entitlement.plan} plan</p>
            </div>
        );
    }

    return (
        <div className="border border-border bg-muted px-4 py-3 text-center">
            <p className="text-[11px] font-bold uppercase tracking-wide text-muted-foreground">Plan</p>
            <p className="text-lg font-extrabold text-foreground">Free</p>
            <a href="/pricing" className="text-[11px] font-semibold text-accent hover:underline">See plans →</a>
        </div>
    );
}

function DetailsSummary({ d }) {
    const contact = [
        ['Location', d.location], ['Phone', d.phone], ['Email', d.email],
        ['LinkedIn', d.linkedin || d.linkedinUrl], ['GitHub', d.github || d.githubUrl],
    ].filter(([, v]) => v);

    const counts = [
        ['Experience', d.experience?.length], ['Projects', d.projects?.length],
        ['Education', d.education?.length], ['Skills', d.skills?.length],
        ['Achievements', d.achievements?.length],
    ].filter(([, n]) => n);

    return (
        <div className="space-y-6">
            {contact.length > 0 && (
                <div className="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
                    {contact.map(([k, v]) => (
                        <div key={k} className="flex items-center justify-between gap-3 border-b border-border py-1.5 text-sm">
                            <span className="text-muted-foreground">{k}</span>
                            <span className="truncate text-right font-medium text-foreground">{v}</span>
                        </div>
                    ))}
                </div>
            )}

            {counts.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-1">
                    {counts.map(([k, n]) => (
                        <span key={k} className="border border-border px-3 py-1 text-xs font-medium text-muted-foreground">
                            {k}: {n}
                        </span>
                    ))}
                </div>
            )}

            <p className="text-xs text-muted-foreground">Click <span className="font-semibold text-foreground">Edit details</span> to view and update everything.</p>
        </div>
    );
}
