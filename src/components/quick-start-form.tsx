import { Search, SlidersHorizontal } from "lucide-react";

import type { Device, Merchant, Offer } from "@/lib/schema";

type SortValue = "best-net" | "highest-credit" | "lowest-risk" | "highest-confidence" | "instant";

export function QuickStartForm({
  devices,
  merchants,
  defaultCurrentDevice,
  defaultTargetDevice,
  defaultMerchant,
  defaultCondition = "good",
  defaultSortBy = "best-net",
  defaultTradeInType = "all",
  defaultInstantOnly = false,
  defaultExcludeNewLine = false,
  defaultUnlockedOnly = false,
  mode = "homepage",
}: {
  devices: Device[];
  merchants: Merchant[];
  defaultCurrentDevice: string;
  defaultTargetDevice: string;
  defaultMerchant?: string;
  defaultCondition?: string;
  defaultSortBy?: SortValue;
  defaultTradeInType?: Offer["tradeInType"] | "all";
  defaultInstantOnly?: boolean;
  defaultExcludeNewLine?: boolean;
  defaultUnlockedOnly?: boolean;
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
          <p className="font-mono text-xs uppercase tracking-[0.22em] text-muted">
            Quick start
          </p>
          <h2 className="text-2xl font-semibold tracking-tight">
            Run the optimizer
          </h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        Enter your current device, desired upgrade target, and condition. The
        engine ranks direct trade-ins, low-risk options, and buy-first
        arbitrage paths by real upgrade cost.
      </p>
      <form action={action} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Current phone</span>
          <select
            name="currentDevice"
            defaultValue={defaultCurrentDevice}
            className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {devices.map((device) => (
              <option key={device.slug} value={device.slug}>
                {device.brand} {device.model}
              </option>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Condition</span>
            <select
              name="condition"
              defaultValue={defaultCondition}
              className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="mint">Mint</option>
              <option value="good">Good</option>
              <option value="fair">Fair</option>
              <option value="cracked">Cracked</option>
            </select>
          </label>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Preferred merchant</span>
            <select
              name="merchant"
              defaultValue={defaultMerchant ?? ""}
              className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
            >
              <option value="">Any merchant</option>
              {merchants.map((merchant) => (
                <option key={merchant.slug} value={merchant.slug}>
                  {merchant.name}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Target phone or brand</span>
          <select
            name="targetDevice"
            defaultValue={defaultTargetDevice}
            className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent"
          >
            {devices.map((device) => (
              <option key={device.slug} value={device.slug}>
                {device.brand} {device.model}
              </option>
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
              <select
                name="sortBy"
                defaultValue={defaultSortBy}
                className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
              >
                <option value="best-net">Best net value</option>
                <option value="highest-credit">Highest credit</option>
                <option value="lowest-risk">Lowest risk</option>
                <option value="highest-confidence">Highest confidence</option>
                <option value="instant">Best instant value</option>
              </select>
            </label>
            {mode !== "upgrade" ? (
              <label className="block">
                <span className="mb-2 block text-xs font-medium uppercase tracking-[0.18em] text-muted">Trade-in type</span>
                <select
                  name="tradeInType"
                  defaultValue={defaultTradeInType}
                  className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none"
                >
                  <option value="all">All types</option>
                  <option value="cash">Cash</option>
                  <option value="instant">Instant</option>
                  <option value="store_credit">Store credit</option>
                  <option value="bill_credit">Bill credits</option>
                </select>
              </label>
            ) : null}
          </div>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <label className="flex items-center justify-between rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm">
              <span className="font-medium">Instant value only</span>
              <input type="checkbox" name="instantOnly" defaultChecked={defaultInstantOnly} value="true" className="h-4 w-4 accent-accent" />
            </label>
            <label className="flex items-center justify-between rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm">
              <span className="font-medium">Hide new-line offers</span>
              <input type="checkbox" name="excludeNewLine" defaultChecked={defaultExcludeNewLine} value="true" className="h-4 w-4 accent-accent" />
            </label>
            {mode === "upgrade" ? (
              <label className="flex items-center justify-between rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm sm:col-span-2">
                <span className="font-medium">Unlocked / lower lock-in preference</span>
                <input type="checkbox" name="unlockedOnly" defaultChecked={defaultUnlockedOnly} value="true" className="h-4 w-4 accent-accent" />
              </label>
            ) : null}
            {mode === "upgrade" ? (
              <label className="flex items-center justify-between rounded-2xl border border-line bg-surface/70 px-4 py-3 text-sm sm:col-span-2">
                <span className="font-medium">Allow buy-first arbitrage paths</span>
                <input type="checkbox" name="allowIntermediate" defaultChecked value="true" className="h-4 w-4 accent-accent" />
              </label>
            ) : null}
          </div>
        </div>
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:-translate-y-0.5 hover:bg-accent-strong"
        >
          Show ranked results
        </button>
      </form>
    </aside>
  );
}

