import Link from "next/link";

import type { DashboardModel } from "@/lib/schema";

export function DashboardView({ model }: { model: DashboardModel }) {
  return (
    <div className="grid gap-6">
      <section className="card rounded-[2rem] p-6 sm:p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">Dashboard</p>
        <h2 className="mt-3 text-3xl font-semibold tracking-tight">Save devices, watch value, and come back later.</h2>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-muted">This area is intended for signed-in users. Once connected, it will keep saved searches, watched phones, and alert settings in one place.</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <Link href="/search" className="rounded-full bg-accent px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Run a search</Link>
          <Link href="/methodology" className="rounded-full border border-line px-5 py-3 text-center text-sm font-semibold transition hover:bg-surface">How alerts work</Link>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {model.notificationHooks.map((hook) => (
          <div key={hook.title} className="card rounded-[1.6rem] p-5">
            <p className="font-semibold">{hook.title}</p>
            <p className="mt-2 text-sm leading-6 text-muted">{hook.copy}</p>
          </div>
        ))}
      </section>

      <section className="card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">What you will be able to track</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-3">
          <div className="rounded-[1.3rem] border border-line bg-panel p-4 text-sm leading-6">Saved trade-in searches for your current phone and condition.</div>
          <div className="rounded-[1.3rem] border border-line bg-panel p-4 text-sm leading-6">Watched device and store value changes.</div>
          <div className="rounded-[1.3rem] border border-line bg-panel p-4 text-sm leading-6">Expiring opportunities and cleaner upgrade reminders.</div>
        </div>
      </section>
    </div>
  );
}
