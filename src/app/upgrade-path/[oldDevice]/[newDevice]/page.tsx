import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { ComparisonBoard } from "@/components/comparison-board";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildUpgradeOptimizer, hasDeviceSlug, hasMerchantSlug } from "@/lib/engine";
import { topUpgradeComparisons } from "@/lib/seed-data";
import { getSearchParam } from "@/lib/utils";

type UpgradePathPageProps = {
  params: Promise<{ oldDevice: string; newDevice: string }>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
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

export default async function UpgradePathPage({ params, searchParams }: UpgradePathPageProps) {
  const { oldDevice, newDevice } = await params;
  const resolvedSearch = (await searchParams) ?? {};
  const merchantParam = getSearchParam(resolvedSearch.merchant);
  const merchantSlug = merchantParam && hasMerchantSlug(merchantParam) ? merchantParam : undefined;

  if (!hasDeviceSlug(oldDevice) || !hasDeviceSlug(newDevice)) notFound();

  const model = buildUpgradeOptimizer({
    currentDeviceSlug: oldDevice,
    targetDeviceSlug: newDevice,
    condition: "good",
    merchantSlug,
  });
  if (!model.boards.length) notFound();

  const description = merchantSlug
    ? `Showing the ${model.inputs.merchant?.name ?? merchantSlug} path for this upgrade pair.`
    : "A comparison of ranked upgrade outcomes, effective cost, confidence, and simplicity.";

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Programmatic upgrade page" title={`Best upgrade path from ${model.inputs.currentDevice.model} to ${model.inputs.targetDevice.model}`} description={description} />
      <ComparisonBoard scenarios={model.boards} />
    </PageShell>
  );
}
