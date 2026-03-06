import { ComparisonBoard } from "@/components/comparison-board";
import { SectionHeading } from "@/components/section-heading";
import type { ComparePageModel } from "@/lib/schema";

export function CompareDetail({ model }: { model: ComparePageModel }) {
  return (
    <div className="grid gap-8">
      <SectionHeading
        eyebrow="Compare outcomes"
        title={model.title}
        description={model.description}
      />
      <ComparisonBoard scenarios={model.boards} />
    </div>
  );
}
