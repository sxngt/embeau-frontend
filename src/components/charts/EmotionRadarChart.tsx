"use client";

import {
  Radar,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
} from "recharts";
import type { EmotionState } from "@/types";

interface EmotionRadarChartProps {
  emotions: EmotionState;
  className?: string;
}

const emotionLabels: Record<keyof EmotionState, string> = {
  anxiety: "불안",
  stress: "스트레스",
  satisfaction: "만족",
  happiness: "행복",
  depression: "우울",
};

export default function EmotionRadarChart({
  emotions,
  className,
}: EmotionRadarChartProps) {
  const data = [
    { subject: emotionLabels.anxiety, value: emotions.anxiety },
    { subject: emotionLabels.satisfaction, value: emotions.satisfaction },
    { subject: emotionLabels.depression, value: emotions.depression },
    { subject: emotionLabels.happiness, value: emotions.happiness },
    { subject: emotionLabels.stress, value: emotions.stress },
  ];

  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={280}>
        <RadarChart cx="50%" cy="50%" outerRadius="70%" data={data}>
          <PolarGrid
            stroke="#E0E0E0"
            strokeWidth={1}
          />
          <PolarAngleAxis
            dataKey="subject"
            tick={{ fill: "#4A90D9", fontSize: 12, fontWeight: 500 }}
            tickLine={false}
          />
          <PolarRadiusAxis
            angle={90}
            domain={[0, 100]}
            tick={{ fill: "#9E9E9E", fontSize: 10 }}
            tickCount={3}
            axisLine={false}
          />
          <Radar
            name="감정"
            dataKey="value"
            stroke="#4A90D9"
            fill="#4A90D9"
            fillOpacity={0.4}
            strokeWidth={2}
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
}
