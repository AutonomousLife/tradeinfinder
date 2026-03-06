"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

type ChartDatum = {
  label: string;
  instant: number;
  delayed: number;
};

export function ChartPanel({
  title,
  description,
  data,
}: {
  title: string;
  description: string;
  data: ChartDatum[];
}) {
  return (
    <div className="card rounded-[2rem] p-6">
      <h3 className="text-2xl font-semibold tracking-tight">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-muted">{description}</p>
      <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-line bg-panel p-4">
        <div className="min-w-[640px]">
          <BarChart data={data} width={640} height={280}>
            <CartesianGrid stroke="rgba(148,163,184,0.12)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} stroke="currentColor" className="text-muted" />
            <YAxis tickLine={false} axisLine={false} stroke="currentColor" className="text-muted" />
            <Tooltip
              contentStyle={{
                borderRadius: "18px",
                border: "1px solid rgba(148,163,184,0.16)",
                background: "rgba(11,18,28,0.96)",
                color: "#eef4fb",
              }}
            />
            <Bar dataKey="instant" radius={[8, 8, 0, 0]} fill="#5dd6c0" />
            <Bar dataKey="delayed" radius={[8, 8, 0, 0]} fill="#e8b866" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}

