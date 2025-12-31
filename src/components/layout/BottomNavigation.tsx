"use client";

import { cn } from "@/lib/utils";
import { Home, ThumbsUp, BarChart3 } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TabType } from "@/types";

interface NavItem {
  type: TabType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  href: string;
}

const navItems: NavItem[] = [
  { type: "home", label: "HOME", icon: Home, href: "/main" },
  { type: "guide", label: "추천가이드", icon: ThumbsUp, href: "/recommendation" },
  { type: "report", label: "리포트", icon: BarChart3, href: "/insight" },
];

interface BottomNavigationProps {
  className?: string;
}

export default function BottomNavigation({ className }: BottomNavigationProps) {
  const pathname = usePathname();

  const isActive = (href: string) => {
    if (href === "/main") {
      return pathname === "/main" || pathname === "/";
    }
    return pathname.startsWith(href);
  };

  return (
    <nav
      className={cn(
        "fixed bottom-0 left-0 right-0 z-50",
        "flex justify-center",
        className
      )}
    >
      <div className="w-full max-w-md md:max-w-2xl lg:max-w-4xl xl:max-w-5xl bg-white border-t border-neutral-100 px-4 py-2 pb-safe-bottom">
        <div className="flex justify-around items-center">
          {navItems.map(({ type, label, icon: Icon, href }) => {
            const active = isActive(href);
            return (
              <Link
                key={type}
                href={href}
                className={cn(
                  "flex flex-col items-center justify-center py-2 px-4 min-w-[80px] rounded-xl transition-all duration-200",
                  active
                    ? "text-primary-pink"
                    : "text-neutral-400 hover:text-neutral-600"
                )}
              >
                <div
                  className={cn(
                    "w-14 h-14 flex items-center justify-center rounded-xl border-2 transition-all duration-200",
                    active
                      ? "border-primary-pink bg-white"
                      : "border-neutral-200 bg-white hover:border-neutral-300"
                  )}
                >
                  <Icon className="w-6 h-6" />
                </div>
                <span className="text-xs font-medium mt-1">{label}</span>
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
