import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { OfferDetail } from "@/components/offer-detail";
import { PageShell } from "@/components/page-shell";
import { getOfferPageModel } from "@/lib/engine";
import { offers } from "@/lib/seed-data";

type OfferPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return offers.map((offer) => ({ slug: offer.slug }));
}

export async function generateMetadata({
  params,
}: OfferPageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getOfferPageModel(slug);
  if (!model) return {};

  return {
    title: `${model.offer.targetDevice} trade-in offer`,
    description: `${model.offer.merchant.name} trade-in offer for ${model.offer.targetDevice} with requirements, accepted devices, and confidence notes.`,
  };
}

export default async function OfferPage({ params }: OfferPageProps) {
  const { slug } = await params;
  const model = getOfferPageModel(slug);
  if (!model) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <OfferDetail model={model} />
    </PageShell>
  );
}
