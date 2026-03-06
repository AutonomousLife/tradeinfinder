import type { MethodologyModel } from "@/lib/schema";

export function MethodologyView({ model }: { model: MethodologyModel }) {
  return (
    <div className="grid gap-8">
      <div className="max-w-4xl">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
          Methodology
        </p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
          Data transparency and ranking logic.
        </h1>
        <p className="mt-4 text-lg leading-8 text-muted">
          TradeInFinder is deliberately honest about what is verified, what is
          estimated, and what still depends on future ingestion. Seeded data is
          realistic, but the UI keeps freshness, confidence, and caveats visible.
        </p>
      </div>
      <div className="grid gap-6 lg:grid-cols-2">
        {model.sections.map((section) => (
          <section key={section.title} className="card rounded-[2rem] p-6">
            <h2 className="text-2xl font-semibold tracking-tight">{section.title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted">{section.copy}</p>
            <div className="mt-5 space-y-3">
              {section.points.map((point) => (
                <div
                  key={point}
                  className="rounded-[1.3rem] border border-line bg-white/65 p-4 text-sm leading-6"
                >
                  {point}
                </div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
