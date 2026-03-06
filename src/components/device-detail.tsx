import Link from "next/link";

import { ChartPanel } from "@/components/chart-panel";
import { PathCard } from "@/components/path-card";
import type { DevicePageModel } from "@/lib/schema";

export function DeviceDetail({ model }: { model: DevicePageModel }) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card rounded-[2rem] p-8">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            Device detail
          </p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">
            {model.device.brand} {model.device.model}
          </h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">
            Current trade-in values by merchant, ranked upgrade targets, and
            arbitrage routes if a cheaper acquisition phone can outperform using
            your own device.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {model.device.storageVariants.map((storage) => (
              <span key={storage} className="pill rounded-full px-3 py-1 text-xs text-muted">
                {storage}
              </span>
            ))}
          </div>
        </div>
        <ChartPanel
          title="Merchant value spread"
          description="Headline trade-in value adjusted by delay and risk."
          data={model.chart}
        />
      </section>
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Top trade-in paths</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {model.paths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>
      <section className="card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Related pages</h2>
        <div className="mt-5 flex flex-wrap gap-3">
          {model.relatedLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-white"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
