import Link from "next/link";

import type { DashboardModel } from "@/lib/schema";

export function DashboardView({ model }: { model: DashboardModel }) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-3">
        {model.summary.map((item) => (
          <div key={item.label} className="card rounded-[1.6rem] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {item.label}
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.copy}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Saved scenarios</h2>
          <div className="mt-5 space-y-4">
            {model.savedScenarios.map((scenario) => (
              <div
                key={scenario.id}
                className="rounded-[1.4rem] border border-line bg-white/65 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{scenario.title}</p>
                    <p className="mt-1 text-sm text-muted">{scenario.subtitle}</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    {scenario.status}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-6">{scenario.summary}</p>
              </div>
            ))}
          </div>
        </section>
        <section className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Notification hooks</h2>
          <div className="mt-5 space-y-4">
            {model.notificationHooks.map((hook) => (
              <div key={hook.title} className="rounded-[1.4rem] border border-line p-4">
                <p className="font-semibold">{hook.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{hook.copy}</p>
              </div>
            ))}
          </div>
          <Link
            href="/methodology"
            className="mt-6 inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-white"
          >
            Review alert methodology
          </Link>
        </section>
      </div>
    </div>
  );
}
