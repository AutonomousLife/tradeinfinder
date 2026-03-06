import {
  ArrowRight,
  BadgeDollarSign,
  BellRing,
  CircleDollarSign,
  Radar,
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
            <span className="pill rounded-full px-4 py-2 font-mono text-xs uppercase tracking-[0.22em] text-muted">Buy - Trade - Save</span>
            <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">Last refreshed {formatRelativeDate(snapshot.freshness)}</span>
          </div>
          <h1 className="mt-6 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">
            Find the real best phone trade-in path, not the prettiest promo.
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-muted sm:text-xl">
            TradeInFinder prices hidden lock-in costs, bill-credit drag, and acquisition risk so you can compare direct trade-ins, upgrade paths, and buy-first arbitrage with the math exposed.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-4">
            <StatCard label="Best net uplift" value={formatCurrency(snapshot.heroStats.bestSpread)} hint="Seeded from current trade-in and buy-cost data" icon={BadgeDollarSign} />
            <StatCard label="Tracked offers" value={String(snapshot.heroStats.offerCount)} hint="Carriers, OEMs, retailers, and marketplaces" icon={Radar} />
            <StatCard label="Device coverage" value={String(snapshot.heroStats.deviceCoverage)} hint="Expanded seeded catalog" icon={TrendingUp} />
            <StatCard label="Verified coverage" value={formatPercent(snapshot.heroStats.avgConfidence)} hint="Confidence-weighted quality score" icon={ShieldCheck} />
          </div>
          <div className="mt-8 flex flex-wrap gap-4">
            <Link href="/search" className="rounded-full bg-accent px-6 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong">
              Open trade-in finder
            </Link>
            <Link href="/upgrade" className="rounded-full border border-line px-6 py-3 text-sm font-semibold transition hover:bg-surface">
              See upgrade paths
            </Link>
          </div>
          <div className="mt-10 grid gap-4 rounded-[1.5rem] border border-line bg-surface/55 p-5 lg:grid-cols-[1fr_auto_1fr_auto_1fr] lg:items-center">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Buy</p>
              <p className="mt-2 text-lg font-semibold">{snapshot.examplePath.acquisition?.title ?? "Use your own phone"}</p>
              <p className="mt-1 text-sm text-muted">{snapshot.examplePath.acquisition ? `${formatCurrency(snapshot.examplePath.acquisition.estimatedPrice)} estimated` : "No intermediate device required"}</p>
            </div>
            <ArrowRight className="hidden text-muted lg:block" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Trade</p>
              <p className="mt-2 text-lg font-semibold">{snapshot.examplePath.merchant.name}</p>
              <p className="mt-1 text-sm text-muted">{formatCurrency(snapshot.examplePath.offer.tradeInValue)} {snapshot.examplePath.offer.tradeInType.replace("_", " ")}</p>
            </div>
            <ArrowRight className="hidden text-muted lg:block" />
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">Save</p>
              <p className="mt-2 text-lg font-semibold">{formatCurrency(snapshot.examplePath.netValue)}</p>
              <p className="mt-1 text-sm text-muted">Effective value after cost and caveats</p>
            </div>
          </div>
          <div className="mt-8 flex flex-wrap gap-2 text-sm text-muted">
            {snapshot.merchantStrip.map((merchant: string) => (
              <span key={merchant} className="pill rounded-full px-3 py-2">{merchant}</span>
            ))}
          </div>
        </div>
        <QuickStartForm
          devices={snapshot.devices}
          merchants={snapshot.merchants}
          defaultCurrentDevice="iphone-13-128"
          defaultTargetDevice="iphone-16-pro-256"
        />
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        {snapshot.trustItems.map((item: { label: string; value: string; copy: string }) => (
          <div key={item.label} className="card rounded-[1.5rem] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{item.label}</p>
            <p className="mt-3 text-lg font-semibold">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.copy}</p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_0.96fr]">
        <div>
          <SectionHeading
            eyebrow="How it works"
            title="The ranking engine prices lock-in, not just headline credit."
            description="Each path gets weighted across real net value, speed of value, merchant trust, complexity, and confidence. Promotions with 36 months of bill credits can still win, but only when the math does."
          />
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {snapshot.methodologySteps.map((step: { kicker: string; title: string; copy: string }) => (
              <div key={step.title} className="card rounded-[1.5rem] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{step.kicker}</p>
                <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-muted">{step.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <ChartPanel title="Instant value vs delayed promo value" description="Weighted comparison across the current top ranked upgrade paths." data={snapshot.instantVsDelayedChart} />
      </section>

      <section>
        <SectionHeading eyebrow="Best deals right now" title="Current offers with the best net trade-in value" description="These rankings weight direct value, bill-credit drag, merchant trust, and hidden requirements." />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {snapshot.bestDeals.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Best arbitrage this week" title="Trade-in spreads where a cheaper used phone beats using your current one" description="These are the most attractive buy-and-trade opportunities in the seeded dataset." />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {snapshot.arbitrage.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.08fr_0.92fr]">
        <div>
          <SectionHeading eyebrow="Popular phones" title="Trending phones people are pricing right now" description="Seeded demand signals help surface the models most likely to have strong upgrade-path interest." />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {snapshot.trendingDevices.map((device: { slug: string; brand: string; model: string; searchVolume: number; trendScore: number }) => (
              <Link key={device.slug} href={`/device/${device.slug}`} className="card panel-hover rounded-[1.5rem] p-5">
                <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{device.brand}</p>
                <h3 className="mt-2 text-lg font-semibold">{device.model}</h3>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div className="rounded-xl border border-line bg-panel p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Searches</p>
                    <p className="mt-1 font-semibold">{device.searchVolume}</p>
                  </div>
                  <div className="rounded-xl border border-line bg-panel p-3">
                    <p className="text-xs uppercase tracking-[0.16em] text-muted">Trend</p>
                    <p className="mt-1 font-semibold">+{device.trendScore}</p>
                  </div>
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
            {snapshot.differentiators.map((item: string) => (
              <div key={item} className="rounded-[1.3rem] border border-line bg-panel p-4 text-sm leading-6">
                {item}
              </div>
            ))}
          </div>
          <div className="mt-6 rounded-[1.4rem] border border-line bg-surface/60 p-5">
            <div className="flex items-center gap-2">
              <BellRing className="h-4 w-4 text-accent" />
              <p className="text-sm font-semibold">Email and watched-value alerts</p>
            </div>
            <p className="mt-2 text-sm leading-6 text-muted">Track expiring offers, new arbitrage spreads, and device value improvements without checking manually.</p>
            <div className="mt-4 flex flex-wrap gap-3">
              <input type="email" placeholder="you@example.com" className="surface-input min-w-[220px] flex-1 rounded-full px-4 py-3 text-sm outline-none" />
              <button className="rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Get alerts</button>
            </div>
          </div>
        </div>
      </section>

      <section>
        <SectionHeading eyebrow="Best upgrade paths" title="Upgrade recommendations that show the real cost to move up" description="Direct upgrade, low-risk, and arbitrage options are split so you can choose what matters: speed, simplicity, or maximum spread." />
        <ComparisonBoard scenarios={snapshot.upgradeBoards} />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <div className="card rounded-[2rem] p-8">
          <SectionHeading eyebrow="Most watched" title="Expiring soon and worth a second look" description="These offers are close to their published end date, so confidence is still useful but timing matters." />
          <div className="mt-6 space-y-4">
            {snapshot.expiringOffers.map((offer: { slug: string; merchant: string; target: string; ends: string; value: number }) => (
              <Link key={offer.slug} href={`/offer/${offer.slug}`} className="flex items-center justify-between gap-4 rounded-[1.2rem] border border-line bg-panel p-4 transition hover:border-accent/50">
                <div>
                  <p className="font-semibold">{offer.target}</p>
                  <p className="mt-1 text-sm text-muted">{offer.merchant} · ends {offer.ends}</p>
                </div>
                <div className="text-right">
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Value</p>
                  <p className="mt-1 font-semibold">{formatCurrency(offer.value)}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-8">
          <div className="flex items-center gap-3">
            <CircleDollarSign className="h-5 w-5 text-accent" />
            <h2 className="text-2xl font-semibold tracking-tight">Built for transparent monetization</h2>
          </div>
          <p className="mt-4 text-base leading-7 text-muted">
            Acquisition and redemption links use an affiliate-ready abstraction that supports direct links, referral links, and future tracking parameters. No merchant appears higher just because it monetizes better.
          </p>
          <div className="mt-6 grid gap-4">
            {snapshot.linkSystem.map((item: { title: string; copy: string }) => (
              <div key={item.title} className="rounded-[1.3rem] border border-line p-4">
                <h3 className="font-semibold">{item.title}</h3>
                <p className="mt-1 text-sm leading-6 text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
          <Link href="/methodology" className="mt-6 inline-flex rounded-full border border-line px-5 py-3 text-sm font-semibold transition hover:bg-surface">
            Read methodology
          </Link>
        </div>
      </section>
    </PageShell>
  );
}

