import {
  BellRing,
  CircleDollarSign,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { ComparisonBoard } from "@/components/comparison-board";
import { PageShell } from "@/components/page-shell";
import { PathCard } from "@/components/path-card";
import { QuickStartForm } from "@/components/quick-start-form";
import { SectionHeading } from "@/components/section-heading";
import { StatCard } from "@/components/stat-card";
import { buildHomepageSnapshot } from "@/lib/engine";
import { formatCurrency, formatPercent, formatRelativeDate } from "@/lib/format";

export default function HomePage() {
  const snapshot = buildHomepageSnapshot();

  return (
    <PageShell className="gap-14 pb-20 pt-6 sm:gap-16 sm:pt-8">
      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-stretch">
        <div className="card glow relative overflow-hidden rounded-[2rem] p-6 sm:p-8 lg:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-accent via-gold to-[#3187ff]" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill rounded-full px-4 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Trade in. Sell. Upgrade.</span>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">Updated {formatRelativeDate(snapshot.freshness)}</span>
          </div>
          <h1 className="mt-5 max-w-4xl text-balance text-4xl font-semibold tracking-[-0.05em] sm:text-5xl lg:text-6xl">Find the best real value for your phone.</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg sm:leading-8">Compare direct trade-in value, resale benchmarks, and simple upgrade paths in one clean view.</p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
            <StatCard label="Best trade-in" value={formatCurrency(snapshot.heroStats.bestDirectValue)} hint="Top store value" icon={CircleDollarSign} />
            <StatCard label="Best resale" value={formatCurrency(snapshot.heroStats.bestResaleValue)} hint="Net after fees" icon={TrendingUp} />
            <StatCard label="Coverage" value={String(snapshot.heroStats.deviceCoverage)} hint="Phones tracked" icon={Sparkles} />
            <StatCard label="Confidence" value={formatPercent(snapshot.heroStats.avgConfidence)} hint="Freshness weighted" icon={BellRing} />
          </div>
          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
            <Link href="/search" className="rounded-full bg-accent px-6 py-3 text-center text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong">Open trade-in finder</Link>
            <Link href="/sell-vs-trade" className="rounded-full border border-line px-6 py-3 text-center text-sm font-semibold transition hover:bg-surface">Compare sell vs trade</Link>
          </div>
          <div className="mt-8 grid gap-3 rounded-[1.5rem] border border-line bg-surface/55 p-4 sm:grid-cols-3 sm:gap-4 sm:p-5">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Trade in</p>
              <p className="mt-2 text-base font-semibold sm:text-lg">{snapshot.examplePath.merchant.name}</p>
              <p className="mt-1 text-sm text-muted">{formatCurrency(snapshot.examplePath.netValue)}</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Sell</p>
              <p className="mt-2 text-base font-semibold sm:text-lg">{formatCurrency(snapshot.examplePath.resaleNetValue ?? 0)}</p>
              <p className="mt-1 text-sm text-muted">Estimated net</p>
            </div>
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Upgrade</p>
              <p className="mt-2 text-base font-semibold sm:text-lg">{formatCurrency(snapshot.examplePath.effectiveUpgradeCost)}</p>
              <p className="mt-1 text-sm text-muted">Estimated final cost</p>
            </div>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 text-sm text-muted">
            {snapshot.merchantStrip.slice(0, 6).map((merchant) => (
              <span key={merchant} className="pill rounded-full px-3 py-2">{merchant}</span>
            ))}
          </div>
        </div>
        <QuickStartForm devices={snapshot.devices} merchants={snapshot.merchants} defaultCurrentDevice="iphone-13-128" defaultTargetDevice="iphone-16-pro-256" />
      </section>

      <section>
        <SectionHeading eyebrow="How it works" title="Simple ranking, visible trade-offs" description="We compare store value against likely resale net, then show the easiest strong option first." />
        <div className="mt-5 grid gap-4 sm:grid-cols-3">
          {snapshot.methodologySteps.map((step) => (
            <div key={step.title} className="card rounded-[1.5rem] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{step.kicker}</p>
              <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Best trade-in deals" title="Fast, clear store value" description="Top current paths without carrier promo clutter." />
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {snapshot.bestDeals.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.95fr]">
        <div>
          <SectionHeading eyebrow="Sell vs trade" title="Know when convenience is worth it" description="These quick comparisons show when resale likely beats store credit and when it does not." />
          <div className="mt-5 grid gap-4 sm:grid-cols-3">
            {snapshot.sellVsTradeHighlights.map((option) => (
              <Link key={option.slug} href={option.href} className="card panel-hover rounded-[1.5rem] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{option.label}</p>
                <h3 className="mt-2 text-lg font-semibold">{option.title}</h3>
                <p className="mt-1 text-sm text-muted">{option.subtitle}</p>
                <p className="mt-4 text-2xl font-semibold tracking-tight">{formatCurrency(option.value)}</p>
                <p className="mt-2 text-sm text-muted">{option.speed} · {option.effort}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-semibold tracking-tight">Why TradeInFinder feels different</h2>
          </div>
          <div className="mt-5 space-y-3">
            {snapshot.differentiators.map((item) => (
              <div key={item} className="rounded-[1.2rem] border border-line bg-panel p-4 text-sm leading-6">{item}</div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.4rem] border border-line bg-surface/60 p-5">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold">Value alerts</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">Track device value changes without checking manually.</p>
            <div className="mt-4 flex flex-col gap-3 sm:flex-row">
              <input type="email" placeholder="you@example.com" className="surface-input min-w-0 flex-1 rounded-full px-4 py-3 text-sm outline-none" />
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Get alerts</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Popular phones" title="Phones people are pricing now" description="Quick links into the most active devices." />
        <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {snapshot.trendingDevices.map((device) => (
            <Link key={device.slug} href={`/device/${device.slug}`} className="card panel-hover rounded-[1.5rem] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{device.brand}</p>
              <h3 className="mt-2 text-lg font-semibold">{device.model}</h3>
              <div className="mt-4 flex items-center justify-between text-sm text-muted">
                <span>{device.searchVolume} searches</span>
                <span>+{device.trendScore} trend</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Best upgrade paths" title="Real upgrade cost, clearly shown" description="Direct-brand and flexible-retailer paths split into a cleaner comparison board." />
        <ComparisonBoard scenarios={snapshot.upgradeBoards} />
      </section>
    </PageShell>
  );
}

