import Link from "next/link";

import { formatPercent } from "@/lib/format";
import type { RankedPath } from "@/lib/schema";

export function PathCard({ path }: { path: RankedPath }) {
  return (
    <article className="card panel-hover rounded-[1.6rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-accent">{path.reasonBadge}</span>
            <span className="pill rounded-full px-3 py-1 text-[11px] text-muted">{path.resolvedValue.confidenceLabel}</span>
            {path.resolvedValue.stale ? <span className="pill rounded-full px-3 py-1 text-[11px] text-amber-300">Stale</span> : null}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{path.merchant.name}</h3>
          <p className="mt-1 text-sm leading-6 text-muted">{path.summary}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Value</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{path.resolvedValue.displayValue}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Type" value={path.offer.valueType.replace(/_/g, " ")} />
        <Metric label="Source" value={path.offer.sourceName} />
        <Metric label="Updated" value={path.resolvedValue.freshnessLabel} />
      </div>

      <div className="mt-4 rounded-[1.2rem] border border-line bg-surface/55 p-4 text-sm leading-6 text-muted">
        <p><span className="font-semibold text-foreground">Why it shows:</span> {path.resolvedValue.whyValue}</p>
        <p className="mt-2"><span className="font-semibold text-foreground">Main caveat:</span> {path.biggestCaveat}</p>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {path.tags.slice(0, 3).map((tag) => (
          <span key={tag} className="pill rounded-full px-3 py-1 text-[11px] text-muted">{tag}</span>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap gap-3">
        <Link href={path.links.redemptionLink} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">{path.links.redemptionLabel}</Link>
        {path.links.redemptionAffiliateLink ? (
          <a href={path.links.redemptionAffiliateLink} target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">
            Open {path.merchant.name}
          </a>
        ) : null}
        {path.links.acquisitionLink && path.links.acquisitionLabel ? (
          <a href={path.links.acquisitionLink} target="_blank" rel="noreferrer" className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">
            {path.links.acquisitionLabel}
          </a>
        ) : null}
        <Link href={`/offer/${path.offer.slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:border-accent/60 hover:text-foreground hover:bg-surface">Offer detail</Link>
      </div>

      <div className="mt-4 flex items-center gap-2 text-xs text-muted">
        <span>{formatPercent(path.confidence)} confidence</span>
        <span>&middot;</span>
        <span>{path.resolvedValue.fallbackLevel.replace(/_/g, " ")}</span>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-line bg-panel p-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
