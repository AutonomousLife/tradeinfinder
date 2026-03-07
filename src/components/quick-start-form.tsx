import { Search } from "lucide-react";

import type { Condition, Device, Merchant } from "@/lib/schema";

type SortValue = "highest-value" | "easiest" | "best-upgrade" | "highest-confidence" | "newest";

export function QuickStartForm({
  devices,
  merchants,
  defaultCurrentDevice,
  defaultTargetDevice,
  defaultMerchant,
  defaultCondition = "good",
  defaultSortBy = "highest-value",
  mode = "homepage",
}: {
  devices: Device[];
  merchants: Merchant[];
  defaultCurrentDevice: string;
  defaultTargetDevice?: string;
  defaultMerchant?: string;
  defaultCondition?: Condition;
  defaultSortBy?: SortValue;
  mode?: "homepage" | "finder" | "upgrade";
}) {
  const action = mode === "upgrade" ? "/upgrade" : "/search";
  const showStore = mode !== "homepage";

  return (
    <aside className="card rounded-[2rem] p-6 sm:p-8">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-line text-accent">
          <Search className="h-4 w-4" />
        </div>
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-muted">Search</p>
          <h2 className="text-2xl font-semibold tracking-tight">Get one clear answer</h2>
        </div>
      </div>
      <p className="mt-4 text-sm leading-6 text-muted">
        Start with your phone. TradeInFinder will rank the cleanest trade-in, the resale alternative, and the best simple upgrade path.
      </p>
      <form action={action} className="mt-6 space-y-5">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Current phone</span>
          <select name="currentDevice" defaultValue={defaultCurrentDevice} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
            {devices.map((device) => (
              <option key={device.slug} value={device.slug}>{device.brand} {device.model}</option>
            ))}
          </select>
        </label>
        <div className={`grid gap-4 ${showStore ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
          <label className="block">
            <span className="mb-2 block text-sm font-medium">Condition</span>
            <select name="condition" defaultValue={defaultCondition} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
              <option value="good">Good</option>
              <option value="damaged">Damaged</option>
              <option value="poor">Poor / not accepted</option>
            </select>
          </label>
          {showStore ? (
            <label className="block">
              <span className="mb-2 block text-sm font-medium">Preferred store</span>
              <select name="merchant" defaultValue={defaultMerchant ?? ""} className="surface-input w-full rounded-2xl px-4 py-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent">
                <option value="">Any store</option>
                {merchants.filter((merchant) => merchant.slug !== "ebay").map((merchant) => (
                  <option key={merchant.slug} value={merchant.slug}>{merchant.name}</option>
                ))}
              </select>
            </label>
          ) : null}
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
        {mode !== "homepage" ? <input type="hidden" name="sortBy" value={defaultSortBy} /> : null}
        <button type="submit" className="flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-accent-strong">
          Show my best path
        </button>
      </form>
    </aside>
  );
}
