import Link from "next/link";

import { ChartPanel } from "@/components/chart-panel";
import { PathCard } from "@/components/path-card";
import { formatCurrency, formatPercent } from "@/lib/format";
import type { TradeInFinderModel } from "@/lib/schema";

export function FinderResults({ model }: { model: TradeInFinderModel }) {
  if (!model.paths.length) {
    return (
      <div className="card rounded-[2rem] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">No matching store values</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Nothing matches this exact filter set.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Try a different store, a better condition assumption, or remove the target phone if you just want the highest direct value.</p>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        <SummaryCard label="Best trade-in" value={formatCurrency(model.summary.bestTradeInValue)} hint={model.summary.bestTradeInLabel} />
        <SummaryCard label="Best resale" value={formatCurrency(model.summary.bestResaleValue)} hint={model.summary.bestResaleLabel} />
        <SummaryCard label="Best upgrade cost" value={formatCurrency(model.summary.bestUpgradeValue)} hint={model.summary.bestUpgradeLabel} />
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
      <section className="card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Trade in vs sell vs upgrade</h2>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          {model.sellVsTrade.map((option) => (
            <Link key={option.slug} href={option.href} className="rounded-[1.4rem] border border-line bg-panel p-4 transition hover:border-accent/50">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-accent">{option.label}</p>
              <h3 className="mt-2 text-lg font-semibold">{option.title}</h3>
              <p className="mt-1 text-sm text-muted">{option.subtitle}</p>
              <p className="mt-4 text-2xl font-semibold tracking-tight">{formatCurrency(option.value)}</p>
              <p className="mt-2 text-sm text-muted">{option.speed} · {option.effort} · {option.risk}</p>
            </Link>
          ))}
        </div>
      </section>
      <ChartPanel title="Trade-in value vs resale benchmark" description="Direct-value results are plotted against the current sell-it-yourself benchmark for the same condition." data={model.chart} />
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
