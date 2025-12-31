"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  className?: string;
}

export default function Logo({
  size = "md",
  className,
}: LogoProps) {
  const sizes = {
    sm: { width: 120, height: 100 },
    md: { width: 200, height: 170 },
    lg: { width: 280, height: 240 },
  };

  const { width, height } = sizes[size];

  return (
    <div className={cn("flex flex-col items-center", className)}>
      <Image
        src="/logo.png"
        alt="EMBEAU"
        width={width}
        height={height}
        priority
        className="object-contain"
      />
    </div>
  );
}
