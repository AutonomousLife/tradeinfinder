import Link from "next/link";

import { StoreScorecard } from "@/components/store-scorecard";
import { VerdictCard } from "@/components/verdict-card";
import type { MerchantPageModel } from "@/lib/schema";

export function MerchantDetail({ model }: { model: MerchantPageModel }) {
  const lead = model.paths[0];
  const averageConfidence = model.paths.length
    ? `${Math.round((model.paths.reduce((sum, path) => sum + path.confidence, 0) / model.paths.length) * 100)}%`
    : "Unavailable";

  return (
    <div className="grid gap-10">
      <VerdictCard
        eyebrow="Store guide"
        title={`${model.merchant.name} at a glance`}
        summary={model.merchant.notes}
        valueLabel="Store score"
        value={`${Math.round(model.merchant.trustScore * 100)}%`}
        rationale={lead ? `${lead.merchant.name} currently has at least one public quote path that is safe to show.` : "This store page is currently acting as a guide, not proof of live trade-in coverage. Public scorecards stay empty until a real quote capture is available."}
        notes={[
          { label: "Type", value: model.merchant.type.replace(/_/g, " ") },
          { label: "Average confidence", value: averageConfidence },
          { label: "Direct links", value: model.merchant.affiliateCapable ? "Affiliate-ready" : "Direct only" },
          { label: "Public paths", value: `${model.paths.length}` },
        ]}
        primaryCta={{ label: lead?.links.redemptionAffiliateLink ? `Open ${model.merchant.name}` : `View ${model.merchant.name} methodology`, href: lead?.links.redemptionAffiliateLink ?? "/methodology", external: Boolean(lead?.links.redemptionAffiliateLink) }}
        secondaryCta={{ label: "Methodology", href: "/methodology" }}
      />

      <section className="card rounded-[2rem] p-6 sm:p-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Store scorecards</p>
            <h2 className="mt-3 text-balance text-3xl font-semibold tracking-[-0.04em]">Phones this store rates well right now.</h2>
            <p className="mt-4 max-w-xl text-base leading-7 text-muted">These scorecards are intentionally strict. If there is no live public quote, the page would rather show nothing than recycle old seeded numbers as if they were current.</p>
          </div>
          <div>
            {model.paths.length ? (
              model.paths.slice(0, 5).map((path, index) => <StoreScorecard key={path.slug} path={path} rank={index + 1} />)
            ) : (
              <div className="rounded-[1.6rem] border border-line bg-surface/40 p-6 text-sm leading-6 text-muted">
                No public live quotes are available for this store yet. Check admin for seeded research and quote-run status.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">How to use this store</p>
          <div className="mt-6 space-y-4">
            {model.rules.map((rule) => (
              <div key={rule} className="border-t border-line pt-4 first:border-t-0 first:pt-0">
                <p className="text-sm leading-6 text-muted">{rule}</p>
              </div>
            ))}
          </div>
        </div>
        <div className="card rounded-[2rem] p-6 sm:p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-accent">Related routes</p>
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