import { Metadata } from "next";

import { ArbitrageBoard } from "@/components/arbitrage-board";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildArbitrageExplorer } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Arbitrage Finder",
  description:
    "Find used-phone buy-and-trade spreads where acquisition cost sits below trade-in credit value.",
};

export default function ArbitragePage() {
  const model = buildArbitrageExplorer();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Arbitrage finder"
        title="Where buying a used trade-in phone first still wins."
        description="Each opportunity shows estimated buy cost, trade-in value, lock-in drag, confidence, and the biggest caveat before you click out."
      />
      <ArbitrageBoard model={model} />
    </PageShell>
  );
}
