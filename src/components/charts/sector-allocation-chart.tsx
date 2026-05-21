"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const COLORS = [
  "#F765A3", "#A155B9", "#165BAA", "#FFA4B6", "#7B3FBE", "#1E70C8", "#F9D1D1",
];

const darkTooltip = {
  background: "rgba(11,19,84,0.92)",
  border: "1px solid rgba(255,164,182,0.2)",
  borderRadius: "10px",
  color: "#e2e8f0",
  fontSize: 12,
  boxShadow: "0 4px 20px rgba(0,0,0,0.4)",
};

interface Props {
  data: { name: string; value: number }[];
}

export function SectorAllocationChart({ data }: Props) {
  return (
    <ResponsiveContainer width="100%" height={240}>
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="45%"
          innerRadius={65}
          outerRadius={95}
          paddingAngle={3}
          dataKey="value"
          strokeWidth={0}
        >
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} fillOpacity={0.85} />
          ))}
        </Pie>
        <Tooltip
          formatter={(v: number) => [`${v.toFixed(1)}%`, "Weight"]}
          contentStyle={darkTooltip}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          formatter={(value) => (
            <span style={{ color: "#94a3b8", fontSize: 11 }}>{value}</span>
          )}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
