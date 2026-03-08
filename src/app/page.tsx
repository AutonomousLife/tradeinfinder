import Link from "next/link";

import { PageShell } from "@/components/page-shell";
import { QuickStartForm } from "@/components/quick-start-form";
import { StoreScorecard } from "@/components/store-scorecard";
import { TrendStrip } from "@/components/trend-strip";
import { VerdictCard } from "@/components/verdict-card";
import { buildHomepageSnapshot } from "@/lib/engine";
import { formatRelativeDate } from "@/lib/format";

export default function HomePage() {
  const snapshot = buildHomepageSnapshot();
  const lead = snapshot.examplePath;
  const resaleHighlight = snapshot.sellVsTradeHighlights.find((item) => item.type === "resale");

  return (
    <PageShell className="gap-14 pb-24 pt-8 sm:gap-16 sm:pt-10">
      <section className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.26em] text-accent">TradeInFinder</p>
          <h1 className="mt-4 max-w-4xl text-balance text-5xl font-semibold tracking-[-0.05em] sm:text-6xl">Find the best real move for your phone.</h1>
          <p className="mt-5 max-w-2xl text-lg leading-8 text-muted">
            Compare direct trade-in value, resale benchmarks, and the cleanest upgrade path without pretending seeded research is a live quote.
          </p>
          <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm text-muted">
            <span>Updated {formatRelativeDate(snapshot.freshness)}</span>
            {snapshot.merchantStrip.slice(0, 5).map((merchant) => (
              <span key={merchant}>{merchant}</span>
            ))}
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            {snapshot.trendingDevices.slice(0, 5).map((device) => (
              <Link key={device.slug} href={`/best-trade-in/${device.slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">
                {device.model}
              </Link>
            ))}
          </div>
          <div className="mt-8">
            <TrendStrip device={lead?.device ?? snapshot.trendingDevices[0] ?? snapshot.devices[0]} leadPath={lead} />
          </div>
        </div>
        <QuickStartForm devices={snapshot.devices} merchants={snapshot.merchants} defaultCurrentDevice="iphone-13-128" defaultTargetDevice="iphone-16-pro-256" mode="homepage" />
      </section>

      {lead ? (
        <VerdictCard
          eyebrow="Example answer"
          title={`Trade in at ${lead.merchant.name}`}
          summary={`${lead.device.model} currently has a live, public path that can be shown without hand-waving.`}
          valueLabel="Shown value"
          value={lead.resolvedValue.displayValue}
          rationale={`${lead.resolvedValue.whyValue} ${resaleHighlight ? `Resale currently sits around ${resaleHighlight.displayValue}.` : ""}`}
          notes={[
            { label: "Confidence", value: lead.resolvedValue.confidenceLabel },
            { label: "Updated", value: lead.resolvedValue.freshnessLabel },
            { label: "Best move", value: lead.reasonBadge },
            { label: "Caveat", value: lead.biggestCaveat },
          ]}
          primaryCta={{ label: `Open ${lead.merchant.name}`, href: lead.links.redemptionAffiliateLink ?? lead.links.redemptionLink, external: Boolean(lead.links.redemptionAffiliateLink) }}
          secondaryCta={{ label: "View full breakdown", href: lead.links.redemptionLink }}
        />
      ) : (
        <VerdictCard
          eyebrow="Live quote status"
          title="No public live trade-in quotes are connected yet"
          summary="The public site now refuses to rank seeded merchant snapshots as if they were current values. Resale estimates still work, but direct store values stay hidden until a live quote capture exists."
          valueLabel="Current state"
          value="Waiting for live quotes"
          rationale="This is the honest behavior: Best Buy, Apple, Samsung, and similar merchants should not appear as current values unless TradeInFinder captured a recent quote that can be audited."
          notes={[
            { label: "Public quotes", value: String(snapshot.heroStats.offerCount) },
            { label: "Resale", value: snapshot.heroStats.bestResaleValue },
            { label: "Coverage", value: `${snapshot.heroStats.deviceCoverage} phones` },
            { label: "Why", value: "Seeded research moved behind admin" },
          ]}
          primaryCta={{ label: "Run a search anyway", href: "/search" }}
          secondaryCta={{ label: "See methodology", href: "/methodology" }}
        />
      )}

      <section className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">How it works</p>
          <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Trade-in values only show up when the app can defend them.</h2>
        </div>
        <div className="grid gap-6 sm:grid-cols-3">
          {snapshot.methodologySteps.map((step) => (
            <div key={step.kicker} className="border-t border-line pt-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">Step {step.kicker}</p>
              <h3 className="mt-2 text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="mt-3 text-sm leading-6 text-muted">{step.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Best direct trade-in deals</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Only current public quotes belong here.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">If this list is empty, that means the live quote pipeline is not populated yet. The site will not backfill it with seeded merchant numbers and pretend they are current.</p>
          </div>
          <div>
            {snapshot.bestDeals.length ? (
              snapshot.bestDeals.slice(0, 3).map((path, index) => <StoreScorecard key={path.slug} path={path} rank={index + 1} />)
            ) : (
              <div className="rounded-[1.6rem] border border-line bg-surface/40 p-6 text-sm leading-6 text-muted">
                No public live trade-in quotes are available yet. Resale benchmarks remain visible because they are explicitly labeled as estimates.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Sell vs trade</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Resale stays visible even when trade-in is unavailable.</h2>
          <div className="mt-6 space-y-4">
            {snapshot.sellVsTradeHighlights.slice(0, 2).map((option) => (
              <Link key={option.slug} href={option.href} className="block border-t border-line pt-4 first:border-t-0 first:pt-0">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-lg font-semibold tracking-tight">{option.title}</p>
                    <p className="mt-2 text-sm leading-6 text-muted">{option.subtitle}</p>
                  </div>
                  <p className="text-2xl font-semibold tracking-[-0.04em]">{option.displayValue}</p>
                </div>
                <p className="mt-2 text-sm text-muted">{option.confidenceLabel} · {option.freshnessLabel}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Popular phones</p>
          <div className="mt-6 grid gap-4 sm:grid-cols-2">
            {snapshot.trendingDevices.slice(0, 6).map((device) => (
              <Link key={device.slug} href={`/device/${device.slug}`} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                <p className="text-base font-semibold tracking-tight">{device.model}</p>
                <p className="mt-2 text-sm leading-6 text-muted">See direct trade-in status, resale context, and the cleanest next step.</p>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}