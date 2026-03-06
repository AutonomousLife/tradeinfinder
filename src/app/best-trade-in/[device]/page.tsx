import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinderResults } from "@/components/finder-results";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildTradeInFinder, hasDeviceSlug } from "@/lib/engine";
import { devices } from "@/lib/seed-data";

type BestTradeInPageProps = {
  params: Promise<{ device: string }>;
};

export async function generateStaticParams() {
  return devices.map((device) => ({ device: device.slug }));
}

export async function generateMetadata({
  params,
}: BestTradeInPageProps): Promise<Metadata> {
  const { device } = await params;
  return {
    title: `Best trade-in for ${device}`,
    description: `Compare the best direct trade-in value and strongest store options for ${device}.`,
  };
}

export default async function BestTradeInPage({ params }: BestTradeInPageProps) {
  const { device } = await params;

  if (!hasDeviceSlug(device)) {
    notFound();
  }

  const model = buildTradeInFinder({
    currentDeviceSlug: device,
    condition: "good",
  });

  if (!model.paths.length) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Best trade-in"
        title={`Best trade-in value for ${model.inputs.currentDevice.brand} ${model.inputs.currentDevice.model}`}
        description="Ranked direct trade-in outcomes with source, freshness, confidence, and resale context." 
      />
      <FinderResults model={model} />
    </PageShell>
  );
}
