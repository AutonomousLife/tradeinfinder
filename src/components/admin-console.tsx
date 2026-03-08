import type { AdminModel } from "@/lib/schema";

export function AdminConsole({ model }: { model: AdminModel }) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
        {model.summary.map((item) => (
          <div key={item.label} className="card rounded-[1.6rem] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">{item.label}</p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.copy}</p>
          </div>
        ))}
      </section>
      <div className="grid gap-6 xl:grid-cols-[1.1fr_0.9fr]">
        <section className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Data collections</h2>
          <div className="mt-5 space-y-4">
            {model.collections.map((collection) => (
              <div key={collection.title} className="rounded-[1.4rem] border border-line bg-panel p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{collection.title}</p>
                    <p className="mt-1 text-sm text-muted">{collection.copy}</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">{collection.count}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
        <section className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Ops actions</h2>
          <div className="mt-5 space-y-4">
            {model.actions.map((action) => (
              <div key={action.title} className="rounded-[1.4rem] border border-line p-4">
                <p className="font-semibold">{action.title}</p>
                <p className="mt-1 text-sm leading-6 text-muted">{action.copy}</p>
              </div>
            ))}
          </div>
        </section>
      </div>
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Inspector</h2>
          <div className="mt-5 space-y-4">
            {model.inspectors.map((item) => (
              <div key={item.title} className="rounded-[1.4rem] border border-line bg-panel p-4 text-sm">
                <p className="font-semibold text-foreground">{item.title}</p>
                <p className="mt-2 text-muted">Raw source: {item.rawSource}</p>
                <p className="mt-1 text-muted">Normalized value: {item.normalizedValue}</p>
                <p className="mt-1 text-muted">Confidence: {item.confidence}</p>
                <p className="mt-1 text-muted">Fallback: {item.fallback}</p>
                <p className="mt-1 text-muted">Stale: {item.stale}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Manual overrides</h2>
          <div className="mt-5 space-y-4">
            {model.overrides.map((override) => (
              <div key={override.title} className="rounded-[1.4rem] border border-line bg-panel p-4 text-sm">
                <p className="font-semibold text-foreground">{override.title}</p>
                <p className="mt-1 text-muted">{override.status}</p>
                <p className="mt-2 text-muted">{override.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="grid gap-6 xl:grid-cols-2">
        <div className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Quote runs</h2>
          <div className="mt-5 space-y-4">
            {(model.quoteRuns ?? []).map((run) => (
              <div key={run.title} className="rounded-[1.4rem] border border-line bg-panel p-4 text-sm">
                <p className="font-semibold text-foreground">{run.title}</p>
                <p className="mt-1 text-muted">{run.status}</p>
                <p className="mt-2 text-muted">{run.note}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Quote jobs</h2>
          <div className="mt-5 space-y-4">
            {(model.quoteJobs ?? []).map((job) => (
              <div key={job.title} className="rounded-[1.4rem] border border-line bg-panel p-4 text-sm">
                <p className="font-semibold text-foreground">{job.title}</p>
                <p className="mt-1 text-muted">{job.status}</p>
                <p className="mt-2 text-muted">{job.note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}