import { Metadata } from "next";

import { ChartPanel } from "@/components/chart-panel";
import { PageShell } from "@/components/page-shell";
import { QuickStartForm } from "@/components/quick-start-form";
import { SectionHeading } from "@/components/section-heading";
import { buildSellVsTradeModel } from "@/lib/engine";
import { formatCurrency, formatPercent } from "@/lib/format";
import { devices, merchants } from "@/lib/seed-data";
import { getSearchParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Sell vs Trade",
  description: "See whether you should trade your phone in or sell it yourself based on value, effort, and speed.",
};

type SellVsTradePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SellVsTradePage({ searchParams }: SellVsTradePageProps) {
  const resolved = (await searchParams) ?? {};
  const deviceSlug = getSearchParam(resolved.currentDevice, "iphone-13-128") ?? "iphone-13-128";
  const condition = (getSearchParam(resolved.condition, "good") ?? "good") as "mint" | "good" | "fair" | "cracked";
  const model = buildSellVsTradeModel(deviceSlug, condition);
  if (!model) return null;

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Sell vs trade" title={`Should you sell or trade your ${model.device.model}?`} description="This comparison balances direct store value against likely resale net after fees, then explains when simplicity is worth the trade-off." />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <QuickStartForm devices={devices} merchants={merchants} defaultCurrentDevice={model.device.slug} defaultCondition={condition} mode="finder" />
        <div className="grid gap-6">
          <section className="grid gap-4 md:grid-cols-3">
            {model.summary.map((item) => (
              <div key={item.label} className="card rounded-[1.6rem] p-5"><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{item.label}</p><p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p><p className="mt-1 text-sm text-muted">{item.copy}</p></div>
            ))}
          </section>
          <section className="card rounded-[2rem] p-6"><h2 className="text-2xl font-semibold tracking-tight">Recommendation</h2><p className="mt-3 text-sm leading-6 text-muted">{model.recommendation.title}</p><p className="mt-2 text-base leading-7">{model.recommendation.copy}</p></section>
          <ChartPanel title="Trade-in value vs resale net" description="Immediate store value next to likely sell-it-yourself net after fees." data={model.chart.map((item) => ({ label: item.label, instant: item.tradeIn, delayed: item.resale }))} />
          <div className="grid gap-4 lg:grid-cols-3">
            {model.options.map((option) => (
              <div key={option.slug} className="card rounded-[1.5rem] p-5"><p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">{option.label}</p><h3 className="mt-2 text-xl font-semibold">{option.title}</h3><p className="mt-1 text-sm text-muted">{option.subtitle}</p><p className="mt-4 text-3xl font-semibold">{formatCurrency(option.value)}</p><p className="mt-2 text-sm text-muted">{option.speed} · {option.effort} · {option.risk}</p><p className="mt-3 text-sm text-muted">Confidence {formatPercent(option.confidence)}</p></div>
            ))}
          </div>
        </div>
      </div>
    </PageShell>
  );
}
