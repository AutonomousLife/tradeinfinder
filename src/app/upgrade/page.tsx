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
  description:
    "Compare direct upgrades, low-risk paths, and arbitrage paths to lower the real cost of a new phone.",
};

type UpgradePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function UpgradePage({ searchParams }: UpgradePageProps) {
  const resolved = (await searchParams) ?? {};
  const sortBy = (getSearchParam(resolved.sortBy, "best-net") ?? "best-net") as
    | "best-net"
    | "highest-credit"
    | "lowest-risk"
    | "highest-confidence"
    | "instant";
  const model = buildUpgradeOptimizer({
    currentDeviceSlug: getSearchParam(resolved.currentDevice, "iphone-13-128") ?? "iphone-13-128",
    targetDeviceSlug: getSearchParam(resolved.targetDevice, "iphone-16-pro-256") ?? "iphone-16-pro-256",
    condition: getSearchParam(resolved.condition, "good") ?? "good",
    merchantSlug: getSearchParam(resolved.merchant),
    allowIntermediate: getSearchParam(resolved.allowIntermediate, "true") === "true",
    excludeNewLine: getSearchParam(resolved.excludeNewLine) === "true",
    unlockedOnly: getSearchParam(resolved.unlockedOnly) === "true",
    sortBy,
  });

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Upgrade path optimizer"
        title="Optimize the move from your old phone to the next one."
        description="TradeInFinder compares direct trade-ins, lower-risk unlocked paths, and buy-first arbitrage scenarios using the same scoring model."
      />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <QuickStartForm
          devices={devices}
          merchants={merchants}
          defaultCurrentDevice={model.inputs.currentDevice.slug}
          defaultTargetDevice={model.inputs.targetDevice.slug}
          defaultMerchant={model.inputs.merchant?.slug}
          defaultCondition={model.inputs.condition}
          defaultSortBy={sortBy}
          defaultExcludeNewLine={getSearchParam(resolved.excludeNewLine) === "true"}
          defaultUnlockedOnly={getSearchParam(resolved.unlockedOnly) === "true"}
          mode="upgrade"
        />
        <ComparisonBoard scenarios={model.boards} />
      </div>
    </PageShell>
  );
}

