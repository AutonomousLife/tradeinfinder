import { Metadata } from "next";

import { ComparisonBoard } from "@/components/comparison-board";
import { PageShell } from "@/components/page-shell";
import { QuickStartForm } from "@/components/quick-start-form";
import { SectionHeading } from "@/components/section-heading";
import { buildUpgradeOptimizer } from "@/lib/engine";
import { devices, merchants } from "@/lib/seed-data";
import { getSearchParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Upgrade Optimizer",
  description: "Compare simple upgrade paths using direct trade-in credit, store credit, and clean checkout value.",
};

type UpgradePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const resolved = (await searchParams) ?? {};
  const sortBy = (getSearchParam(resolved.sortBy, "best-upgrade") ?? "best-upgrade") as "highest-value" | "easiest" | "best-upgrade" | "highest-confidence" | "newest";
  const model = buildUpgradeOptimizer({
    currentDeviceSlug: getSearchParam(resolved.currentDevice, "iphone-13-128") ?? "iphone-13-128",
    targetDeviceSlug: getSearchParam(resolved.targetDevice, "iphone-16-pro-256") ?? "iphone-16-pro-256",
    condition: (getSearchParam(resolved.condition, "good") ?? "good") as "mint" | "good" | "fair" | "cracked",
    merchantSlug: getSearchParam(resolved.merchant),
    sortBy,
  });

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Upgrade optimizer" title="See the cleanest path from your current phone to the next one." description="TradeInFinder focuses on store credit, direct checkout value, and simple upgrade math so the recommendation is actually understandable." />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <QuickStartForm devices={devices} merchants={merchants} defaultCurrentDevice={model.inputs.currentDevice.slug} defaultTargetDevice={model.inputs.targetDevice.slug} defaultMerchant={model.inputs.merchant?.slug} defaultCondition={model.inputs.condition} defaultSortBy={sortBy} mode="upgrade" />
        <ComparisonBoard scenarios={model.boards} />
      </div>
    </PageShell>
  );
}
