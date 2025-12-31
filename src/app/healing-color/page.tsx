"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackRating from "@/components/ui/FeedbackRating";
import type { FeedbackRating as FeedbackRatingType } from "@/types";

export default function HealingColorPage() {
  const router = useRouter();
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRatingType | undefined>();

  // Mock data - TODO: Get from API/store
  const healingColor = {
    name: "부드러운 민트블루",
    hex: "#5ECFCF",
    calmEffect: "마음을 차분하게 가라앉히고 긴장을 덜어줍니다.",
    personalFit: "당신의 퍼스널컬러 톤에도 잘 어울려, 자연스럽운 편안한 인상을 줍니다.",
    dailyAffirmation: '"나는 오늘 차분하고 자신감 있게 하루를 보낼 수 있어"',
  };

  const handleFeedback = (rating: FeedbackRatingType) => {
    setFeedbackRating(rating);
    // TODO: Send feedback to API
    console.log("Feedback submitted:", rating);
  };

  const handleStartDay = () => {
    router.push("/recommendation");
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
