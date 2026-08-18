
export default function ResumeBuilderSkeleton() {
    const sections = [3, 4, 3, 2];
    return (
        <div className="min-h-screen bg-slate-200" aria-busy="true" aria-label="Loading resume editor">
            {/* Header bar */}
            <div className="editor-header-bg sticky top-0 z-20 flex h-14 items-center justify-between gap-2 border-b border-border px-3 shadow-sm sm:px-6">
                <div className="flex items-center gap-3">
                    <div className="h-4 w-4 rounded bg-muted animate-pulse" />
                    <div className="hidden h-4 w-px bg-border md:block" />
                    <div className="h-5 w-24 rounded-full bg-muted animate-pulse" />
                </div>
                <div className="flex items-center gap-2">
                    <div className="h-8 w-16 rounded-lg bg-muted animate-pulse" />
                    <div className="h-8 w-20 rounded-full bg-muted animate-pulse" />
                    <div className="h-8 w-24 rounded-full bg-muted animate-pulse" />
                </div>
            </div>

            {/* A4 sheet */}
            <div className="mx-auto my-6 w-full max-w-[820px] px-3 sm:px-0">
                <div className="animate-pulse rounded-md bg-white p-8 shadow-md sm:p-12">
                    {/* Name + contact */}
                    <div className="mx-auto h-7 w-56 rounded bg-slate-200" />
                    <div className="mx-auto mt-3 h-3 w-80 max-w-full rounded bg-slate-200" />

                    {/* Sections */}
                    {sections.map((lines, s) => (
                        <div key={s} className="mt-8">
                            <div className="h-4 w-40 rounded bg-slate-200" />
                            <div className="mt-2 h-px w-full bg-slate-200" />
                            <div className="mt-3 space-y-2.5">
                                {Array.from({ length: lines }).map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-3 rounded bg-slate-200"
                                        style={{ width: `${95 - (i % 3) * 12}%` }}
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
