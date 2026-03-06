import Link from "next/link";

import { formatCurrency, formatPercent, formatRelativeDate } from "@/lib/format";
import type { RankedPath } from "@/lib/schema";

export function PathCard({ path }: { path: RankedPath }) {
  return (
    <article className="card rounded-[1.8rem] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">
            {path.label}
          </p>
          <h3 className="mt-2 text-xl font-semibold tracking-tight">
            {path.offer.targetDevice}
          </h3>
        </div>
        <span className="rounded-full bg-accent-soft px-3 py-1 text-xs font-semibold text-accent">
          {path.reasonBadge}
        </span>
      </div>
      <div className="mt-5 grid gap-4 rounded-[1.4rem] border border-line bg-white/60 p-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Step 1
          </p>
          <p className="mt-1 font-semibold">
            {path.acquisition?.title ?? "Use current phone"}
          </p>
          <p className="text-sm text-muted">
            {path.acquisition
              ? `${formatCurrency(path.acquisition.estimatedPrice)} acquisition cost`
              : "No buy-first requirement"}
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Step 2
          </p>
          <p className="mt-1 font-semibold">{path.merchant.name}</p>
          <p className="text-sm text-muted">
            {formatCurrency(path.offer.tradeInValue)}{" "}
            {path.offer.tradeInType.replace("_", " ")}
          </p>
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted">
            Step 3
          </p>
          <p className="mt-1 text-2xl font-semibold tracking-tight">
            {formatCurrency(path.netValue)}
          </p>
          <p className="text-sm text-muted">{path.biggestCaveat}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {path.tags.map((tag) => (
          <span key={tag} className="pill rounded-full px-3 py-1 text-xs text-muted">
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <Metric label="Net value" value={formatCurrency(path.netValue)} />
        <Metric label="Confidence" value={formatPercent(path.confidence)} />
        <Metric label="Updated" value={formatRelativeDate(path.offer.lastVerifiedAt)} />
      </div>
      <div className="mt-6 flex flex-wrap gap-3">
        {path.links.acquisitionLink ? (
          <Link
            href={path.links.acquisitionLink}
            className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-white/70"
          >
            {path.links.acquisitionLabel}
          </Link>
        ) : null}
        <Link
          href={path.links.redemptionLink}
          className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          {path.links.redemptionLabel}
        </Link>
      </div>
    </article>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1rem] border border-line bg-white/65 p-3">
      <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </p>
      <p className="mt-1 text-sm font-semibold">{value}</p>
    </div>
  );
}
