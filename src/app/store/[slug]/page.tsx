import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { MerchantDetail } from "@/components/merchant-detail";
import { PageShell } from "@/components/page-shell";
import { getMerchantPageModel } from "@/lib/engine";
import { merchants } from "@/lib/seed-data";

type StorePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return merchants.map((merchant) => ({ slug: merchant.slug }));
}

export async function generateMetadata({ params }: StorePageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getMerchantPageModel(slug);
  if (!model) return {};
  return {
    title: `${model.merchant.name} trade-in store guide`,
    description: `Simple trade-in values and store rules for ${model.merchant.name}.`,
  };
}

export default async function StorePage({ params }: StorePageProps) {
  const { slug } = await params;
  const model = getMerchantPageModel(slug);
  if (!model) notFound();
  return <PageShell className="gap-10 pb-24 pt-10"><MerchantDetail model={model} /></PageShell>;
}
