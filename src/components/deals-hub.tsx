import { PathCard } from "@/components/path-card";
import type { DealsHubModel } from "@/lib/schema";

export function DealsHub({ model }: { model: DealsHubModel }) {
  return (
    <div className="grid gap-8">
      {model.sections.map((section) => (
        <section key={section.title}>
          <div className="mb-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-accent">
              {section.eyebrow}
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight">
              {section.title}
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
              {section.description}
            </p>
          </div>
          <div className="grid gap-5 lg:grid-cols-3">
            {section.paths.map((path) => (
              <PathCard key={path.slug} path={path} />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
