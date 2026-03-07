import Link from "next/link";

import { StoreScorecard } from "@/components/store-scorecard";
import { TrendStrip } from "@/components/trend-strip";
import { VerdictCard } from "@/components/verdict-card";
import type { DevicePageModel } from "@/lib/schema";

export function DeviceDetail({ model }: { model: DevicePageModel }) {
  const directPaths = model.paths.slice(0, 4);
  const resale = model.sellVsTrade.options.find((option) => option.type === "resale");
  const trade = model.sellVsTrade.options.find((option) => option.type === "trade_in");
  const upgrade = model.sellVsTrade.options.find((option) => option.type === "upgrade");
  const lead = directPaths[0];

  return (
    <div className="grid gap-10">
      <VerdictCard
        eyebrow="Device overview"
        title={lead ? `${model.device.model} looks best at ${lead.merchant.name}` : model.device.model}
        summary={`This page keeps the decision simple: best direct trade-in, the resale alternative, and the cleanest next-phone path.`}
        valueLabel="Best visible value"
        value={lead?.resolvedValue.displayValue ?? "Unavailable"}
        rationale={lead ? `${lead.resolvedValue.whyValue} ${model.sellVsTrade.recommendation.copy}` : model.sellVsTrade.recommendation.copy}
        notes={[
          { label: "Best trade-in", value: model.sellVsTrade.summary[0]?.value ?? "Unavailable" },
          { label: "Best resale", value: model.sellVsTrade.summary[1]?.value ?? "Unavailable" },
          { label: "Difference", value: model.sellVsTrade.summary[2]?.value ?? "Unavailable" },
          { label: "Recommended move", value: model.sellVsTrade.recommendation.title },
        ]}
        primaryCta={{ label: lead?.links.redemptionAffiliateLink ? `Open ${lead.merchant.name}` : "View best trade-in", href: lead?.links.redemptionAffiliateLink ?? lead?.links.redemptionLink ?? `/best-trade-in/${model.device.slug}`, external: Boolean(lead?.links.redemptionAffiliateLink) }}
        secondaryCta={{ label: `Sell vs trade ${model.device.model}`, href: `/resale-vs-trade/${model.device.slug}` }}
      />

      <TrendStrip device={model.device} leadPath={lead} />

      <section className="card rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Store scorecards</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em]">Where this phone looks strongest.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">A cleaner view of direct trade-in options, with confidence and freshness weighted into the ranking.</p>
          </div>
          <div>
            {directPaths.map((path, index) => (
              <StoreScorecard key={path.slug} path={path} rank={index + 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Sell vs trade</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">The trade-off in plain English.</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            {[trade, resale].filter(Boolean).map((option) => (
              <Link key={option!.slug} href={option!.href} className="block border-t border-line pt-4 first:border-t-0 first:pt-0">
                <p className="text-lg font-semibold tracking-tight">{option!.title}</p>
                <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{option!.displayValue}</p>
                <p className="mt-2 text-sm leading-6 text-muted">{option!.subtitle}</p>
                <p className="mt-3 text-xs text-muted">{option!.confidenceLabel} · {option!.freshnessLabel}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Best simple upgrade path</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">The easiest next move.</h2>
          {upgrade && lead ? (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-2xl font-semibold tracking-tight">{upgrade.title}</p>
              <p className="mt-3 text-sm leading-6 text-muted">{upgrade.subtitle}</p>
              <p className="mt-4 text-sm leading-6 text-muted">{upgrade.caveat}</p>
              <div className="mt-6 flex flex-wrap gap-3">
                {lead.links.redemptionAffiliateLink ? (
                  <a href={lead.links.redemptionAffiliateLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">
                    Open {lead.merchant.name}
                  </a>
                ) : (
                  <Link href={upgrade.href} className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Open upgrade path</Link>
                )}
                <Link href={upgrade.href} className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">View analysis</Link>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm leading-6 text-muted">No target phone was selected for this summary, so upgrade guidance is limited.</p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            {model.relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">{link.label}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
