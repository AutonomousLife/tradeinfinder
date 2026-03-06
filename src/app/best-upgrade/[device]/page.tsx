import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComparisonBoard } from "@/components/comparison-board";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildUpgradeOptimizer, hasDeviceSlug } from "@/lib/engine";
import { devices } from "@/lib/seed-data";

type BestUpgradePageProps = {
  params: Promise<{ device: string }>;
};

export async function generateStaticParams() {
  return devices.map((device) => ({ device: device.slug }));
}

export async function generateMetadata({ params }: BestUpgradePageProps): Promise<Metadata> {
  const { device } = await params;
  return {
    title: `Best upgrade path from ${device}`,
    description: `Find the cleanest upgrade path starting from ${device}.`,
  };
}

export default async function BestUpgradePage({ params }: BestUpgradePageProps) {
  const { device } = await params;
  if (!hasDeviceSlug(device)) notFound();

  const model = buildUpgradeOptimizer({ currentDeviceSlug: device, targetDeviceSlug: "iphone-16-pro-256", condition: "good" });
  if (!model.boards.length) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Best upgrade" title={`Best upgrade path from ${model.inputs.currentDevice.brand} ${model.inputs.currentDevice.model}`} description="Simple store paths ranked by usable value, confidence, and resulting upgrade cost." />
      <ComparisonBoard scenarios={model.boards} />
    </PageShell>
  );
}
