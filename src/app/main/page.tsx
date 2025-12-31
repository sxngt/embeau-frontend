"use client";

import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import BottomNavigation from "@/components/layout/BottomNavigation";
import Button from "@/components/ui/Button";

export default function MainPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen pb-32">
      <Header showBack onBack={() => router.push("/login")} />

      <div className="flex flex-col items-center justify-center px-8 pt-16 md:pt-24 lg:pt-32">
        {/* Main Title */}
        <div className="text-center mb-8 md:mb-12">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold">
            <span className="text-neutral-300">나의</span>{" "}
            <span className="text-gradient-pink">컬러 여정</span>
          </h1>
          <p className="text-neutral-800 text-xl md:text-2xl font-medium mt-3 md:mt-5">
            지금 시작해 볼까요?
          </p>
        </div>

        {/* Description */}
        <p className="text-center text-neutral-600 mb-12 md:mb-16 leading-relaxed text-base md:text-lg">
          오늘의 감정을 색으로 표현하거나,
          <br />
          색으로 마음을 다독일 수 있어요.
        </p>

        {/* Action Buttons - side by side on desktop */}
        <div className="w-full max-w-md md:max-w-2xl">
          <div className="flex flex-col md:flex-row gap-4 md:gap-6">
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={() => router.push("/color-diagnosis")}
              className="md:text-xl md:py-5"
            >
              컬러 진단
            </Button>

            <Button
              variant="secondary"
              size="lg"
              fullWidth
              onClick={() => router.push("/emotion-map")}
              className="md:text-xl md:py-5"
            >
              마음 기록
            </Button>
          </div>
        </div>
      </div>

      <BottomNavigation />
    </div>
  );
}
