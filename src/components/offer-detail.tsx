import Link from "next/link";

import { formatCurrency, formatRelativeDate } from "@/lib/format";
import type { OfferPageModel } from "@/lib/schema";

export function OfferDetail({ model }: { model: OfferPageModel }) {
  return (
    <div className="grid gap-8">
      <section className="grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="card rounded-[2rem] p-8">
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">Offer detail</p>
          <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{model.offer.merchant.name}</h1>
          <p className="mt-4 text-lg leading-8 text-muted">{model.offer.merchant.name} offers {formatCurrency(model.offer.tradeInValue)} in {model.offer.valueType.replace("_", " ")} for compatible phones in supported condition.</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {model.tags.map((tag) => (
              <span key={tag} className="pill rounded-full px-3 py-1 text-xs text-muted">{tag}</span>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-8">
          <h2 className="text-2xl font-semibold tracking-tight">Offer signals</h2>
          <div className="mt-5 grid gap-3">
            <Signal label="Last verified" value={formatRelativeDate(model.offer.lastVerifiedAt)} />
            <Signal label="Confidence" value={model.offer.confidenceLabel} />
            <Signal label="Source type" value={model.offer.sourceType} />
            <Signal label="Value timing" value={model.creditTimeline} />
          </div>
        </div>
      </section>
      <section className="card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">Fine print summary</h2>
        <p className="mt-4 text-base leading-7 text-muted">{model.offer.finePrintSummary}</p>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <div className="rounded-[1.4rem] border border-line bg-panel p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">Accepted trade-ins</p>
            <p className="mt-2 text-sm leading-6">{model.acceptedDevices}</p>
          </div>
          <div className="rounded-[1.4rem] border border-line bg-panel p-4">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">How to think about it</p>
            <p className="mt-2 text-sm leading-6">{model.acquisitionSummary}</p>
          </div>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href={model.primaryPath.links.redemptionLink} className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">{model.primaryPath.links.redemptionLabel}</Link>
          <Link href={`/trade-in/${model.primaryPath.device.slug}/${model.primaryPath.merchant.slug}`} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">View example device path</Link>
        </div>
      </section>
    </div>
  );
}

function Signal({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.2rem] border border-line bg-panel p-4">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold">{value}</p>
    </div>
  );
}
