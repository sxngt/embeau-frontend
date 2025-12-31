"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackRating from "@/components/ui/FeedbackRating";
import { useColorStore } from "@/store/useColorStore";
import { feedbackService } from "@/services/api";
import type { FeedbackRating as FeedbackRatingType } from "@/types";

export default function HealingColorPage() {
  const router = useRouter();
  const { dailyHealingColor, fetchDailyHealingColor, isLoadingHealingColor, error } = useColorStore();
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRatingType | undefined>();

  useEffect(() => {
    if (!dailyHealingColor) {
      fetchDailyHealingColor().catch(console.error);
    }
  }, [dailyHealingColor, fetchDailyHealingColor]);

  const handleFeedback = async (rating: FeedbackRatingType) => {
    setFeedbackRating(rating);
    try {
      await feedbackService.submitFeedback({
        rating,
        targetType: "healing_color",
        targetId: dailyHealingColor?.date || new Date().toISOString(),
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Feedback submission failed:", error);
    }
  };

  const handleStartDay = () => {
    router.push("/recommendation");
  };

  if (isLoadingHealingColor) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">오늘의 힐링 컬러를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !dailyHealingColor) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <Card variant="outlined" padding="lg" className="text-center max-w-md">
          <p className="text-neutral-600 mb-4">{error || "힐링 컬러를 불러오는데 실패했습니다."}</p>
          <Button variant="secondary" onClick={() => fetchDailyHealingColor()}>
            다시 시도
          </Button>
        </Card>
      </div>
    );
  }

  const healingColor = {
    name: dailyHealingColor.color.name,
    hex: dailyHealingColor.color.hex,
    calmEffect: dailyHealingColor.calmEffect,
    personalFit: dailyHealingColor.personalFit,
    dailyAffirmation: dailyHealingColor.dailyAffirmation,
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Title Section */}
      <div className="text-center pt-12 md:pt-16 px-8 mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          <span className="text-neutral-400">오늘의</span>{" "}
          <span className="text-gradient-blue">힐링컬러</span>
        </h1>
      </div>

      <div className="px-5 md:px-8 lg:px-16 space-y-5 max-w-3xl mx-auto">
        {/* Color Display Card */}
        <Card variant="outlined" padding="lg">
          <div className="flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full mb-4 shadow-lg"
              style={{ backgroundColor: healingColor.hex }}
            />
            <h2 className="text-xl font-bold text-neutral-800">
              {healingColor.name}
            </h2>
          </div>
        </Card>

        {/* Calm Effect Card */}
        <Card variant="outlined" padding="lg">
          <h3 className="font-semibold text-neutral-800 mb-2">진정 효과</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {healingColor.calmEffect}
          </p>
        </Card>

        {/* Personal Fit Card */}
        <Card variant="outlined" padding="lg">
          <h3 className="font-semibold text-neutral-800 mb-2">개인적인 톤 적합</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {healingColor.personalFit}
          </p>
        </Card>

        {/* Feedback Card */}
        <Card variant="outlined" padding="lg">
          <FeedbackRating
            value={feedbackRating}
            onChange={handleFeedback}
            label="추천이 마음에 드시나요?"
          />
        </Card>

        {/* Daily Affirmation Card */}
        <Card
          variant="outlined"
          padding="lg"
          className="bg-sky-light/50 border-primary-blue/30"
        >
          <h3 className="font-semibold text-primary-blue text-center mb-3">
            오늘의 다짐
          </h3>
          <p className="text-center text-neutral-700 italic">
            {healingColor.dailyAffirmation}
          </p>
        </Card>

        {/* Action Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleStartDay}
          className="bg-primary-blue hover:bg-primary-blue/90"
        >
          이 색으로 내 하루 시작하기
        </Button>
      </div>
    </div>
  );
}
