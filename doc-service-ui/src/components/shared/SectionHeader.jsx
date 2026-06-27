
export default function SectionHeader({ eyebrow, title, highlight, description }) {
    return (
        <div className="mx-auto mb-12 max-w-2xl text-center">
            {eyebrow && (
                <p className="text-xs font-semibold uppercase tracking-widest text-accent">
                    {eyebrow}
                </p>
            )}
            <h3 className="mt-3 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl lg:text-5xl">
                {title}{' '}
                {highlight && (
                    <span className="font-serif italic text-accent">{highlight}</span>
                )}
            </h3>
            {description && (
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                    {description}
                </p>
            )}
        </div>
    );
}
