import { Metadata } from "next";

import { FinderResults } from "@/components/finder-results";
import { PageShell } from "@/components/page-shell";
import { QuickStartForm } from "@/components/quick-start-form";
import { SectionHeading } from "@/components/section-heading";
import { buildTradeInFinder } from "@/lib/engine";
import { devices, merchants } from "@/lib/seed-data";
import { getSearchParam } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Trade-In Finder",
  description: "Compare direct trade-in value, gift card paths, store credit, and resale benchmarks for your phone.",
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = (await searchParams) ?? {};
  const valueType = (getSearchParam(resolved.valueType, "all") ?? "all") as "all" | "instant_credit" | "purchase_credit" | "store_credit" | "gift_card";
  const sortBy = (getSearchParam(resolved.sortBy, "highest-value") ?? "highest-value") as "highest-value" | "easiest" | "best-upgrade" | "highest-confidence" | "newest";
  const targetDevice = getSearchParam(resolved.targetDevice) || undefined;
  const condition = (getSearchParam(resolved.condition, "good") ?? "good") as "good" | "damaged" | "poor";
  const finder = buildTradeInFinder({
    currentDeviceSlug: getSearchParam(resolved.currentDevice, "iphone-13-128") ?? "iphone-13-128",
    targetDeviceSlug: targetDevice,
    condition,
    merchantSlug: getSearchParam(resolved.merchant),
    valueType,
    sortBy,
  });

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Trade-in finder" title="See the best immediate value for your current phone." description="Results compare direct store value against likely resale value so you can decide whether to trade in, sell, or upgrade with cleaner confidence signals." />
      <div className="grid gap-6 xl:grid-cols-[380px_1fr]">
        <QuickStartForm devices={devices} merchants={merchants} defaultCurrentDevice={finder.inputs.currentDevice.slug} defaultTargetDevice={finder.inputs.targetDevice?.slug} defaultMerchant={finder.inputs.merchant?.slug} defaultCondition={finder.inputs.condition} defaultSortBy={sortBy} defaultValueType={valueType} mode="finder" />
        <FinderResults model={finder} />
      </div>
    </PageShell>
  );
}

