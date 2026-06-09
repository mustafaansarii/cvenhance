import { useState } from 'react';
import SectionHeader from '../shared/SectionHeader';

function Card({ title, description, children }) {
    return (
        <div className="rounded-3xl border border-black/10 bg-white p-6 dark:border-white/10 dark:bg-[#0b0b0b] sm:p-7">
            <h4 className="text-base font-bold text-slate-900 dark:text-white">{title}</h4>
            {description && <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">{description}</p>}
            <div className="mt-5">{children}</div>
        </div>
    );
}

function Field({ label, ...props }) {
    return (
        <label className="block">
            <span className="block text-xs font-medium text-slate-700 dark:text-slate-300">{label}</span>
            <input
                {...props}
                className="mt-1.5 w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-teal-400 focus:outline-none focus:ring-2 focus:ring-teal-400/20 dark:border-white/10 dark:bg-white/5 dark:text-white dark:placeholder:text-slate-500"
            />
        </label>
    );
}

function Toggle({ label, description, checked, onChange }) {
    return (
        <div className="flex items-center justify-between gap-4 border-b border-black/5 py-3 last:border-b-0 dark:border-white/5">
            <div>
                <p className="text-sm font-medium text-slate-900 dark:text-white">{label}</p>
                <p className="text-xs text-slate-500 dark:text-slate-400">{description}</p>
            </div>
            <button
                type="button"
                onClick={onChange}
                className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${checked ? 'bg-teal-500' : 'bg-black/15 dark:bg-white/20'}`}
                aria-pressed={checked}
            >
                <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-transform ${checked ? 'translate-x-5' : 'translate-x-0.5'}`} />
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
                        <button type="button" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-400">
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
                        <button type="button" className="rounded-md bg-teal-500 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-teal-400">
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
                            <div key={s.device} className="flex items-center justify-between gap-4 rounded-xl border border-black/10 px-4 py-3 dark:border-white/10">
                                <div className="min-w-0">
                                    <p className="flex items-center gap-2 text-sm font-medium text-slate-900 dark:text-white">
                                        {s.device}
                                        {s.current && (
                                            <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[10px] font-semibold text-teal-700 dark:bg-teal-500/10 dark:text-teal-300">
                                                This device
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-slate-500 dark:text-slate-400">{s.location}</p>
                                </div>
                                {!s.current && (
                                    <button type="button" className="shrink-0 rounded-md border border-black/10 px-3 py-1.5 text-xs font-semibold text-slate-600 transition hover:bg-black/5 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10">
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
