import Link from "next/link";

import { formatCurrency, formatPercent } from "@/lib/format";
import type { UpgradeBoard } from "@/lib/schema";

export function ComparisonBoard({ scenarios }: { scenarios: UpgradeBoard[] }) {
  return (
    <div className="grid gap-8">
      {scenarios.map((scenario) => (
        <section key={scenario.title} className="card rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">{scenario.kicker}</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em]">{scenario.title}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted">{scenario.description}</p>
            </div>
            <div className="space-y-5">
              {scenario.paths.map((path, index) => (
                <article key={path.slug} className="border-t border-line pt-5 first:border-t-0 first:pt-0">
                  <div className="grid gap-5 lg:grid-cols-[1fr_0.9fr]">
                    <div>
                      <div className="flex flex-wrap items-center gap-3">
                        <span className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">#{index + 1}</span>
                        <h3 className="text-xl font-semibold tracking-tight">{path.merchant.name}</h3>
                        <span className="text-sm text-muted">{path.reasonBadge}</span>
                      </div>
                      <p className="mt-3 text-sm leading-6 text-muted">{path.summary}</p>
                      <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                        <Metric label="Shown value" value={path.resolvedValue.displayValue} />
                        <Metric label="Upgrade cost" value={formatCurrency(path.effectiveUpgradeCost)} />
                        <Metric label="Confidence" value={`${formatPercent(path.confidence)} · ${path.resolvedValue.confidenceLabel}`} />
                      </dl>
                    </div>
                    <div className="rounded-[1.5rem] border border-line bg-surface/60 p-5">
                      <p className="text-sm leading-6 text-muted">{path.resolvedValue.whyValue}</p>
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
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
