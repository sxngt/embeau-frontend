"use client";

import { cn } from "@/lib/utils";
import { useState } from "react";
import type { FeedbackRating as FeedbackRatingType } from "@/types";

interface FeedbackRatingProps {
  value?: FeedbackRatingType;
  onChange?: (rating: FeedbackRatingType) => void;
  label?: string;
  className?: string;
}

const emojis = [
  { rating: 1 as const, emoji: "😣", label: "매우 나쁨", color: "#FF6B9D" },
  { rating: 2 as const, emoji: "😟", label: "나쁨", color: "#FFB366" },
  { rating: 3 as const, emoji: "😐", label: "보통", color: "#FFD93D" },
  { rating: 4 as const, emoji: "🙂", label: "좋음", color: "#6BCB77" },
  { rating: 5 as const, emoji: "😊", label: "매우 좋음", color: "#4ECDC4" },
];

export default function FeedbackRating({
  value,
  onChange,
  label = "추천이 마음에 드시나요?",
  className,
}: FeedbackRatingProps) {
  const [hoveredRating, setHoveredRating] = useState<number | null>(null);

  return (
    <div className={cn("w-full", className)}>
      <p className="text-center text-neutral-700 font-medium mb-4">{label}</p>
      <div className="flex justify-center gap-2">
        {emojis.map(({ rating, emoji, label, color }) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange?.(rating)}
            onMouseEnter={() => setHoveredRating(rating)}
            onMouseLeave={() => setHoveredRating(null)}
            className={cn(
              "w-12 h-12 text-2xl rounded-full flex items-center justify-center transition-all duration-200",
              "hover:scale-110 active:scale-95",
              value === rating && "ring-2 ring-offset-2",
              value === rating || hoveredRating === rating
                ? "opacity-100"
                : "opacity-60 grayscale"
            )}
            style={{
              backgroundColor:
                value === rating || hoveredRating === rating
                  ? `${color}20`
                  : "transparent",
            }}
            aria-label={label}
          >
            {emoji}
          </button>
        ))}
      </div>
      <div className="flex justify-between mt-2 px-2">
        <span className="text-xs text-neutral-400">매우 나쁨</span>
        <span className="text-xs text-neutral-400">매우 좋음</span>
      </div>
    </div>
  );
}
