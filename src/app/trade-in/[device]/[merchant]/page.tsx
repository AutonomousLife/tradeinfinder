import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinderResults } from "@/components/finder-results";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildTradeInFinder, hasDeviceSlug, hasMerchantSlug } from "@/lib/engine";
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
    description: `Compare the best simple trade-in path for ${device} at ${merchant}.`,
  };
}

export default async function TradeInLanding({ params }: TradeInPageProps) {
  const { device, merchant } = await params;

  if (!hasDeviceSlug(device) || !hasMerchantSlug(merchant)) {
    notFound();
  }

  const merchantModel = buildTradeInFinder({
    currentDeviceSlug: device,
    condition: "good",
    merchantSlug: merchant,
  });
  const fallbackModel = buildTradeInFinder({
    currentDeviceSlug: device,
    condition: "good",
  });
  const model = merchantModel.paths.length ? merchantModel : fallbackModel;

  if (!model.paths.length) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Programmatic trade-in page"
        title={`Trade in ${model.inputs.currentDevice.brand} ${model.inputs.currentDevice.model}${model.inputs.merchant ? ` at ${model.inputs.merchant.name}` : ""}`}
        description={merchantModel.paths.length
          ? "Merchant-specific simple trade-in results with confidence and freshness signals."
          : `No current seeded trade-in value was available for ${merchant}. Showing the best available alternatives instead.`}
      />
      <FinderResults model={model} />
    </PageShell>
  );
}
