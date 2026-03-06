import { Metadata } from "next";

import { DealsHub } from "@/components/deals-hub";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildDealsHub } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Best Trade-In Deals",
  description:
    "Browse the strongest trade-in deals right now by brand, offer type, and effective value.",
};

export default function DealsPage() {
  const model = buildDealsHub();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Best deals"
        title="Ranked trade-in deals with the lock-in caveats visible."
        description="Highlights for iPhone, Samsung, Pixel, instant-value offers, and promos expiring soon."
      />
      <DealsHub model={model} />
    </PageShell>
  );
}
