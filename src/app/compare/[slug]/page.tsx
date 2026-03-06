import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompareDetail } from "@/components/compare-detail";
import { PageShell } from "@/components/page-shell";
import { getComparePageModel } from "@/lib/engine";
import { topUpgradeComparisons } from "@/lib/seed-data";

type ComparePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return topUpgradeComparisons.map((comparison) => ({ slug: comparison.slug }));
}

export async function generateMetadata({
  params,
}: ComparePageProps): Promise<Metadata> {
  const { slug } = await params;
  const model = getComparePageModel(slug);
  if (!model) return {};

  return {
    title: model.title,
    description: model.description,
  };
}

export default async function ComparePage({ params }: ComparePageProps) {
  const { slug } = await params;
  const model = getComparePageModel(slug);
  if (!model) notFound();

  return (
    <PageShell className="gap-10 pb-24 pt-10">
      <CompareDetail model={model} />
    </PageShell>
  );
}
