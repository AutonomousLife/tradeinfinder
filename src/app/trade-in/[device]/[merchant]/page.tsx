import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinderResults } from "@/components/finder-results";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildTradeInFinder } from "@/lib/engine";
import { devices, merchants } from "@/lib/seed-data";

type TradeInPageProps = {
  params: Promise<{ device: string; merchant: string }>;
};

export async function generateStaticParams() {
  return devices.flatMap((device) =>
    merchants.map((merchant) => ({ device: device.slug, merchant: merchant.slug })),
  );
}

export async function generateMetadata({
  params,
}: TradeInPageProps): Promise<Metadata> {
  const { device, merchant } = await params;
  return {
    title: `Trade in ${device} at ${merchant}`,
    description: `Compare the best trade-in path for ${device} at ${merchant}.`,
  };
}

export default async function TradeInLanding({ params }: TradeInPageProps) {
  const { device, merchant } = await params;
  const model = buildTradeInFinder({
    currentDeviceSlug: device,
    targetDeviceSlug: "iphone-16-pro-256",
    condition: "good",
    merchantSlug: merchant,
  });

  if (!model.paths.length) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Programmatic trade-in page"
        title={`Trade in ${model.inputs.currentDevice.brand} ${model.inputs.currentDevice.model} at ${model.inputs.merchant?.name ?? merchant}`}
        description="SEO-friendly landing page with ranked results, caveats, and upgrade suggestions."
      />
      <FinderResults model={model} />
    </PageShell>
  );
}
