"use client";

import { cn } from "@/lib/utils";

interface ColorCircleProps {
  color: string;
  size?: "sm" | "md" | "lg" | "xl";
  label?: string;
  className?: string;
}

export default function ColorCircle({
  color,
  size = "md",
  label,
  className,
}: ColorCircleProps) {
  const sizes = {
    sm: "w-8 h-8",
    md: "w-12 h-12",
    lg: "w-20 h-20",
    xl: "w-28 h-28",
  };

  return (
    <div className={cn("flex flex-col items-center gap-2", className)}>
      <div
        className={cn(
          "rounded-full shadow-md transition-transform hover:scale-105",
          sizes[size]
        )}
        style={{ backgroundColor: color }}
      />
      {label && (
        <span className="text-sm text-neutral-700 font-medium">{label}</span>
      )}
    </div>
  );
}
