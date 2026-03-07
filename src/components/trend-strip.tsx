import type { Device, RankedPath } from "@/lib/schema";

export function TrendStrip({
  device,
  leadPath,
}: {
  device: Device;
  leadPath?: RankedPath;
}) {
  const direction = trendDirection(device.trendScore);
  const demand = device.searchVolume >= 45 ? "High" : device.searchVolume >= 20 ? "Active" : "Steady";
  const certainty = leadPath
    ? leadPath.resolvedValue.stale
      ? "Verify now"
      : leadPath.resolvedValue.confidenceLabel
    : "No live path";

  return (
    <section className="border-y border-line py-5">
      <div className="grid gap-4 sm:grid-cols-3">
        <Signal label="30d signal" value={direction.label} copy={direction.copy} />
        <Signal label="Demand" value={demand} copy={`${device.searchVolume} relative search points in seeded data.`} />
        <Signal
          label="Value quality"
          value={certainty}
          copy={leadPath ? `${leadPath.merchant.name} is currently the cleanest visible path.` : "No current path for this phone."}
        />
      </div>
    </section>
  );
}

function Signal({
  label,
  value,
  copy,
}: {
  label: string;
  value: string;
  copy: string;
}) {
  return (
    <div>
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted">{label}</p>
      <p className="mt-2 text-lg font-semibold tracking-tight">{value}</p>
      <p className="mt-2 text-sm leading-6 text-muted">{copy}</p>
    </div>
  );
}

function trendDirection(score: number) {
  if (score >= 35) {
    return { label: "Firming", copy: "Interest and upgrade relevance are running above baseline." };
  }

  if (score >= 18) {
    return { label: "Stable", copy: "Trade-in value looks usable, but not unusually strong." };
  }

  return { label: "Cooling", copy: "Older-device attention is lower, so resale may matter more." };
}
