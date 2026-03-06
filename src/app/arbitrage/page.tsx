import { Metadata } from "next";

import { ArbitrageBoard } from "@/components/arbitrage-board";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildArbitrageExplorer } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Arbitrage Finder",
  description: "Find clean buy-low, trade-high opportunities using direct-value store offers.",
};

export default function ArbitragePage() {
  const model = buildArbitrageExplorer();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Arbitrage finder" title="Where buying a used phone first still makes sense" description="These paths are secondary to the main product, but they are still useful when a cheap used phone can unlock a much better direct store value." />
      <ArbitrageBoard model={model} />
    </PageShell>
  );
}
