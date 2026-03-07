import Link from "next/link";

type VerdictCardProps = {
  eyebrow: string;
  title: string;
  summary: string;
  valueLabel: string;
  value: string;
  rationale: string;
  notes?: { label: string; value: string }[];
  primaryCta: { label: string; href: string; external?: boolean };
  secondaryCta?: { label: string; href: string; external?: boolean };
};

export function VerdictCard({
  eyebrow,
  title,
  summary,
  valueLabel,
  value,
  rationale,
  notes = [],
  primaryCta,
  secondaryCta,
}: VerdictCardProps) {
  return (
    <section className="card rounded-[2rem] p-6 sm:p-8">
      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-end">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">{eyebrow}</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">{title}</h2>
          <p className="mt-4 max-w-2xl text-base leading-7 text-muted">{summary}</p>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">{rationale}</p>
          <div className="mt-6 flex flex-wrap gap-3">
            <CtaButton {...primaryCta} primary />
            {secondaryCta ? <CtaButton {...secondaryCta} /> : null}
          </div>
        </div>
        <div className="border-t border-line pt-6 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-muted">{valueLabel}</p>
          <p className="mt-3 text-5xl font-semibold tracking-[-0.05em]">{value}</p>
          {notes.length ? (
            <dl className="mt-6 grid gap-4 sm:grid-cols-2">
              {notes.map((note) => (
                <div key={note.label} className="border-t border-line pt-3">
                  <dt className="text-[11px] font-medium uppercase tracking-[0.18em] text-muted">{note.label}</dt>
                  <dd className="mt-2 text-base font-semibold text-foreground">{note.value}</dd>
                </div>
              ))}
            </dl>
          ) : null}
        </div>
      </div>
    </section>
  );
}

function CtaButton({
  label,
  href,
  external,
  primary = false,
}: {
  label: string;
  href: string;
  external?: boolean;
  primary?: boolean;
}) {
  const className = primary
    ? "inline-flex rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong"
    : "inline-flex rounded-full border border-line px-5 py-3 text-sm font-semibold text-foreground transition hover:bg-surface";

  if (external) {
    return (
      <a href={href} target="_blank" rel="noreferrer" className={className}>
        {label}
      </a>
    );
  }

  return (
    <Link href={href} className={className}>
      {label}
    </Link>
  );
}
