import { Metadata } from "next";

import { DashboardView } from "@/components/dashboard-view";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildDashboardModel } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Dashboard foundation for saved scenarios, watched devices, recent searches, and future alerting.",
};

export default function DashboardPage() {
  const model = buildDashboardModel();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Dashboard"
        title="Saved scenarios and watchlist groundwork."
        description="This foundation is ready for Supabase auth, persisted saved searches, watched-device alerts, and offer change notifications."
      />
      <DashboardView model={model} />
    </PageShell>
  );
}
