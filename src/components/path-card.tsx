import Link from "next/link";

import { formatPercent } from "@/lib/format";
import type { RankedPath } from "@/lib/schema";

export function PathCard({ path }: { path: RankedPath }) {
  return (
    <article className="card rounded-[1.8rem] p-5 sm:p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">{path.reasonBadge}</p>
          <h3 className="mt-3 text-2xl font-semibold tracking-tight">{path.merchant.name}</h3>
          <p className="mt-3 max-w-xl text-sm leading-6 text-muted">{path.summary}</p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-[0.18em] text-muted">Shown value</p>
          <p className="mt-2 text-3xl font-semibold tracking-[-0.04em]">{path.resolvedValue.displayValue}</p>
        </div>
      </div>

      <dl className="mt-6 grid gap-4 sm:grid-cols-3">
        <Info label="Type" value={path.offer.valueType.replace(/_/g, " ")} />
        <Info label="Updated" value={path.resolvedValue.freshnessLabel} />
        <Info label="Confidence" value={`${formatPercent(path.confidence)} · ${path.resolvedValue.confidenceLabel}`} />
      </dl>

      <p className="mt-6 max-w-2xl text-sm leading-6 text-muted">
        <span className="font-semibold text-foreground">Why it shows:</span> {path.resolvedValue.whyValue}
      </p>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-muted">
        <span className="font-semibold text-foreground">Caveat:</span> {path.biggestCaveat}
      </p>

      <div className="mt-6 flex flex-wrap gap-3">
        {path.links.redemptionAffiliateLink ? (
          <a href={path.links.redemptionAffiliateLink} target="_blank" rel="noreferrer" className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">
            Open {path.merchant.name}
          </a>
        ) : (
          <Link href={path.links.redemptionLink} className="inline-flex rounded-full bg-accent px-4 py-2 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">
            {path.links.redemptionLabel}
          </Link>
        )}
        <Link href={path.links.redemptionLink} className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">
          View analysis
        </Link>
        <Link href={`/offer/${path.offer.slug}`} className="inline-flex rounded-full border border-line px-4 py-2 text-sm font-semibold text-muted transition hover:bg-surface hover:text-foreground">
          Offer detail
        </Link>
      </div>
    </article>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-t border-line pt-3">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-sm font-semibold text-foreground">{value}</p>
    </div>
  );
}
