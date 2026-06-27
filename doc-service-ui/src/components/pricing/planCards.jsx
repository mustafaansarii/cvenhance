import { PLANS, currentPlanLevel } from '../../services/payment.service';

export const PLAN_DETAILS = {
  BASIC: {
    tagline: 'Perfect when you just need one polished resume.',
    badge: 'Starter',
    cta: 'Get Starter',
    features: [
      'Download 1 resume',
      'All resume templates',
      'AI resume import (PDF / DOCX)',
      'ATS-friendly PDF export',
      'Valid for 1 year',
    ],
    excluded: ['LaTeX source editor', 'Priority support'],
  },
  STANDARD: {
    tagline: 'For an active job hunt — tailor a resume per role.',
    badge: 'Most Popular',
    cta: 'Get Pro',
    features: [
      'Download up to 5 resumes',
      'All resume templates',
      'AI resume import (PDF / DOCX)',
      'LaTeX source editor',
      'ATS-friendly PDF export',
      'Valid for 1 year',
    ],
    excluded: ['Priority support'],
  },
  UNLIMITED: {
    tagline: 'Unlimited downloads for power users and career switchers.',
    badge: 'Best Value',
    cta: 'Go Unlimited',
    features: [
      'Unlimited resume downloads',
      'All resume templates',
      'AI resume import (PDF / DOCX)',
      'LaTeX source editor',
      'ATS-friendly PDF export',
      'Priority support',
      'Valid for 1 year',
    ],
    excluded: [],
  },
};

function CheckIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-4 w-4 shrink-0 text-accent">
      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
    </svg>
  );
}

function CrossIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="h-4 w-4 shrink-0 opacity-25">
      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}

export function PricingCard({ plan, isPopular, isCurrent, isIncluded, busy, onBuy }) {
  const details = PLAN_DETAILS[plan.code];
  const blocked = isCurrent || isIncluded;
  const label = isCurrent ? 'Current plan' : isIncluded ? 'Included' : busy === plan.code ? 'Starting…' : details.cta;
  return (
    <div className="relative flex flex-col h-full">

      {details.badge && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 z-10">
          <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-card px-3 py-0.5 text-[11px] font-bold uppercase tracking-widest text-foreground">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
            {details.badge}
          </span>
        </div>
      )}

      <div className="px-7 pt-10 pb-6">
        <p className={`text-[11px] font-bold uppercase tracking-widest ${isPopular ? 'text-accent' : 'text-muted-foreground'}`}>
          {plan.title}
        </p>
        <div className="mt-4 flex items-end gap-1">
          <span className="text-sm font-semibold text-muted-foreground mb-2">₹</span>
          <span className={`text-6xl font-black tracking-tighter leading-none ${isPopular ? 'text-accent' : 'text-foreground'}`}>
            {plan.price}
          </span>
          <span className="text-sm text-muted-foreground mb-2">one-time</span>
        </div>
        <p className="mt-3 text-sm text-muted-foreground leading-relaxed">
          {details.tagline}
        </p>
      </div>

      <ul className="flex-1 px-7 py-6 space-y-3">
        {details.features.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-foreground">
            <CheckIcon />
            <span>{f}</span>
          </li>
        ))}
        {details.excluded.map((f) => (
          <li key={f} className="flex items-start gap-3 text-sm text-muted-foreground line-through">
            <CrossIcon />
            <span>{f}</span>
          </li>
        ))}
      </ul>

      <div className="px-7 py-6">
        <button
          onClick={() => onBuy(plan.code)}
          disabled={busy !== null || blocked}
          className={[
            'flex w-full items-center justify-center gap-2 border px-4 py-3 text-sm font-semibold transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-60',
            isPopular
              ? 'border-accent bg-accent text-accent-foreground hover:bg-accent-hover'
              : 'border-border text-foreground hover:border-accent',
          ].join(' ')}
        >
          {label}
          {!blocked && busy !== plan.code && (
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="h-3.5 w-3.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 8l4 4-4 4M3 12h18" />
            </svg>
          )}
        </button>
      </div>
    </div>
  );
}

export function PlanGrid({ entitlement, busy, onBuy }) {
  const activePlan = entitlement?.active ? entitlement.plan : null;
  const currentLevel = currentPlanLevel(entitlement);
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="pointer-events-none absolute left-0   top-0 bottom-0 w-px bg-border hidden md:block" />
      <div className="pointer-events-none absolute left-1/3 top-0 bottom-0 w-px bg-border hidden md:block" />
      <div className="pointer-events-none absolute left-2/3 top-0 bottom-0 w-px bg-border hidden md:block" />
      <div className="pointer-events-none absolute right-0  top-0 bottom-0 w-px bg-border hidden md:block" />

      <div className="grid grid-cols-1 md:grid-cols-3">
        {PLANS.map((plan) => (
          <PricingCard
            key={plan.code}
            plan={plan}
            isPopular={plan.code === 'STANDARD'}
            isCurrent={activePlan === plan.code}
            isIncluded={currentLevel > 0 && plan.level < currentLevel}
            busy={busy}
            onBuy={onBuy}
          />
        ))}
      </div>
    </div>
  );
}
