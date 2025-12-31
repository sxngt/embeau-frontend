"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import ColorCircle from "@/components/ui/ColorCircle";
import FeedbackRating from "@/components/ui/FeedbackRating";
import { useColorStore } from "@/store/useColorStore";
import type { FeedbackRating as FeedbackRatingType } from "@/types";

const seasonNames: Record<string, string> = {
  spring: "봄",
  summer: "여름",
  autumn: "가을",
  winter: "겨울",
};

const toneNames: Record<string, string> = {
  warm: "웜톤",
  cool: "쿨톤",
};

export default function ColorDiagnosisResultPage() {
  const router = useRouter();
  const { personalColorResult } = useColorStore();
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRatingType | undefined>();

  useEffect(() => {
    // Redirect if no result
    if (!personalColorResult) {
      router.push("/color-diagnosis");
    }
  }, [personalColorResult, router]);

  if (!personalColorResult) {
    return null;
  }

  const { season, tone, description, recommendedColors } = personalColorResult;
  const seasonName = seasonNames[season] || season;
  const toneName = toneNames[tone] || tone;

  const handleFeedback = (rating: FeedbackRatingType) => {
    setFeedbackRating(rating);
    // TODO: Send feedback to API
    console.log("Feedback submitted:", rating);
  };

  const handleContinue = () => {
    router.push("/emotion-map");
  };

  return (
    <div className="min-h-screen pb-8">
      {/* Title Section */}
      <div className="text-center pt-12 md:pt-16 px-8 mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          <span className="text-gradient-pink">컬러분석</span>{" "}
          <span className="text-neutral-400">결과</span>
        </h1>
        <p className="text-neutral-800 text-lg md:text-xl font-medium">
          당신을 돋보이게 할 색을 발견했어요.
        </p>
      </div>

      <div className="px-5 md:px-8 lg:px-16 space-y-5 max-w-3xl mx-auto">
        {/* Personal Color Result Card */}
        <Card variant="outlined" padding="lg">
          <div className="text-center">
            <p className="text-lg text-neutral-700 mb-1">당신은 밝고 산뜻한</p>
            <h2 className="text-2xl font-bold">
              <span className="text-primary-blue">{seasonName} {toneName}</span>
              <span className="text-neutral-800">이에요</span>
            </h2>
            <p className="text-sm text-neutral-500 mt-3 leading-relaxed">
              {description}
            </p>

            {/* Recommended Colors */}
            <div className="flex justify-center gap-4 mt-6">
              {recommendedColors.map((color, index) => (
                <ColorCircle
                  key={index}
                  color={color.hex}
                  size="md"
                  label={color.name}
                />
              ))}
            </div>
          </div>
        </Card>

        {/* Feedback Card */}
        <Card variant="outlined" padding="lg">
          <FeedbackRating
            value={feedbackRating}
            onChange={handleFeedback}
            label="추천이 마음에 드시나요?"
          />
        </Card>

        {/* Usage Guide Card */}
        <Card variant="outlined" padding="lg">
          <h3 className="font-semibold text-neutral-800 mb-2">사용안내</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            이 톤은 부드럽고 밝은 인상을 살려주는 색상군이에요.
            <br />
            이 색들이 당신의 자연스러운 매력을 한층 더 빛나게 합니다.
          </p>
        </Card>

        {/* Action Button */}
        <Button
          variant="secondary"
          size="lg"
          fullWidth
          onClick={handleContinue}
        >
          내 감정 알아보기
        </Button>
      </div>
    </div>
  );
}
