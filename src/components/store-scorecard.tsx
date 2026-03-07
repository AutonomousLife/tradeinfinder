import Link from "next/link";

import type { RankedPath } from "@/lib/schema";

export function StoreScorecard({
  path,
  rank,
}: {
  path: RankedPath;
  rank?: number;
}) {
  return (
    <article className="border-t border-line py-5 first:border-t-0 first:pt-0 last:pb-0">
      <div className="grid gap-5 lg:grid-cols-[1.1fr_0.9fr]">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            {rank ? <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">#{rank}</span> : null}
            <h3 className="text-xl font-semibold tracking-tight">{path.merchant.name}</h3>
            <span className="text-sm text-muted">{path.offer.valueType.replace(/_/g, " ")}</span>
          </div>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">{path.summary}</p>
          <dl className="mt-5 grid gap-4 sm:grid-cols-3">
            <Info label="Confidence" value={path.resolvedValue.confidenceLabel} />
            <Info label="Updated" value={path.resolvedValue.freshnessLabel} />
            <Info label="Why it ranks" value={path.reasonBadge} />
          </dl>
          <p className="mt-5 max-w-2xl text-sm leading-6 text-muted">
            <span className="font-semibold text-foreground">Why it shows:</span> {path.resolvedValue.whyValue}
          </p>
        </div>
        <div className="rounded-[1.6rem] border border-line bg-surface/60 p-5">
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Shown value</p>
          <p className="mt-2 text-4xl font-semibold tracking-[-0.04em]">{path.resolvedValue.displayValue}</p>
          <p className="mt-3 text-sm leading-6 text-muted">{path.biggestCaveat}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            {path.links.redemptionAffiliateLink ? (
              <a href={path.links.redemptionAffiliateLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">
                Open {path.merchant.name}
              </a>
            ) : (
              <Link href={path.links.redemptionLink} className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">
                {path.links.redemptionLabel}
              </Link>
            )}
            <Link href={path.links.redemptionLink} className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">
              View analysis
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
