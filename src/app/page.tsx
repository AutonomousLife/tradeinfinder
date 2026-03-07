import { CircleDollarSign, Sparkles, TrendingUp } from "lucide-react";
import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { PathCard } from "@/components/path-card";
import { QuickStartForm } from "@/components/quick-start-form";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { buildHomepageSnapshot } from "@/lib/engine";
import { formatRelativeDate } from "@/lib/format";

export default function HomePage() {
  const snapshot = buildHomepageSnapshot();

  return (
    <PageShell className="gap-12 pb-20 pt-6 sm:gap-14 sm:pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
        <div className="card glow relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-accent via-gold to-[#3187ff]" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Trade in. Sell. Upgrade.</span>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">Updated {formatRelativeDate(snapshot.freshness)}</span>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">Find the best simple value for your phone.</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">TradeInFinder helps you answer three questions clearly: where to trade in, whether selling is worth it, and what the cleanest upgrade path looks like.</p>
          <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            <StatCard label="Best trade-in" value={snapshot.heroStats.bestDirectValue} hint="Top direct store value" icon={CircleDollarSign} />
            <StatCard label="Best resale" value={snapshot.heroStats.bestResaleValue} hint="Estimated net after fees" icon={TrendingUp} />
            <StatCard label="Coverage" value={String(snapshot.heroStats.deviceCoverage)} hint="Supported phones" icon={Sparkles} />
          </div>
          <div className="mt-6 rounded-[1.5rem] border border-line bg-surface/55 p-4 sm:p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">What you get</p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div>
                <p className="font-semibold">Best Direct Trade-In</p>
                <p className="mt-1 text-sm text-muted">Ranked stores with source, confidence, and last-updated context.</p>
              </div>
              <div>
                <p className="font-semibold">Sell vs Trade</p>
                <p className="mt-1 text-sm text-muted">A straight answer on whether the extra resale effort is worth it.</p>
              </div>
              <div>
                <p className="font-semibold">Best Upgrade Path</p>
                <p className="mt-1 text-sm text-muted">A simple path to a new phone without hidden telecom math.</p>
              </div>
            </div>
          </div>
        </div>
        <QuickStartForm devices={snapshot.devices} merchants={snapshot.merchants} defaultCurrentDevice="iphone-13-128" defaultTargetDevice="iphone-16-pro-256" mode="homepage" />
      </section>

      <section>
        <SectionHeading eyebrow="Popular phones" title="Start from a common phone" description="Quick shortcuts into the phones people are checking most often." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {snapshot.trendingDevices.slice(0, 8).map((device) => (
            <Link key={device.slug} href={`/best-trade-in/${device.slug}`} className="card panel-hover rounded-[1.5rem] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{device.brand}</p>
              <h3 className="mt-2 text-lg font-semibold">{device.model}</h3>
              <p className="mt-3 text-sm text-muted">See the best trade-in, resale benchmark, and simple upgrade path.</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Trade-in vs sell</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Know when convenience is worth it</h2>
          <p className="mt-3 text-sm leading-6 text-muted">Trade-ins are faster and simpler. Resale can pay more. TradeInFinder shows both side by side so you can decide quickly.</p>
          <div className="mt-5 space-y-3">
            {snapshot.sellVsTradeHighlights.slice(0, 2).map((option) => (
              <Link key={option.slug} href={option.href} className="block rounded-[1.3rem] border border-line bg-panel p-4 transition hover:border-accent/50">
                <p className="font-semibold text-foreground">{option.title}</p>
                <p className="mt-1 text-sm text-muted">{option.subtitle}</p>
                <p className="mt-3 text-xl font-semibold tracking-tight">{option.displayValue}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Trust</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Clear value labels, not fake precision</h2>
          <div className="mt-5 space-y-3">
            {snapshot.trustItems.slice(0, 4).map((item) => (
              <div key={item.label} className="rounded-[1.2rem] border border-line bg-panel p-4 text-sm leading-6">
                <p className="font-semibold text-foreground">{item.label}</p>
                <p className="mt-1 text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Best deals" title="A few strong direct trade-in paths" description="Simple, readable examples from the current seeded dataset." />
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {snapshot.bestDeals.slice(0, 3).map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>
    </PageShell>
  );
}
