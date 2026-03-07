import { StoreScorecard } from "@/components/store-scorecard";
import type { DealsHubModel } from "@/lib/schema";

export function DealsHub({ model }: { model: DealsHubModel }) {
  return (
    <div className="grid gap-10">
      {model.sections.map((section) => (
        <section key={section.title} className="card rounded-[2rem] p-6 sm:p-8">
          <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">{section.eyebrow}</p>
              <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em]">{section.title}</h2>
              <p className="mt-4 max-w-xl text-base leading-7 text-muted">{section.description}</p>
            </div>
            <div>
              {section.paths.map((path, index) => (
                <StoreScorecard key={path.slug} path={path} rank={index + 1} />
              ))}
            </div>
          </div>
        </section>
      ))}
    </div>
  );
}
