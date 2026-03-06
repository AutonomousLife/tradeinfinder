import { PathCard } from "@/components/path-card";
import { SectionHeading } from "@/components/section-heading";
import type { ArbitrageExplorerModel } from "@/lib/schema";

export function ArbitrageBoard({ model }: { model: ArbitrageExplorerModel }) {
  return (
    <div className="grid gap-6">
      <div className="grid gap-4 md:grid-cols-3">
        {model.summary.map((item) => (
          <div key={item.label} className="card rounded-[1.6rem] p-5">
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted">
              {item.label}
            </p>
            <p className="mt-3 text-2xl font-semibold tracking-tight">{item.value}</p>
            <p className="mt-1 text-sm text-muted">{item.copy}</p>
          </div>
        ))}
      </div>
      <section>
        <SectionHeading
          eyebrow="Ranked spreads"
          title="The strongest buy-first opportunities in the current dataset"
          description="Arbitrage only appears when an acquisition source and an eligible merchant offer create a positive spread after bill-credit and risk adjustments."
        />
        <div className="mt-6 grid gap-5 lg:grid-cols-3">
          {model.paths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>
    </div>
  );
}
