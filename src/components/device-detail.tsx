import Link from "next/link";

import { PathCard } from "@/components/path-card";
import type { DevicePageModel } from "@/lib/schema";

export function DeviceDetail({ model }: { model: DevicePageModel }) {
  const directPaths = model.paths.slice(0, 3);
  const resale = model.sellVsTrade.options.find((option) => option.type === "resale");
  const trade = model.sellVsTrade.options.find((option) => option.type === "trade_in");
  const upgrade = model.sellVsTrade.options.find((option) => option.type === "upgrade");
  const upgradePath = model.paths[0];

  return (
    <div className="grid gap-8">
      <section className="card rounded-[2rem] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">Device detail</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{model.device.brand} {model.device.model}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">Everything important for this phone in one place: best direct trade-in, resale alternative, and the cleanest upgrade path.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-3">
          {model.sellVsTrade.summary.map((item) => (
            <div key={item.label} className="rounded-[1.2rem] border border-line bg-panel p-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{item.label}</p>
              <p className="mt-2 text-xl font-semibold">{item.value}</p>
              <p className="mt-1 text-sm text-muted">{item.copy}</p>
            </div>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Best direct trade-in</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {directPaths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        <div className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Sell vs trade</h2>
          <p className="mt-3 text-sm leading-6 text-muted">{model.sellVsTrade.recommendation.title}: {model.sellVsTrade.recommendation.copy}</p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {[trade, resale].filter(Boolean).map((option) => (
              <Link key={option!.slug} href={option!.href} className="rounded-[1.3rem] border border-line bg-panel p-4 transition hover:border-accent/50">
                <p className="font-semibold text-foreground">{option!.title}</p>
                <p className="mt-2 text-2xl font-semibold tracking-tight">{option!.displayValue}</p>
                <p className="mt-1 text-sm text-muted">{option!.subtitle}</p>
                <p className="mt-3 text-xs text-muted">{option!.confidenceLabel} &middot; {option!.freshnessLabel}</p>
              </Link>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6">
          <h2 className="text-2xl font-semibold tracking-tight">Best simple upgrade path</h2>
          {upgrade ? (
            <div className="mt-4 rounded-[1.3rem] border border-line bg-panel p-4">
              <p className="font-semibold text-foreground">{upgrade.title}</p>
              <p className="mt-1 text-sm text-muted">{upgrade.subtitle}</p>
              <p className="mt-3 text-2xl font-semibold tracking-tight">{upgrade.displayValue}</p>
              <p className="mt-2 text-sm text-muted">{upgrade.confidenceLabel} &middot; {upgrade.freshnessLabel}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <Link href={upgrade.href} className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">Open upgrade path</Link>
                {upgradePath?.links.redemptionAffiliateLink ? (
                  <a href={upgradePath.links.redemptionAffiliateLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">
                    Open {upgradePath.merchant.name}
                  </a>
                ) : null}
              </div>
            </div>
          ) : (
            <p className="mt-4 text-sm leading-6 text-muted">No target phone was selected for this device summary, so upgrade guidance is limited.</p>
          )}
          <div className="mt-6 flex flex-wrap gap-3">
            {model.relatedLinks.map((link) => (
              <Link key={link.href} href={link.href} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">{link.label}</Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
