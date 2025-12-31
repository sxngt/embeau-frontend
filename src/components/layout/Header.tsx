"use client";

import { cn } from "@/lib/utils";
import { ChevronLeft } from "lucide-react";
import { useRouter } from "next/navigation";

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: React.ReactNode;
  transparent?: boolean;
  className?: string;
}

export default function Header({
  title,
  showBack = false,
  onBack,
  rightAction,
  transparent = true,
  className,
}: HeaderProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      router.back();
    }
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-50 px-4 py-3 flex items-center justify-between",
        transparent ? "bg-transparent" : "bg-white/80 backdrop-blur-sm",
        className
      )}
    >
      <div className="w-10">
        {showBack && (
          <button
            onClick={handleBack}
            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/80 hover:bg-white transition-colors shadow-sm"
            aria-label="뒤로 가기"
          >
            <ChevronLeft className="w-6 h-6 text-primary-blue" />
          </button>
        )}
      </div>

      {title && (
        <h1 className="flex-1 text-center text-lg font-semibold text-neutral-800">
          {title}
        </h1>
      )}

      <div className="w-10 flex justify-end">{rightAction}</div>
    </header>
  );
}
