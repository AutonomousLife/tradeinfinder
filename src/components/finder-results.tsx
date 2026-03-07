import Link from "next/link";

import { PathCard } from "@/components/path-card";
import type { SellVsTradeOption, TradeInFinderModel } from "@/lib/schema";

export function FinderResults({ model }: { model: TradeInFinderModel }) {
  if (!model.paths.length) {
    return (
      <div className="card rounded-[2rem] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">No matching values</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">TradeInFinder could not find a clean match.</h2>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted">Try a different condition or remove the store preference. The app will only show values it can explain clearly.</p>
      </div>
    );
  }

  const directTradeIns = model.paths.slice(0, 3);
  const resaleOption = model.sellVsTrade.find((option) => option.type === "resale");
  const tradeOption = model.sellVsTrade.find((option) => option.type === "trade_in");
  const upgradeOption = model.sellVsTrade.find((option) => option.type === "upgrade");

  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        <SummaryCard label="Best trade-in" value={model.summary.bestTradeInValue} hint={model.summary.bestTradeInLabel} />
        <SummaryCard label="Best resale" value={model.summary.bestResaleValue} hint={model.summary.bestResaleLabel} />
        <SummaryCard label="Best upgrade" value={model.summary.bestUpgradeValue} hint={model.summary.bestUpgradeLabel} />
      </section>

      <section className="card rounded-[2rem] p-6">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">A. Best Direct Trade-In</p>
        <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Best stores right now</h2>
            <p className="mt-2 text-sm leading-6 text-muted">Fresh, readable trade-in options for this phone and condition.</p>
          </div>
          <p className="max-w-sm text-sm text-muted">Top pick: {model.whyTopResult[0]?.copy ?? "Best verified usable value."}</p>
        </div>
        <div className="mt-5 grid gap-5 xl:grid-cols-2">
          {directTradeIns.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card rounded-[2rem] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">B. Sell vs Trade</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Is selling worth the extra effort?</h2>
          <p className="mt-2 text-sm leading-6 text-muted">This compares the best store value with the current resale estimate.</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <ComparisonTile title="Trade it in" option={tradeOption} />
            <ComparisonTile title="Sell it yourself" option={resaleOption} />
          </div>
          <div className="mt-5 rounded-[1.3rem] border border-line bg-panel p-4 text-sm leading-6 text-muted">
            {resaleOption && tradeOption && resaleOption.value > tradeOption.value
              ? `Selling yourself likely pays more, but it comes with ${resaleOption.effort.toLowerCase()} and ${resaleOption.risk.toLowerCase()}.`
              : "The trade-in path is close enough that convenience is probably worth it for most people."}
          </div>
        </div>

        <div className="card rounded-[2rem] p-6">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">C. Best Upgrade Path</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">The cleanest next-phone path</h2>
          <p className="mt-2 text-sm leading-6 text-muted">When you choose a target phone, TradeInFinder shows the simplest store path and the real out-of-pocket cost.</p>
          {upgradeOption ? (
            <div className="mt-5 rounded-[1.4rem] border border-line bg-panel p-5">
              <p className="font-semibold text-foreground">{upgradeOption.title}</p>
              <p className="mt-1 text-sm text-muted">{upgradeOption.subtitle}</p>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <Metric label="Trade-in reduction" value={upgradeOption.displayValue} />
                <Metric label="Confidence" value={upgradeOption.confidenceLabel} />
                <Metric label="Freshness" value={upgradeOption.freshnessLabel} />
                <Metric label="Risk" value={upgradeOption.risk} />
              </div>
              <p className="mt-4 text-sm leading-6 text-muted">{upgradeOption.caveat}</p>
              <Link href={upgradeOption.href} className="mt-5 inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Open upgrade path</Link>
            </div>
          ) : (
            <div className="mt-5 rounded-[1.4rem] border border-line bg-panel p-5 text-sm leading-6 text-muted">
              Add a target phone above to see the best simple upgrade path.
            </div>
          )}
        </div>
      </section>
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

function ComparisonTile({ title, option }: { title: string; option?: SellVsTradeOption }) {
  if (!option) {
    return (
      <div className="rounded-[1.3rem] border border-line bg-panel p-4 text-sm text-muted">
        <p className="font-semibold text-foreground">{title}</p>
        <p className="mt-2">Unavailable for this phone and condition.</p>
      </div>
    );
  }

  return (
    <Link href={option.href} className="rounded-[1.3rem] border border-line bg-panel p-4 transition hover:border-accent/50">
      <p className="font-semibold text-foreground">{title}</p>
      <p className="mt-2 text-2xl font-semibold tracking-tight">{option.displayValue}</p>
      <p className="mt-1 text-sm text-muted">{option.subtitle}</p>
      <p className="mt-3 text-sm text-muted">{option.speed} Â· {option.effort} Â· {option.risk}</p>
      <p className="mt-1 text-xs text-muted">{option.confidenceLabel} Â· {option.freshnessLabel}</p>
    </Link>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-line bg-surface/60 p-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-1 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
