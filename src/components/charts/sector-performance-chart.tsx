"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  ReferenceLine,
  ResponsiveContainer,
} from "recharts";

const darkTooltip = {
  background: "rgba(11,19,84,0.92)",
  border: "1px solid rgba(255,164,182,0.2)",
  borderRadius: "10px",
  color: "#e2e8f0",
  fontSize: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
};

interface Props {
  data: { name: string; gainLossPct: number }[];
}

export function SectorPerformanceChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 4 }}>
        <XAxis
          dataKey="name"
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
        />
        <YAxis
          tick={{ fill: "#64748b", fontSize: 11 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `${v}%`}
          width={40}
        />
        <Tooltip
          formatter={(v) => [`${(v as number).toFixed(2)}%`, "Gain / Loss"]}
          contentStyle={darkTooltip}
        />
        <ReferenceLine y={0} stroke="rgba(255,164,182,0.15)" strokeWidth={1} />
        <Bar dataKey="gainLossPct" radius={[4, 4, 0, 0]} maxBarSize={40}>
          {data.map((entry, i) => (
            <Cell
              key={i}
              fill={entry.gainLossPct >= 0 ? "#10b981" : "#ef4444"}
              fillOpacity={0.8}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
