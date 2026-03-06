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
      <div className="mt-6 overflow-x-auto rounded-[1.5rem] border border-line bg-white/65 p-4">
        <div className="min-w-[640px]">
          <BarChart data={data} width={640} height={280}>
            <CartesianGrid stroke="rgba(0,0,0,0.08)" vertical={false} />
            <XAxis dataKey="label" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} />
            <Tooltip
              contentStyle={{
                borderRadius: "18px",
                border: "1px solid rgba(40,33,19,0.12)",
                background: "rgba(255,250,242,0.96)",
              }}
            />
            <Bar dataKey="instant" radius={[8, 8, 0, 0]} fill="#0f766e" />
            <Bar dataKey="delayed" radius={[8, 8, 0, 0]} fill="#d6a84f" />
          </BarChart>
        </div>
      </div>
    </div>
  );
}
