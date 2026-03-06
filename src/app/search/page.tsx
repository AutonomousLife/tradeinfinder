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
  description:
    "Rank phone trade-in offers by instant value, promo value, bill credit drag, requirements, and confidence.",
};

type SearchPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const resolved = (await searchParams) ?? {};
  const finder = buildTradeInFinder({
    currentDeviceSlug:
      getSearchParam(resolved.currentDevice, "iphone-13-128") ?? "iphone-13-128",
    targetDeviceSlug:
      getSearchParam(resolved.targetDevice, "iphone-16-pro-256") ??
      "iphone-16-pro-256",
    condition: getSearchParam(resolved.condition, "good") ?? "good",
    merchantSlug: getSearchParam(resolved.merchant),
  });

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Trade-in value finder"
        title="See the highest real value for your current phone."
        description="The finder separates instant cash, store credit, promotional trade-ins, and bill-credit offers so the top result is explainable instead of opaque."
      />
      <div className="grid gap-6 xl:grid-cols-[360px_1fr]">
        <QuickStartForm
          devices={devices}
          merchants={merchants}
          defaultCurrentDevice={finder.inputs.currentDevice.slug}
          defaultTargetDevice={finder.inputs.targetDevice.slug}
          defaultMerchant={finder.inputs.merchant?.slug}
          defaultCondition={finder.inputs.condition}
          mode="finder"
        />
        <FinderResults model={finder} />
      </div>
    </PageShell>
  );
}
