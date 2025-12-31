"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend } from "recharts";

interface EmotionDistribution {
  anxiety: number;
  stress: number;
  satisfaction: number;
  happiness: number;
  depression: number;
}

interface EmotionPieChartProps {
  distribution: EmotionDistribution;
  className?: string;
}

const emotionColors: Record<keyof EmotionDistribution, { color: string; label: string }> = {
  anxiety: { color: "#FF6B9D", label: "불안" },
  stress: { color: "#9B59B6", label: "스트레스" },
  satisfaction: { color: "#F5A623", label: "만족" },
  happiness: { color: "#FFD93D", label: "행복" },
  depression: { color: "#9E9E9E", label: "우울" },
};

export default function EmotionPieChart({
  distribution,
  className,
}: EmotionPieChartProps) {
  const data = Object.entries(distribution).map(([key, value]) => ({
    name: emotionColors[key as keyof EmotionDistribution].label,
    value,
    color: emotionColors[key as keyof EmotionDistribution].color,
  }));

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-2">
        {data.map((entry, index) => (
          <div key={index} className="flex items-center gap-1.5">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: entry.color }}
            />
            <span className="text-xs text-neutral-600">
              {entry.name}: {entry.value}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
