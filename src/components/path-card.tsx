import Link from "next/link";

import { formatCurrency, formatPercent } from "@/lib/format";
import type { RankedPath } from "@/lib/schema";

export function PathCard({ path }: { path: RankedPath }) {
  return (
    <article className="card panel-hover rounded-[1.8rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">{path.reasonBadge}</span>
            <span className="pill rounded-full px-3 py-1 text-xs text-muted">{path.resolvedValue.confidenceLabel}</span>
            {path.resolvedValue.stale ? <span className="pill rounded-full px-3 py-1 text-xs text-amber-300">Stale</span> : null}
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">{path.merchant.name}</h3>
          <p className="mt-1 text-sm text-muted">{path.summary}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Shown value</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{path.resolvedValue.displayValue}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-[1.4rem] border border-line bg-surface/65 p-4">
        <StepBlock step="Trade it in" title={path.merchant.name} body={`${path.resolvedValue.displayValue} ${path.offer.valueType.replace(/_/g, " ")}`} />
        <StepBlock step="Sell benchmark" title={path.resaleNetValue ? formatCurrency(path.resaleNetValue) : "Unavailable"} body={path.resaleNetValue ? "Estimated resale net after fees" : "No resale benchmark for this condition"} />
        <StepBlock step="Upgrade result" title={path.effectiveUpgradeCost ? formatCurrency(path.effectiveUpgradeCost) : "No target selected"} body={path.effectiveUpgradeCost ? "Estimated cost after usable trade-in credit" : "Add a target phone to see upgrade math"} />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {path.tags.map((tag) => (
          <span key={tag} className="pill rounded-full px-3 py-1 text-xs text-muted">{tag}</span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Metric label="Source" value={path.offer.sourceName} />
        <Metric label="Last checked" value={path.resolvedValue.freshnessLabel} />
        <Metric label="Confidence" value={formatPercent(path.confidence)} />
        <Metric label="Fallback" value={path.resolvedValue.fallbackLevel.replace(/_/g, " ")} />
      </div>

      <details className="mt-5 rounded-[1.2rem] border border-line bg-panel p-4 text-sm text-muted">
        <summary className="cursor-pointer list-none font-semibold text-foreground">Why this value?</summary>
        <p className="mt-3 leading-6">{path.resolvedValue.whyValue}</p>
        <div className="mt-3 space-y-2">
          {path.resolvedValue.confidenceRationale.map((item) => (
            <p key={item.label} className="leading-6"><span className="font-semibold text-foreground">{item.label}:</span> {item.impact}</p>
          ))}
        </div>
        <p className="mt-3 leading-6">{path.biggestCaveat}</p>
      </details>

      <div className="mt-6 flex flex-wrap gap-3">
        <Link href={`/offer/${path.offer.slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent/60 hover:bg-surface">Offer detail</Link>
        <Link href={path.links.redemptionLink} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong">{path.links.redemptionLabel}</Link>
      </div>
    </article>
  );
}

function StepBlock({ step, title, body }: { step: string; title: string; body: string }) {
  return (
    <div className="rounded-[1rem] border border-line bg-panel px-4 py-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">{step}</p>
      <p className="mt-1 font-semibold">{title}</p>
      <p className="text-sm text-muted">{body}</p>
    </div>
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

