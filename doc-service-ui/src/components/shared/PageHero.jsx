import { Link } from 'react-router-dom';

function PageHero({ title, description, breadcrumb }) {
    return (
        <div className="mx-auto max-w-7xl px-4 pt-2 pb-12 sm:px-6 lg:px-8 sm:pb-16">

            <div className="text-left pl-3">
                <Link to="/" className="text-xs font-medium text-white/80 transition hover:text-white">
                    Home
                </Link>
                <span className="mx-1 text-xs text-white/50">/</span>
                <span className="text-xs font-medium text-white/80">{breadcrumb}</span>
            </div>

            <div className="mx-auto mt-6 max-w-2xl text-center [text-shadow:0_2px_10px_rgba(0,0,0,0.45)]">

                <span className="inline-flex items-center gap-1.5 rounded-full border border-accent bg-accent/15 px-3 py-1 text-[11px] font-bold uppercase tracking-widest text-accent text-shadow-none">
                    <span className="h-1.5 w-1.5 rounded-full bg-accent shrink-0" />
                    {breadcrumb}
                </span>
                <h2 className="mt-2 text-4xl font-bold font-serif text-white sm:text-5xl">{title}</h2>
                <p className="mt-3 text-sm leading-relaxed text-white/90">
                    {description}
                </p>
            </div>
        </div>
    );
}

export default PageHero;
