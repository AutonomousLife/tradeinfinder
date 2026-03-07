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
  description: "Find the best direct trade-in value, compare it with resale, and see the cleanest upgrade path.",
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = (await searchParams) ?? {};
  const targetDevice = getSearchParam(resolved.targetDevice) || undefined;
  const condition = (getSearchParam(resolved.condition, "good") ?? "good") as "good" | "damaged" | "poor";
  const finder = buildTradeInFinder({
    currentDeviceSlug: getSearchParam(resolved.currentDevice, "iphone-13-128") ?? "iphone-13-128",
    targetDeviceSlug: targetDevice,
    condition,
    merchantSlug: getSearchParam(resolved.merchant),
    sortBy: "highest-value",
  });

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Trade-in finder" title="One search, three answers" description="TradeInFinder now focuses on the three things most people actually need: the best direct trade-in, the resale alternative, and the best simple upgrade path." />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <QuickStartForm devices={devices} merchants={merchants} defaultCurrentDevice={finder.inputs.currentDevice.slug} defaultTargetDevice={finder.inputs.targetDevice?.slug} defaultMerchant={finder.inputs.merchant?.slug} defaultCondition={finder.inputs.condition} mode="finder" />
        <FinderResults model={finder} />
      </div>
    </PageShell>
  );
}
