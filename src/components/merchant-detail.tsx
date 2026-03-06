import Link from "next/link";

import { PathCard } from "@/components/path-card";
import type { MerchantPageModel } from "@/lib/schema";

export function MerchantDetail({ model }: { model: MerchantPageModel }) {
  return (
    <div className="grid gap-8">
      <section className="card rounded-[2rem] p-8">
        <p className="font-mono text-xs uppercase tracking-[0.22em] text-accent">Store detail</p>
        <h1 className="mt-3 text-balance text-4xl font-semibold tracking-[-0.04em] sm:text-5xl">{model.merchant.name}</h1>
        <p className="mt-4 max-w-3xl text-lg leading-8 text-muted">{model.merchant.notes} This page focuses on simple trade-in value, gift card/store credit rules, and clean upgrade usefulness.</p>
        <div className="mt-6 flex flex-wrap gap-2">
          {model.tags.map((tag) => (
            <span key={tag} className="pill rounded-full px-3 py-1 text-xs text-muted">{tag}</span>
          ))}
        </div>
      </section>
      <section>
        <h2 className="text-2xl font-semibold tracking-tight">Best current opportunities</h2>
        <div className="mt-5 grid gap-5 lg:grid-cols-3">
          {model.paths.map((path) => (
            <PathCard key={path.slug} path={path} />
          ))}
        </div>
      </section>
      <section className="card rounded-[2rem] p-6">
        <h2 className="text-2xl font-semibold tracking-tight">How this store handles trade-ins</h2>
        <div className="mt-5 grid gap-4 md:grid-cols-2">
          {model.rules.map((rule) => (
            <div key={rule} className="rounded-[1.4rem] border border-line bg-panel p-4">
              <p className="text-sm leading-6">{rule}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          {model.relatedLinks.map((link) => (
            <Link key={link.href} href={link.href} className="rounded-full border border-line px-4 py-2 text-sm font-semibold transition hover:bg-surface">{link.label}</Link>
          ))}
        </div>
      </section>
    </div>
  );
}
