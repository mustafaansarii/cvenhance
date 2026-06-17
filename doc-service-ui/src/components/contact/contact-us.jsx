import { useState } from 'react';
import toast from 'react-hot-toast';

const SUPPORT_EMAIL = 'support@cvenhance.in';
const SUPPORT_PHONE = '+91 99734 17743';

export default function ContactUs() {
    const [form, setForm] = useState({ name: '', email: '', message: '' });

    const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

    const onSubmit = (e) => {
        e.preventDefault();
        if (!form.message.trim()) {
            toast.error('Please write your query');
            return;
        }
        const subject = encodeURIComponent(`Query from ${form.name || 'a CVEnhance user'}`);
        const body = encodeURIComponent(`${form.message}\n\nFrom: ${form.name || '—'} (${form.email || 'no email'})`);
        window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`;
        toast.success('Opening your email app to send the query…');
    };

    const inputClass = 'w-full rounded-xl border border-slate-200 px-4 py-2.5 text-sm text-slate-800 outline-none transition focus:border-teal-400 focus:ring-2 focus:ring-teal-100';

    return (
        <main className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
            <section className="border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
                <h2 className="text-lg font-bold text-slate-900">Ask a query</h2>
                <p className="mt-1 text-sm text-slate-500">Have a question? Send it over and we&rsquo;ll get back to you.</p>

                <form onSubmit={onSubmit} className="mt-6 space-y-4">
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Name</label>
                            <input value={form.name} onChange={set('name')} placeholder="Your name" className={inputClass} />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-semibold text-slate-600">Email</label>
                            <input type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" className={inputClass} />
                        </div>
                    </div>
                    <div>
                        <label className="mb-1 block text-xs font-semibold text-slate-600">Your query</label>
                        <textarea value={form.message} onChange={set('message')} rows={5} placeholder="How can we help?" className={`${inputClass} resize-y`} />
                    </div>
                    <button type="submit" className="inline-flex items-center gap-2 rounded-full bg-teal-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-400">
                        Send query
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4"><path strokeLinecap="round" strokeLinejoin="round" d="M5 12h14M13 6l6 6-6 6" /></svg>
                    </button>
                </form>
            </section>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <a href={`tel:${SUPPORT_PHONE.replace(/\s/g, '')}`} className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-4 transition hover:border-teal-300">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h2.6a1 1 0 01.97.757l1 4a1 1 0 01-.29.96l-1.6 1.6a13 13 0 006 6l1.6-1.6a1 1 0 01.96-.29l4 1a1 1 0 01.76.97V19a2 2 0 01-2 2A16 16 0 013 5z" /></svg>
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Phone</span>
                        <span className="block text-sm font-medium text-slate-800">{SUPPORT_PHONE}</span>
                    </span>
                </a>
                <a href={`mailto:${SUPPORT_EMAIL}`} className="flex items-center gap-3 border border-slate-200 bg-white px-5 py-4 transition hover:border-teal-300">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="h-5 w-5"><path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16v12H4V6zm0 1l8 6 8-6" /></svg>
                    </span>
                    <span className="min-w-0">
                        <span className="block text-xs font-semibold uppercase tracking-wide text-slate-400">Email</span>
                        <span className="block truncate text-sm font-medium text-slate-800">{SUPPORT_EMAIL}</span>
                    </span>
                </a>
            </div>
        </main>
    );
}
