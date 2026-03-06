import Link from "next/link";

import { formatCurrency, formatPercent } from "@/lib/format";
import type { UpgradeBoard } from "@/lib/schema";

export function ComparisonBoard({ scenarios }: { scenarios: UpgradeBoard[] }) {
  return (
    <div className="grid gap-6">
      {scenarios.map((scenario) => (
        <section key={scenario.title} className="card rounded-[2rem] p-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{scenario.kicker}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-tight">{scenario.title}</h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted">{scenario.description}</p>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            {scenario.paths.map((path) => (
              <div key={path.slug} className="rounded-[1.6rem] border border-line bg-panel p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-lg font-semibold">{path.merchant.name}</p>
                    <p className="mt-1 text-sm text-muted">{path.summary}</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{path.reasonBadge}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <Metric label="Upgrade cost" value={formatCurrency(path.effectiveUpgradeCost)} />
                  <Metric label="Confidence" value={formatPercent(path.confidence)} />
                  <Metric label="Trade-in value" value={formatCurrency(path.netValue)} />
                  <Metric label="Usability" value={path.valueTimelineLabel ?? "Immediate value"} />
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {path.tags.map((tag) => (
                    <span key={tag} className="pill rounded-full px-3 py-1 text-xs text-muted">{tag}</span>
                  ))}
                </div>
                <div className="mt-4 rounded-[1.2rem] border border-line bg-surface/60 p-4">
                  <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Why this ranks here</p>
                  <p className="mt-2 text-sm leading-6 text-foreground">{path.explanation}</p>
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  <Link href={`/offer/${path.offer.slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">Offer detail</Link>
                  <Link href={path.links.redemptionLink} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">{path.links.redemptionLabel}</Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-line bg-surface/60 p-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
