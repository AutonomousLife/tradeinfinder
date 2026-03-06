import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComparisonBoard } from "@/components/comparison-board";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildUpgradeOptimizer, hasDeviceSlug } from "@/lib/engine";
import { devices } from "@/lib/seed-data";

type UpgradeToPageProps = {
  params: Promise<{ targetDevice: string }>;
};

export async function generateStaticParams() {
  return devices.map((device) => ({ targetDevice: device.slug }));
}

export async function generateMetadata({ params }: UpgradeToPageProps): Promise<Metadata> {
  const { targetDevice } = await params;
  return {
    title: `Best upgrade paths to ${targetDevice}`,
    description: `See the strongest simple upgrade paths to ${targetDevice}.`,
  };
}

export default async function UpgradeToPage({ params }: UpgradeToPageProps) {
  const { targetDevice } = await params;
  if (!hasDeviceSlug(targetDevice)) notFound();
  const model = buildUpgradeOptimizer({ currentDeviceSlug: "iphone-13-128", targetDeviceSlug: targetDevice, condition: "good" });
  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Upgrade destination" title={`Best simple upgrade paths to ${model.inputs.targetDevice.model}`} description="These routes prioritize direct store value, confidence, and understandable final cost." />
      <ComparisonBoard scenarios={model.boards} />
    </PageShell>
  );
}
