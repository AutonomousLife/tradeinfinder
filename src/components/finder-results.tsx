import Link from "next/link";

import { StoreScorecard } from "@/components/store-scorecard";
import { TrendStrip } from "@/components/trend-strip";
import { VerdictCard } from "@/components/verdict-card";
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

  const directTradeIns = model.paths.slice(0, 4);
  const resaleOption = model.sellVsTrade.find((option) => option.type === "resale");
  const tradeOption = model.sellVsTrade.find((option) => option.type === "trade_in");
  const upgradeOption = model.sellVsTrade.find((option) => option.type === "upgrade");
  const verdict = buildVerdict(model, tradeOption, resaleOption, upgradeOption);

  return (
    <div className="grid gap-8">
      <VerdictCard
        eyebrow="Recommended move"
        title={verdict.title}
        summary={verdict.summary}
        valueLabel={verdict.valueLabel}
        value={verdict.value}
        rationale={verdict.rationale}
        notes={verdict.notes}
        primaryCta={verdict.primaryCta}
        secondaryCta={verdict.secondaryCta}
      />

      <TrendStrip device={model.inputs.currentDevice} leadPath={directTradeIns[0]} />

      <section className="card rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Best direct trade-in</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em]">Best stores right now.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">These are the clearest direct trade-in options for this phone and condition. Confidence and freshness matter as much as the raw number.</p>
          </div>
          <div>
            {directTradeIns.map((path, index) => (
              <StoreScorecard key={path.slug} path={path} rank={index + 1} />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Sell vs trade</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Is the extra money worth the hassle?</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <DecisionColumn title="Trade it in" option={tradeOption} />
            <DecisionColumn title="Sell it yourself" option={resaleOption} />
          </div>
          <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
            {resaleOption && tradeOption && resaleOption.value > tradeOption.value + 50
              ? `Selling yourself likely adds about ${Math.round(resaleOption.value - tradeOption.value)} dollars before the extra work, timing, and listing risk.`
              : "The trade-in path is close enough that convenience is probably worth it for most people."}
          </p>
        </div>
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Best simple upgrade path</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-[-0.04em]">Keep the upgrade math readable.</h2>
          {upgradeOption ? (
            <div className="mt-6 border-t border-line pt-5">
              <p className="text-2xl font-semibold tracking-tight">{upgradeOption.title}</p>
              <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{upgradeOption.subtitle}</p>
              <dl className="mt-6 grid gap-4 sm:grid-cols-2">
                <Metric label="Trade-in reduction" value={upgradeOption.displayValue} />
                <Metric label="Confidence" value={upgradeOption.confidenceLabel} />
                <Metric label="Freshness" value={upgradeOption.freshnessLabel} />
                <Metric label="Risk" value={upgradeOption.risk} />
              </dl>
              <div className="mt-6 flex flex-wrap gap-3">
                {directTradeIns[0]?.links.redemptionAffiliateLink ? (
                  <a href={directTradeIns[0].links.redemptionAffiliateLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">
                    Open {directTradeIns[0].merchant.name}
                  </a>
                ) : (
                  <Link href={upgradeOption.href} className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Open upgrade path</Link>
                )}
                <Link href={upgradeOption.href} className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">View analysis</Link>
              </div>
            </div>
          ) : (
            <p className="mt-6 text-sm leading-6 text-muted">Add a target phone above to see the best simple upgrade path.</p>
          )}
        </div>
      </section>
    </div>
  );
}

function buildVerdict(
  model: TradeInFinderModel,
  tradeOption?: SellVsTradeOption,
  resaleOption?: SellVsTradeOption,
  upgradeOption?: SellVsTradeOption,
) {
  if (model.inputs.targetDevice && upgradeOption && model.paths[0]) {
    const leadPath = model.paths[0];
    return {
      title: `Upgrade at ${leadPath.merchant.name}`,
      summary: `${leadPath.resolvedValue.displayValue} currently gives the cleanest route from ${model.inputs.currentDevice.model} to ${model.inputs.targetDevice.model}.`,
      valueLabel: "Effective value",
      value: upgradeOption.displayValue,
      rationale: `${leadPath.resolvedValue.whyValue} This path keeps the upgrade simple and the value type clear.`,
      notes: [
        { label: "Store", value: leadPath.merchant.name },
        { label: "Confidence", value: leadPath.resolvedValue.confidenceLabel },
        { label: "Updated", value: leadPath.resolvedValue.freshnessLabel },
        { label: "Target", value: model.inputs.targetDevice.model },
      ],
      primaryCta: {
        label: leadPath.links.redemptionAffiliateLink ? `Open ${leadPath.merchant.name}` : "Open upgrade path",
        href: leadPath.links.redemptionAffiliateLink ?? upgradeOption.href,
        external: Boolean(leadPath.links.redemptionAffiliateLink),
      },
      secondaryCta: { label: "View analysis", href: upgradeOption.href },
    };
  }

  if (resaleOption && tradeOption && resaleOption.value > tradeOption.value + 50) {
    return {
      title: "Sell it yourself",
      summary: `${resaleOption.displayValue} currently beats the cleanest store trade-in by a meaningful margin.`,
      valueLabel: "Estimated resale net",
      value: resaleOption.displayValue,
      rationale: "This is the higher-money path, but it comes with more effort, more timing risk, and less certainty than a direct store trade-in.",
      notes: [
        { label: "Effort", value: resaleOption.effort },
        { label: "Speed", value: resaleOption.speed },
        { label: "Risk", value: resaleOption.risk },
        { label: "Confidence", value: resaleOption.confidenceLabel },
      ],
      primaryCta: { label: "See resale breakdown", href: resaleOption.href },
      secondaryCta: tradeOption ? { label: tradeOption.title, href: tradeOption.href } : undefined,
    };
  }

  const lead = model.paths[0];
  return {
    title: `Trade in at ${lead.merchant.name}`,
    summary: `${lead.resolvedValue.displayValue} is currently the cleanest direct value for ${model.inputs.currentDevice.model}.`,
    valueLabel: "Shown value",
    value: lead.resolvedValue.displayValue,
    rationale: `${lead.resolvedValue.whyValue} This is the best mix of usable value, confidence, and freshness in the current data.`,
    notes: [
      { label: "Value type", value: lead.offer.valueType.replace(/_/g, " ") },
      { label: "Confidence", value: lead.resolvedValue.confidenceLabel },
      { label: "Updated", value: lead.resolvedValue.freshnessLabel },
      { label: "Caveat", value: lead.biggestCaveat },
    ],
    primaryCta: {
      label: lead.links.redemptionAffiliateLink ? `Open ${lead.merchant.name}` : lead.links.redemptionLabel,
      href: lead.links.redemptionAffiliateLink ?? lead.links.redemptionLink,
      external: Boolean(lead.links.redemptionAffiliateLink),
    },
    secondaryCta: { label: "View analysis", href: lead.links.redemptionLink },
  };
}

function DecisionColumn({ title, option }: { title: string; option?: SellVsTradeOption }) {
  if (!option) {
    return (
      <div className="border-t border-line pt-4">
        <p className="text-lg font-semibold tracking-tight">{title}</p>
        <p className="mt-3 text-sm leading-6 text-muted">Unavailable for this phone and condition.</p>
      </div>
    );
  }

  return (
    <Link href={option.href} className="block border-t border-line pt-4 transition hover:text-foreground">
      <p className="text-lg font-semibold tracking-tight">{title}</p>
      <p className="mt-3 text-3xl font-semibold tracking-[-0.04em]">{option.displayValue}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{option.subtitle}</p>
      <p className="mt-3 text-sm text-muted">{option.speed} · {option.effort} · {option.risk}</p>
      <p className="mt-2 text-xs text-muted">{option.confidenceLabel} · {option.freshnessLabel}</p>
    </Link>
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
