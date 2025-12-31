"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import { useAuthStore } from "@/store/useAuthStore";

export default function IntroPage() {
  const router = useRouter();
  const [isAnimating, setIsAnimating] = useState(true);
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for hydration to complete
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (!isHydrated) return;

    const isAuthenticated = useAuthStore.getState().isAuthenticated;

    const timer = setTimeout(() => {
      setIsAnimating(false);
      // Navigate after animation
      setTimeout(() => {
        if (isAuthenticated) {
          router.push("/main");
        } else {
          router.push("/login");
        }
      }, 500);
    }, 2000);

    return () => clearTimeout(timer);
  }, [isHydrated, router]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-8">
      <div
        className={`transition-all duration-500 ${
          isAnimating ? "opacity-100 scale-100" : "opacity-0 scale-95"
        }`}
      >
        <Logo size="lg" />
        <p className="text-center text-neutral-600 mt-6 text-lg">
          오롯이 나를 위해 단단해지는 시간
        </p>
      </div>
    </div>
  );
}
