import { Metadata } from "next";

import { AdminConsole } from "@/components/admin-console";
import { PageShell } from "@/components/page-shell";
import { SectionHeading } from "@/components/section-heading";
import { buildAdminModel } from "@/lib/engine";

export const metadata: Metadata = {
  title: "Admin",
  description:
    "Admin foundation for CRUD, confidence overrides, raw ingest inspection, and stale-offer controls.",
};

export default function AdminPage() {
  const model = buildAdminModel();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <SectionHeading
        eyebrow="Admin"
        title="Operational tooling for offer quality and ingestion."
        description="A production path would protect this surface with auth and roles. The UI here exposes the intended operational model."
      />
      <AdminConsole model={model} />
    </PageShell>
  );
}
