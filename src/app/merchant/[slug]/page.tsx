import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MerchantDetail } from "@/components/merchant-detail";
import { PageShell } from "@/components/page-shell";
import { getMerchantPageModel } from "@/lib/engine";
import { merchants } from "@/lib/seed-data";

type MerchantPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return merchants.map((merchant) => ({ slug: merchant.slug }));
}

export async function generateMetadata({
  params,
}: MerchantPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getMerchantPageModel(slug);
  if (!model) return {};

  return {
    title: `${model.merchant.name} trade-in offers`,
    description: `Current trade-in offers, accepted devices, and caveats for ${model.merchant.name}.`,
  };
}

export default async function MerchantPage({ params }: MerchantPageProps) {
  const { slug } = await params;
  const model = getMerchantPageModel(slug);
  if (!model) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <MerchantDetail model={model} />
    </PageShell>
  );
}
