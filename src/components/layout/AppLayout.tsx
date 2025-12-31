"use client";

import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  showBackground?: boolean;
  className?: string;
}

export default function AppLayout({
  children,
  showBackground = true,
  className,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen w-full flex justify-center bg-neutral-100">
      {/* Mobile-first container, expands on desktop */}
      <div
        className={cn(
          "relative w-full min-h-screen",
          // Mobile: full width (max 448px centered)
          "max-w-md",
          // Tablet: wider container
          "md:max-w-2xl",
          // Desktop: even wider with nice proportions
          "lg:max-w-4xl xl:max-w-5xl",
          "md:shadow-2xl",
          showBackground && "bg-gradient-to-b from-sky-light via-white to-white",
          !showBackground && "bg-white",
          className
        )}
      >
        {/* Sky gradient overlay at top */}
        {showBackground && (
          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-[#E8F4FC] via-[#D4EAF7] to-transparent pointer-events-none" />
        )}

        {/* Content */}
        <div className="relative z-10">{children}</div>
      </div>
    </div>
  );
}
