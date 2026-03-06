import { Metadata } from "next";

import { DashboardView } from "@/components/dashboard-view";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildDashboardModel } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Save searches, watch value changes, and manage alerts in one place.",
};

export default function DashboardPage() {
  const model = buildDashboardModel();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading eyebrow="Dashboard" title="A cleaner place for saved phones and alerts" description="This page is kept intentionally simple until sign-in and persistence are connected." />
      <DashboardView model={model} />
    </PageShell>
  );
}
