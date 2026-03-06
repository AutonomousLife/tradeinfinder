import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { DeviceDetail } from "@/components/device-detail";
import { PageShell } from "@/components/page-shell";
import { getDevicePageModel } from "@/lib/engine";
import { devices } from "@/lib/seed-data";

type DevicePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return devices.map((device) => ({ slug: device.slug }));
}

export async function generateMetadata({
  params,
}: DevicePageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getDevicePageModel(slug);
  if (!model) return {};

  return {
    title: `${model.device.brand} ${model.device.model} trade-in value`,
    description: `See current trade-in values, arbitrage paths, and upgrade targets for ${model.device.brand} ${model.device.model}.`,
  };
}

export default async function DevicePage({ params }: DevicePageProps) {
  const { slug } = await params;
  const model = getDevicePageModel(slug);
  if (!model) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <DeviceDetail model={model} />
    </PageShell>
  );
}
