import Link from "next/link";

import { formatCurrency, formatPercent, formatRelativeDate } from "@/lib/format";
import type { RankedPath } from "@/lib/schema";

export function PathCard({ path }: { path: RankedPath }) {
  return (
    <article className="card panel-hover rounded-[1.8rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-accent">
              {path.reasonBadge}
            </span>
            <span className="pill rounded-full px-3 py-1 text-xs text-muted">
              {path.riskLevel ?? "medium"} risk
            </span>
          </div>
          <h3 className="mt-3 text-xl font-semibold tracking-tight">
            {path.offer.targetDevice}
          </h3>
          <p className="mt-1 text-sm text-muted">{path.summary}</p>
        </div>
        <div className="text-right">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Net value</p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">{formatCurrency(path.netValue)}</p>
        </div>
      </div>

      <div className="mt-5 grid gap-3 rounded-[1.4rem] border border-line bg-surface/65 p-4">
        <StepBlock
          step="Step 1"
          title={path.acquisition?.title ?? "Use current phone"}
          body={path.acquisition ? `${formatCurrency(path.acquisition.estimatedPrice)} estimated acquisition cost` : "No buy-first requirement"}
        />
        <StepBlock
          step="Step 2"
          title={path.merchant.name}
          body={`${formatCurrency(path.offer.tradeInValue)} ${path.offer.tradeInType.replace("_", " ")}`}
        />
        <StepBlock
          step="Step 3"
          title={path.valueTimelineLabel ?? "Immediate value"}
          body={`${formatCurrency(path.effectiveUpgradeCost)} real upgrade cost after drag`}
        />
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {path.tags.map((tag) => (
          <span key={tag} className="pill rounded-full px-3 py-1 text-xs text-muted">
            {tag}
          </span>
        ))}
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-4">
        <Metric label="Instant usable" value={formatCurrency(path.instantValue)} />
        <Metric label="Confidence" value={formatPercent(path.confidence)} />
        <Metric label="Updated" value={formatRelativeDate(path.offer.lastVerifiedAt)} />
        <Metric label="Caveat" value={path.biggestCaveat} />
      </div>

      <details className="mt-5 rounded-[1.2rem] border border-line bg-panel p-4 text-sm text-muted">
        <summary className="cursor-pointer list-none font-semibold text-foreground">Why this ranks here</summary>
        <p className="mt-3 leading-6">{path.explanation}</p>
        <p className="mt-2 leading-6">{path.offer.finePrintSummary}</p>
      </details>

      <div className="mt-6 flex flex-wrap gap-3">
        {path.links.acquisitionLink ? (
          <Link href={path.links.acquisitionLink} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:border-accent/60 hover:bg-surface">
            {path.links.acquisitionLabel}
          </Link>
        ) : null}
        <Link href={path.links.redemptionLink} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong">
          {path.links.redemptionLabel}
        </Link>
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

