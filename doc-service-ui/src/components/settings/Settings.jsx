import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';

function Card({ title, description, children }) {
    return (
        <div className="rounded-3xl border border-border bg-card p-6 sm:p-7">
            <h4 className="text-base font-bold text-foreground">{title}</h4>
            {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
            <div className="mt-5">{children}</div>
        </div>
    );
}

function Field({ label, ...props }) {
    return (
        <label className="block">
            <span className="block text-xs font-medium text-muted-foreground">{label}</span>
            <input
                {...props}
                className="mt-1.5 w-full rounded-xl border border-border bg-card px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:border-accent focus:outline-none focus:ring-2 focus:ring-accent/40"
            />
        </label>
    );
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-border py-3 last:border-b-0">
            <div>
                <p className="text-sm font-medium text-foreground">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-accent' : 'bg-muted'}`}
                aria-pressed={checked}
            >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
            </button>
        </div>
    );
}

const sessions = [
    { device: 'Chrome · macOS', location: 'Mumbai, IN', current: true },
    { device: 'Safari · iPhone', location: 'Mumbai, IN', current: false },
    { device: 'Edge · Windows', location: 'Pune, IN', current: false },
];

export default function Settings() {
    const [prefs, setPrefs] = useState({ product: true, jobs: true, weekly: false });

    return (
        <section className="w-full pt-12 pb-20">
            <SectionHeader
                eyebrow="Account"
                title="Settings"
                description="Manage your profile, security, notifications, and signed-in devices."
            />

            <div className="mx-auto grid max-w-3xl grid-cols-1 gap-5 px-4">
                <Card title="Profile" description="This information appears on your resume exports and profile.">
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                        <Field label="Full name" defaultValue="" placeholder="Your name" />
                        <Field label="Email" type="email" defaultValue="" placeholder="you@example.com" />
                        <Field label="Headline" placeholder="e.g. CS undergrad · aspiring SDE" />
                        <Field label="Location" placeholder="City, Country" />
                    </div>
                    <div className="mt-5 flex justify-end">
                        <button type="button" className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">
                            Save changes
                        </button>
                    </div>
                </Card>

                <Card title="Password" description="Use a strong password you don’t reuse elsewhere.">
                    <div className="grid grid-cols-1 gap-4">
                        <Field label="Current password" type="password" placeholder="••••••••" />
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                            <Field label="New password" type="password" placeholder="••••••••" />
                            <Field label="Confirm new password" type="password" placeholder="••••••••" />
                        </div>
                    </div>
                    <div className="mt-5 flex justify-end">
                        <button type="button" className="rounded-md bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground transition hover:bg-accent-hover">
                            Update password
                        </button>
                    </div>
                </Card>

                <Card title="Notifications" description="Choose what we email you about.">
                    <Toggle label="Product updates" description="New features and improvements." checked={prefs.product} onChange={() => setPrefs((p) => ({ ...p, product: !p.product }))} />
                    <Toggle label="Job & internship alerts" description="Roles matched to your profile." checked={prefs.jobs} onChange={() => setPrefs((p) => ({ ...p, jobs: !p.jobs }))} />
                    <Toggle label="Weekly progress digest" description="A summary of your learning streak." checked={prefs.weekly} onChange={() => setPrefs((p) => ({ ...p, weekly: !p.weekly }))} />
                </Card>

                <Card title="Active sessions" description="Devices currently signed in to your account.">
                    <div className="space-y-3">
                        {sessions.map((s) => (
                            <div key={s.device} className="flex items-center justify-between gap-4 rounded-xl border border-border px-4 py-3">
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 text-sm font-medium text-foreground">
                                        {s.device}
                                        {s.current && (
                                            <span className="rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                                                This device
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{s.location}</p>
                                </div>
                                {!s.current && (
                                    <button type="button" className="shrink-0 rounded-md border border-border px-3 py-1.5 text-xs font-semibold text-muted-foreground transition hover:bg-muted">
                                        Sign out
                                    </button>
                                )}
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Danger zone" description="Permanently delete your account and all data.">
                    <button type="button" className="rounded-md border border-rose-300 px-4 py-2.5 text-sm font-semibold text-rose-600 transition hover:bg-rose-50 dark:border-rose-500/40 dark:text-rose-400 dark:hover:bg-rose-500/10">
                        Delete account
                    </button>
                </Card>
            </div>
        </section>
    );
}
