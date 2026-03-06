import { Search } from "lucide-react";

import type { Device, Merchant } from "@/lib/schema";

export function QuickStartForm({
  devices,
  merchants,
  defaultCurrentDevice,
  defaultTargetDevice,
  defaultMerchant,
  defaultCondition = "good",
  mode = "homepage",
}: {
  devices: Device[];
  merchants: Merchant[];
  defaultCurrentDevice: string;
  defaultTargetDevice: string;
  defaultMerchant?: string;
  defaultCondition?: string;
  mode?: "homepage" | "finder" | "upgrade";
}) {
  const action = mode === "upgrade" ? "/upgrade" : "/search";

  return (
    <aside className="card rounded-[2rem] p-6 sm:p-8">
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
        engine will rank direct trade-ins, lower-risk paths, and buy-first
        arbitrage scenarios.
      </p>
      <form action={action} className="mt-6 space-y-4">
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Current phone</span>
          <select
            name="currentDevice"
            defaultValue={defaultCurrentDevice}
            className="w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none"
          >
            {devices.map((device) => (
              <option key={device.slug} value={device.slug}>
                {device.brand} {device.model}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">Condition</span>
          <select
            name="condition"
            defaultValue={defaultCondition}
            className="w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none"
          >
            <option value="mint">Mint</option>
            <option value="good">Good</option>
            <option value="fair">Fair</option>
            <option value="cracked">Cracked</option>
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Upgrade target or brand
          </span>
          <select
            name="targetDevice"
            defaultValue={defaultTargetDevice}
            className="w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none"
          >
            {devices.map((device) => (
              <option key={device.slug} value={device.slug}>
                {device.brand} {device.model}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="mb-2 block text-sm font-medium">
            Merchant or carrier
          </span>
          <select
            name="merchant"
            defaultValue={defaultMerchant ?? ""}
            className="w-full rounded-2xl border border-line bg-white/80 px-4 py-3 text-sm outline-none"
          >
            <option value="">Any merchant</option>
            {merchants.map((merchant) => (
              <option key={merchant.slug} value={merchant.slug}>
                {merchant.name}
              </option>
            ))}
          </select>
        </label>
        {mode === "upgrade" ? (
          <label className="flex items-center justify-between rounded-2xl border border-line bg-white/65 px-4 py-3 text-sm">
            <span className="font-medium">Allow buy-first arbitrage paths</span>
            <input
              type="checkbox"
              name="allowIntermediate"
              defaultChecked
              value="true"
              className="h-4 w-4 accent-accent"
            />
          </label>
        ) : null}
        <button
          type="submit"
          className="flex w-full items-center justify-center rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white transition hover:bg-accent-strong"
        >
          Show ranked results
        </button>
      </form>
    </aside>
  );
}
