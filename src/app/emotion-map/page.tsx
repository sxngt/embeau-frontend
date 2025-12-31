"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/layout/Header";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackRating from "@/components/ui/FeedbackRating";
import EmotionRadarChart from "@/components/charts/EmotionRadarChart";
import { useEmotionStore } from "@/store/useEmotionStore";
import type { FeedbackRating as FeedbackRatingType, EmotionState } from "@/types";

export default function EmotionMapPage() {
  const router = useRouter();
  const { addEmotionEntry, currentEmotion, isAnalyzing } = useEmotionStore();

  const [emotionText, setEmotionText] = useState("");
  const [analyzedEmotion, setAnalyzedEmotion] = useState<EmotionState | null>(null);
  const [healingColors, setHealingColors] = useState<Array<{ name: string; hex: string; effect: string }>>([]);
  const [feedbackRating, setFeedbackRating] = useState<FeedbackRatingType | undefined>();

  const handleAnalyze = async () => {
    if (!emotionText.trim()) return;

    try {
      const entry = await addEmotionEntry(emotionText);
      setAnalyzedEmotion(entry.emotions);
      setHealingColors(entry.healingColors);
    } catch (error) {
      console.error("Emotion analysis failed:", error);
    }
  };

  const handleFeedback = (rating: FeedbackRatingType) => {
    setFeedbackRating(rating);
    // TODO: Send feedback to API
    console.log("Feedback submitted:", rating);
  };

  const handleContinue = () => {
    router.push("/healing-color");
  };

  return (
    <div className="min-h-screen pb-8">
      <Header showBack onBack={() => router.push("/main")} />

      {/* Title Section */}
      <div className="text-center pt-4 md:pt-8 px-8 mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          <span className="text-gradient-blue">감정</span>{" "}
          <span className="text-primary-blue">지도</span>
        </h1>
        <p className="text-neutral-800 text-lg md:text-xl font-medium">
          지금 당신의 마음속 날씨는 어떤가요?
        </p>
      </div>

      <div className="px-5 md:px-8 lg:px-16 space-y-5 max-w-3xl mx-auto">
        {/* Emotion Input Card */}
        <Card variant="outlined" padding="lg">
          <textarea
            value={emotionText}
            onChange={(e) => setEmotionText(e.target.value)}
            placeholder="저는 긴장되요. 중요한 발표가 있어요."
            className="w-full h-24 resize-none border-none outline-none text-neutral-700 placeholder:text-neutral-400"
          />
        </Card>

        {/* Analyze Button (only show if not analyzed yet) */}
        {!analyzedEmotion && (
          <Button
            variant="secondary"
            size="lg"
            fullWidth
            onClick={handleAnalyze}
            isLoading={isAnalyzing}
            disabled={!emotionText.trim()}
          >
            감정 분석하기
          </Button>
        )}

        {/* Results Section */}
        {analyzedEmotion && (
          <>
            {/* Emotion Radar Chart Card */}
            <Card variant="outlined" padding="md" className="border-2 border-primary-blue/30">
              <EmotionRadarChart emotions={analyzedEmotion} />
            </Card>

            {/* Healing Colors Card */}
            <Card variant="outlined" padding="lg">
              <h3 className="font-semibold text-neutral-800 mb-4 text-center">
                오늘의 치유 컬러
              </h3>
              <div className="space-y-3">
                {healingColors.map((color, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-4 p-3 bg-neutral-50 rounded-xl"
                  >
                    <div
                      className="w-10 h-10 rounded-full flex-shrink-0"
                      style={{ backgroundColor: color.hex }}
                    />
                    <div>
                      <p className="font-medium text-neutral-800">{color.name}</p>
                      <p className="text-sm text-neutral-500">{color.effect}</p>
                    </div>
                  </div>
                ))}
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

            {/* Continue Button */}
            <Button
              variant="primary"
              size="lg"
              fullWidth
              onClick={handleContinue}
              className="bg-primary-blue hover:bg-primary-blue/90"
            >
              힐링솔루션
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
