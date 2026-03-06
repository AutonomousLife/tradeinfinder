import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ChartPanel } from "@/components/chart-panel";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildSellVsTradeModel, hasDeviceSlug } from "@/lib/engine";
import { formatCurrency } from "@/lib/format";
import { devices } from "@/lib/seed-data";

type ResaleVsTradePageProps = {
  params: Promise<{ device: string }>;
};

export async function generateStaticParams() {
  return devices.map((device) => ({ device: device.slug }));
}

export async function generateMetadata({ params }: ResaleVsTradePageProps): Promise<Metadata> {
  const { device } = await params;
  return {
    title: `Sell vs trade ${device}`,
    description: `Compare direct trade-in value with likely resale net for ${device}.`,
  };
}

export default async function ResaleVsTradePage({ params }: ResaleVsTradePageProps) {
  const { device } = await params;
  if (!hasDeviceSlug(device)) notFound();
  const model = buildSellVsTradeModel(device, "good");
  if (!model) notFound();
  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Resale vs trade" title={`Should you sell or trade ${model.device.model}?`} description="The chart and summary below show whether convenience or maximum dollars wins for this phone right now." />
      <div className="grid gap-4 md:grid-cols-3">
        {model.summary.map((item) => (
          <div key={item.label} className="card rounded-[1.6rem] p-5"><p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{item.label}</p><p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p><p className="mt-1 text-sm text-muted">{item.copy}</p></div>
        ))}
      </div>
      <ChartPanel title="Trade vs resale" description="Direct store value compared with likely resale net after fees." data={model.chart.map((item) => ({ label: item.label, instant: item.tradeIn, delayed: item.resale }))} />
      <section className="card rounded-[2rem] p-6"><h2 className="text-2xl font-semibold tracking-tight">Recommendation</h2><p className="mt-3 text-base leading-7">{model.recommendation.title}</p><p className="mt-2 text-sm leading-6 text-muted">{model.recommendation.copy}</p><div className="mt-6 grid gap-4 md:grid-cols-3">{model.options.map((option) => <div key={option.slug} className="rounded-[1.2rem] border border-line bg-panel p-4"><p className="font-semibold">{option.title}</p><p className="mt-1 text-sm text-muted">{option.subtitle}</p><p className="mt-3 text-2xl font-semibold">{formatCurrency(option.value)}</p></div>)}</div></section>
    </PageShell>
  );
}
