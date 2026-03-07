import { Metadata } from "next";

import { DealsHub } from "@/components/deals-hub";
import { PageShell } from "@/components/page-shell";
import { buildDealsHub } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Best Trade-In Deals",
  description: "Browse the strongest direct trade-in and simple upgrade values right now.",
};

export default function DealsPage() {
  const model = buildDealsHub();

  return (
    <PageShell className="gap-10 pb-24 pt-10 sm:gap-12">
      <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Deals</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">Best direct trade-in and upgrade values right now.</h1>
        </div>
        <p className="max-w-2xl text-base leading-7 text-muted">This page is intentionally narrow: direct trade-in value, clean upgrade usefulness, and high-confidence store paths without telecom promo clutter.</p>
      </section>
      <DealsHub model={model} />
    </PageShell>
  );
}
