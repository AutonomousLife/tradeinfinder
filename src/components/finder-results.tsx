import { ChartPanel } from "@/components/chart-panel";
import { PathCard } from "@/components/path-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { TradeInFinderModel } from "@/lib/schema";

export function FinderResults({ model }: { model: TradeInFinderModel }) {
  if (!model.paths.length) {
    return (
      <div className="card rounded-[2rem] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">No matching offers</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Nothing qualifies for this filter set.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">
          Try loosening the condition filter, allowing bill-credit offers, or widening merchant coverage. TradeInFinder hides ineligible and low-fit paths instead of forcing weak results.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Best net value" value={formatCurrency(model.summary.bestNetValue)} hint={model.summary.bestNetLabel} />
        <SummaryCard label="Best instant value" value={formatCurrency(model.summary.bestInstantValue)} hint={model.summary.bestInstantLabel} />
        <SummaryCard label="Best promo value" value={formatCurrency(model.summary.bestPromoValue)} hint={model.summary.bestPromoLabel} />
        <SummaryCard label="Average confidence" value={formatPercent(model.summary.avgConfidence)} hint={`${model.paths.length} ranked paths`} />
      </section>
      <section className="card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Why this ranks first</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {model.whyTopResult.map((item) => (
            <div key={item.label} className="rounded-[1.4rem] border border-line bg-panel p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{item.label}</p>
              <p className="mt-2 text-sm leading-6">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>
      <ChartPanel title="Value by top merchants" description="Headline trade-in value adjusted by delay and lock-in drag." data={model.chart} />
      <div className="grid gap-5 xl:grid-cols-2">
        {model.paths.map((path) => (
          <PathCard key={path.slug} path={path} />
        ))}
      </div>
    </div>
  );
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="card rounded-[1.4rem] p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{value}</p>
      <p className="mt-1 text-sm text-muted">{hint}</p>
    </div>
  );
}

