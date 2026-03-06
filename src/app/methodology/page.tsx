import { Metadata } from "next";

import { MethodologyView } from "@/components/methodology-view";
import { PageShell } from "@/components/page-shell";
import { buildMethodologyModel } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Methodology",
  description:
    "How TradeInFinder scores offers, handles confidence, caveats, timestamps, and seeded vs dynamic data.",
};

export default function MethodologyPage() {
  const model = buildMethodologyModel();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <MethodologyView model={model} />
    </PageShell>
  );
}
