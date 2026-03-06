import { Search, SlidersHorizontal } from "lucide-react";

import type { Condition, Device, Merchant, ValueType } from "@/lib/schema";

type SortValue = "highest-value" | "easiest" | "best-upgrade" | "highest-confidence" | "newest";

export function QuickStartForm({
  devices,
  merchants,
  defaultCurrentDevice,
  defaultTargetDevice,
  defaultMerchant,
  defaultCondition = "good",
  defaultSortBy = "highest-value",
  defaultValueType = "all",
  mode = "homepage",
}: {
  devices: Device[];
  merchants: Merchant[];
  defaultCurrentDevice: string;
  defaultTargetDevice?: string;
  defaultMerchant?: string;
  defaultCondition?: Condition;
  defaultSortBy?: SortValue;
  defaultValueType?: ValueType | "all";
  mode?: "homepage" | "finder" | "upgrade";
}) {
  const action = mode === "upgrade" ? "/upgrade" : "/search";

  return (
    <aside className="card glow rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-accent-soft text-accent">
          <Search className="h-5 w-5" />
        </div>
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">Quick start</p>
          <h2 className="text-2xl font-semibold tracking-tight">Find real value fast</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        Compare direct trade-in value, store credit, gift card paths, and resale estimates with freshness and confidence attached.
      </p>
      <form action={action} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Current phone</span>
          <select name="currentDevice" defaultValue={defaultCurrentDevice} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
            {devices.map((device) => (
              <option key={device.slug} value={device.slug}>{device.brand} {device.model}</option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Condition</span>
            <select name="condition" defaultValue={defaultCondition} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="poor">Poor / not accepted</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Preferred store</span>
            <select name="merchant" defaultValue={defaultMerchant ?? ""} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <option value="">Any store</option>
              {merchants.filter((merchant) => merchant.slug !== "ebay").map((merchant) => (
                <option key={merchant.slug} value={merchant.slug}>{merchant.name}</option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Target phone (optional)</span>
          <select name="targetDevice" defaultValue={defaultTargetDevice ?? ""} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
            <option value="">No target selected</option>
            {devices.map((device) => (
              <option key={device.slug} value={device.slug}>{device.brand} {device.model}</option>
            ))}
          </select>
        </label>
        <div className="rounded-[1.35rem] border border-line bg-panel p-4">
          <div className="mb-3 flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-accent" />
            <p className="text-sm font-semibold">Ranking filters</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted">Sort by</span>
              <select name="sortBy" defaultValue={defaultSortBy} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none">
                <option value="highest-value">Highest value</option>
                <option value="easiest">Easiest option</option>
                <option value="best-upgrade">Best upgrade path</option>
                <option value="highest-confidence">Highest confidence</option>
                <option value="newest">Newest</option>
              </select>
            </label>
            {mode !== "upgrade" ? (
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted">Value type</span>
                <select name="valueType" defaultValue={defaultValueType} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none">
                  <option value="all">All types</option>
                  <option value="instant_credit">Instant credit</option>
                  <option value="purchase_credit">Purchase credit</option>
                  <option value="store_credit">Store credit</option>
                  <option value="gift_card">Gift card</option>
                </select>
              </label>
            ) : null}
          </div>
        </div>
        <button type="submit" className="flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong">
          Show results
        </button>
      </form>
    </aside>
  );
}

