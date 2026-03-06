import { Metadata } from "next";

import { DealsHub } from "@/components/deals-hub";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildDealsHub } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Best Trade-In Deals",
  description: "Browse the strongest direct trade-in and simple upgrade values right now.",
};

export default function DealsPage() {
  const model = buildDealsHub();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Best deals" title="Ranked direct trade-in deals with clean value types" description="Highlights for immediate trade-in value, simple Samsung upgrades, and straightforward Pixel upgrade paths." />
      <DealsHub model={model} />
    </PageShell>
  );
}
