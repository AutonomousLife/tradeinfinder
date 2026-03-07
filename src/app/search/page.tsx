import { Metadata } from "next";

import { FinderResults } from "@/components/finder-results";
import { PageShell } from "@/components/page-shell";
import { QuickStartForm } from "@/components/quick-start-form";
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
    <PageShell className="gap-10 pb-24 pt-10 sm:gap-12">
      <section className="grid gap-8 xl:grid-cols-[320px_1fr] xl:items-start">
        <QuickStartForm devices={devices} merchants={merchants} defaultCurrentDevice={finder.inputs.currentDevice.slug} defaultTargetDevice={finder.inputs.targetDevice?.slug} defaultMerchant={finder.inputs.merchant?.slug} defaultCondition={finder.inputs.condition} mode="finder" />
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Search result</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{finder.inputs.currentDevice.model}</h1>
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            One page, three answers: best direct trade-in, whether selling is worth it, and the cleanest simple upgrade path.
          </p>
          <div className="mt-8">
            <FinderResults model={finder} />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
