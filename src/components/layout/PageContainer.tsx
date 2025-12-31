"use client";

import { cn } from "@/lib/utils";
import Header from "./Header";
import BottomNavigation from "./BottomNavigation";

interface PageContainerProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  onBack?: () => void;
  showNav?: boolean;
  headerRightAction?: React.ReactNode;
  className?: string;
  contentClassName?: string;
}

export default function PageContainer({
  children,
  title,
  showBack = false,
  onBack,
  showNav = false,
  headerRightAction,
  className,
  contentClassName,
}: PageContainerProps) {
  return (
    <div className={cn("min-h-screen flex flex-col", className)}>
      {(showBack || title) && (
        <Header
          title={title}
          showBack={showBack}
          onBack={onBack}
          rightAction={headerRightAction}
        />
      )}

      <main
        className={cn(
          "flex-1 px-5 py-4",
          showNav && "pb-32",
          contentClassName
        )}
      >
        {children}
      </main>

      {showNav && <BottomNavigation />}
    </div>
  );
}
