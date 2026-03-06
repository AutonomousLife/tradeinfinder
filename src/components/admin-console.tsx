import type { AdminModel } from "@/lib/schema";

export function AdminConsole({ model }: { model: AdminModel }) {
  return (
    <div className="grid gap-6">
      <section className="grid gap-4 md:grid-cols-4">
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
          <h2 className="text-2xl font-semibold tracking-tight">Data collections</h2>
          <div className="mt-5 space-y-4">
            {model.collections.map((collection) => (
              <div
                key={collection.title}
                className="rounded-[1.4rem] border border-line bg-white/65 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-semibold">{collection.title}</p>
                    <p className="mt-1 text-sm text-muted">{collection.copy}</p>
                  </div>
                  <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
                    {collection.count}
                  </span>
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
    </div>
  );
}
