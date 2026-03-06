import Link from "next/link";

import { ChartPanel } from "@/components/chart-panel";
import { PathCard } from "@/components/path-card";
import { formatCurrency } from "@/lib/format";
import type { DevicePageModel } from "@/lib/schema";

export function DeviceDetail({ model }: { model: DevicePageModel }) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card rounded-[2rem] p-8">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">Device detail</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{model.device.brand} {model.device.model}</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">See the best direct trade-in value, resale benchmark, and a clean upgrade recommendation without carrier promo clutter.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {model.device.storageVariants.map((storage) => (
              <span key={storage} className="pill rounded-full px-3 py-1 text-xs text-muted">{storage}</span>
            ))}
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {model.sellVsTrade.summary.map((item) => (
              <div key={item.label} className="rounded-[1.2rem] border border-line bg-panel p-4">
                <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{item.label}</p>
                <p className="mt-2 text-xl font-semibold">{item.value}</p>
                <p className="mt-1 text-sm text-muted">{item.copy}</p>
              </div>
            ))}
          </div>
        </div>
        <ChartPanel title="Trade-in vs resale spread" description="Direct store value is shown next to the current sell-it-yourself benchmark." data={model.chart} />
      </section>
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Top direct trade-in paths</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {model.paths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>
      <section className="card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Sell vs trade recommendation</h2>
        <p className="mt-3 text-sm leading-6 text-muted">{model.sellVsTrade.recommendation.title}: {model.sellVsTrade.recommendation.copy}</p>
        <div className="mt-5 flex flex-wrap gap-3">
          {model.relatedLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">{link.label}</Link>
          ))}
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {model.sellVsTrade.options.map((option) => (
            <div key={option.slug} className="rounded-[1.2rem] border border-line bg-panel p-4">
              <p className="font-semibold">{option.title}</p>
              <p className="mt-1 text-sm text-muted">{option.subtitle}</p>
              <p className="mt-3 text-2xl font-semibold">{formatCurrency(option.value)}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
