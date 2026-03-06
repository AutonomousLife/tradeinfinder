import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { FinderResults } from "@/components/finder-results";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildTradeInFinder } from "@/lib/engine";
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
    description: `Compare the best trade-in value and strongest upgrade deals for ${device}.`,
  };
}

export default async function BestTradeInPage({ params }: BestTradeInPageProps) {
  const { device } = await params;
  const model = buildTradeInFinder({
    currentDeviceSlug: device,
    targetDeviceSlug: "iphone-16-pro-256",
    condition: "good",
  });

  if (!model.paths.length) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Best trade-in"
        title={`Best trade-in value for ${model.inputs.currentDevice.brand} ${model.inputs.currentDevice.model}`}
        description="Ranked direct and promotional outcomes with requirement tags and confidence scoring."
      />
      <FinderResults model={model} />
    </PageShell>
  );
}
