import {
  ArrowRight,
  BellRing,
  CircleDollarSign,
  ShieldCheck,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import Link from "next/link";

import { ChartPanel } from "@/components/chart-panel";
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
    <PageShell className="gap-20 pb-24 pt-8">
      <section className="grid gap-8 lg:grid-cols-[1.12fr_0.88fr] lg:items-stretch">
        <div className="card glow relative overflow-hidden rounded-[2rem] p-8 sm:p-10">
          <div className="absolute inset-x-0 top-0 h-1 bg-linear-to-r from-accent via-gold to-[#3187ff]" />
          <div className="flex flex-wrap items-center gap-3">
            <span className="pill rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-muted">Trade in - Sell - Upgrade</span>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">Last refreshed {formatRelativeDate(snapshot.freshness)}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">Find the best real trade-in value for your phone.</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted sm:text-xl">TradeInFinder compares direct store trade-in credit, gift-card value, and resale benchmarks so you can choose the simplest path with the best real outcome.</p>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <StatCard label="Best direct value" value={formatCurrency(snapshot.heroStats.bestDirectValue)} hint="Current top simple trade-in path" icon={CircleDollarSign} />
            <StatCard label="Best resale net" value={formatCurrency(snapshot.heroStats.bestResaleValue)} hint="Current sell-it-yourself benchmark" icon={TrendingUp} />
            <StatCard label="Tracked devices" value={String(snapshot.heroStats.deviceCoverage)} hint="Seeded iPhone, Galaxy, Pixel, and more" icon={ShieldCheck} />
            <StatCard label="Avg confidence" value={formatPercent(snapshot.heroStats.avgConfidence)} hint="Source and freshness weighted" icon={Sparkles} />
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/search" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong">Open trade-in finder</Link>
            <Link href="/sell-vs-trade" className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition hover:bg-surface">Compare sell vs trade</Link>
          </div>
          <div className="mt-10 grid gap-4 rounded-[1.5rem] border border-line bg-surface/55 p-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Trade in</p>
              <p className="mt-2 text-lg font-semibold">{snapshot.examplePath.merchant.name}</p>
              <p className="mt-1 text-sm text-muted">{formatCurrency(snapshot.examplePath.netValue)} direct value</p>
            </div>
            <ArrowRight className="hidden text-muted lg:block" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Sell benchmark</p>
              <p className="mt-2 text-lg font-semibold">{formatCurrency(snapshot.examplePath.resaleNetValue ?? 0)}</p>
              <p className="mt-1 text-sm text-muted">Estimated private-sale net</p>
            </div>
            <ArrowRight className="hidden text-muted lg:block" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Upgrade cost</p>
              <p className="mt-2 text-lg font-semibold">{formatCurrency(snapshot.examplePath.effectiveUpgradeCost)}</p>
              <p className="mt-1 text-sm text-muted">Estimated after immediately usable credit</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-sm text-muted">
            {snapshot.merchantStrip.map((merchant) => (
              <span key={merchant} className="pill rounded-full px-3 py-2">{merchant}</span>
            ))}
          </div>
        </div>
        <QuickStartForm devices={snapshot.devices} merchants={snapshot.merchants} defaultCurrentDevice="iphone-13-128" defaultTargetDevice="iphone-16-pro-256" />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {snapshot.trustItems.map((item) => (
          <div key={item.label} className="card rounded-[1.5rem] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{item.label}</p>
            <p className="mt-3 text-lg font-semibold">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.copy}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div>
          <SectionHeading eyebrow="How it works" title="The ranking engine compares direct store value against likely resale net." description="Each result is scored for usable value, simplicity, store trust, and how it stacks up against selling the phone yourself." />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {snapshot.methodologySteps.map((step) => (
              <div key={step.title} className="card rounded-[1.5rem] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{step.kicker}</p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <ChartPanel title="Trade-in value vs resale net" description="Top homepage paths plotted against the current sell-it-yourself benchmark." data={snapshot.instantVsDelayedChart} />
      </section>

      <section>
        <SectionHeading eyebrow="Best trade-in deals right now" title="Simple direct-value paths that actually make sense" description="These offers rank well because the value is usable, the path is understandable, and the confidence is strong." />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {snapshot.bestDeals.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Best sell vs trade opportunities" title="When convenience wins and when resale still pays more" description="These highlights show the cleanest decisions in the current seeded data." />
        <div className="mt-6 grid gap-4 lg:grid-cols-3">
          {snapshot.sellVsTradeHighlights.map((option) => (
            <Link key={option.slug} href={option.href} className="card panel-hover rounded-[1.5rem] p-5">
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{option.label}</p>
              <h3 className="mt-2 text-xl font-semibold">{option.title}</h3>
              <p className="mt-1 text-sm text-muted">{option.subtitle}</p>
              <p className="mt-4 text-3xl font-semibold tracking-tight">{formatCurrency(option.value)}</p>
              <p className="mt-2 text-sm text-muted">{option.speed} · {option.effort} · {option.risk}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <SectionHeading eyebrow="Popular phones" title="Phones people are pricing right now" description="Higher-demand devices are surfaced first so the homepage feels current and useful even with seeded data." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.trendingDevices.map((device) => (
              <Link key={device.slug} href={`/device/${device.slug}`} className="card panel-hover rounded-[1.5rem] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{device.brand}</p>
                <h3 className="mt-2 text-lg font-semibold">{device.model}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line bg-panel p-3"><p className="text-xs uppercase tracking-[0.16em] text-muted">Searches</p><p className="mt-1 font-semibold">{device.searchVolume}</p></div>
                  <div className="rounded-xl border border-line bg-panel p-3"><p className="text-xs uppercase tracking-[0.16em] text-muted">Trend</p><p className="mt-1 font-semibold">+{device.trendScore}</p></div>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-8">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-semibold tracking-tight">Why TradeInFinder is different</h2>
          </div>
          <div className="mt-6 space-y-4">
            {snapshot.differentiators.map((item) => (
              <div key={item} className="rounded-[1.3rem] border border-line bg-panel p-4 text-sm leading-6">{item}</div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.4rem] border border-line bg-surface/60 p-5">
            <div className="flex items-center gap-2"><BellRing className="h-4 w-4 text-accent" /><p className="text-sm font-semibold">Email and watched-value alerts</p></div>
            <p className="mt-2 text-sm leading-6 text-muted">Track devices, stores, and expiring value changes without manually checking every week.</p>
            <div className="mt-4 flex flex-wrap gap-3"><input type="email" placeholder="you@example.com" className="surface-input min-w-[220px] flex-1 rounded-full px-4 py-3 text-sm outline-none" /><button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Get alerts</button></div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Best upgrade paths" title="Upgrade recommendations with the real cost shown" description="Direct-brand and flexible-retailer paths are split so users can decide whether they want simplicity, ecosystem loyalty, or cross-brand flexibility." />
        <ComparisonBoard scenarios={snapshot.upgradeBoards} />
      </section>
    </PageShell>
  );
}
