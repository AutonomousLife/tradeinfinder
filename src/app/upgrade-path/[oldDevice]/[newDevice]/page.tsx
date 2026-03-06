import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComparisonBoard } from "@/components/comparison-board";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildUpgradeOptimizer, hasDeviceSlug } from "@/lib/engine";
import { topUpgradeComparisons } from "@/lib/seed-data";

type UpgradePathPageProps = {
  params: Promise<{ oldDevice: string; newDevice: string }>;
};

export async function generateStaticParams() {
  return topUpgradeComparisons.map((comparison) => ({ oldDevice: comparison.oldDeviceSlug, newDevice: comparison.newDeviceSlug }));
}

export async function generateMetadata({ params }: UpgradePathPageProps): Promise<Metadata> {
  const { oldDevice, newDevice } = await params;
  return {
    title: `Best upgrade path from ${oldDevice} to ${newDevice}`,
    description: `Compare simple upgrade paths from ${oldDevice} to ${newDevice}.`,
  };
}

export default async function UpgradePathPage({ params }: UpgradePathPageProps) {
  const { oldDevice, newDevice } = await params;
  if (!hasDeviceSlug(oldDevice) || !hasDeviceSlug(newDevice)) notFound();

  const model = buildUpgradeOptimizer({ currentDeviceSlug: oldDevice, targetDeviceSlug: newDevice, condition: "good" });
  if (!model.boards.length) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Programmatic upgrade page" title={`Best upgrade path from ${model.inputs.currentDevice.model} to ${model.inputs.targetDevice.model}`} description="A comparison of ranked upgrade outcomes, effective cost, confidence, and simplicity." />
      <ComparisonBoard scenarios={model.boards} />
    </PageShell>
  );
}
