"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackRating from "@/components/ui/FeedbackRating";
import BottomNavigation from "@/components/layout/BottomNavigation";
import { recommendationService, feedbackService } from "@/services/api";
import type { FeedbackRating as FeedbackRatingType, Recommendation } from "@/types";

export default function RecommendationPage() {
  const router = useRouter();
  const [recommendations, setRecommendations] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [itemFeedback, setItemFeedback] = useState<FeedbackRatingType | undefined>();
  const [foodFeedback, setFoodFeedback] = useState<FeedbackRatingType | undefined>();

  useEffect(() => {
    const fetchRecommendations = async () => {
      try {
        setIsLoading(true);
        const response = await recommendationService.getRecommendations();
        if (response.success && response.data) {
          setRecommendations(response.data);
        } else {
          setError(response.error?.message || "추천을 불러오는데 실패했습니다.");
        }
      } catch (err) {
        setError("추천을 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRecommendations();
  }, []);

  const handleItemFeedback = async (rating: FeedbackRatingType) => {
    setItemFeedback(rating);
    try {
      await feedbackService.submitFeedback({
        rating,
        targetType: "recommendation",
        targetId: "items",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Item feedback failed:", error);
    }
  };

  const handleFoodFeedback = async (rating: FeedbackRatingType) => {
    setFoodFeedback(rating);
    try {
      await feedbackService.submitFeedback({
        rating,
        targetType: "recommendation",
        targetId: "foods",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Food feedback failed:", error);
    }
  };

  const handleViewWeekly = () => {
    router.push("/insight");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-primary-blue border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-neutral-600">추천을 불러오는 중...</p>
        </div>
      </div>
    );
  }

  if (error || !recommendations) {
    return (
      <div className="min-h-screen flex items-center justify-center px-5">
        <Card variant="outlined" padding="lg" className="text-center max-w-md">
          <p className="text-neutral-600 mb-4">{error || "추천을 불러오는데 실패했습니다."}</p>
          <Button variant="secondary" onClick={() => window.location.reload()}>
            다시 시도
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-36">
      {/* Header Banner */}
      <div className="bg-primary-blue text-white text-center py-2 md:py-3 text-sm md:text-base font-medium rounded-b-2xl mx-4 md:mx-8 lg:mx-16 mt-2 max-w-3xl lg:max-w-none lg:mx-auto">
        내면과 외면을 채우는 컬러실천
      </div>

      {/* Title Section */}
      <div className="text-center pt-8 md:pt-12 px-8 mb-6">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary-blue mb-2">추천</h1>
        <p className="text-neutral-700 md:text-lg">나만의 맞춤 웰니스 추천</p>
      </div>

      <div className="px-5 md:px-8 lg:px-16 space-y-5 max-w-3xl mx-auto">
        {/* Color Display Card */}
        <Card variant="outlined" padding="lg">
          <div className="flex flex-col items-center">
            <div
              className="w-20 h-20 rounded-full mb-3 shadow-lg"
              style={{ backgroundColor: recommendations.color.hex }}
            />
            <h2 className="text-lg font-bold text-neutral-800">
              {recommendations.color.name}
            </h2>
          </div>
        </Card>

        {/* Fashion Items Section */}
        <Card variant="outlined" padding="lg">
          <div className="bg-primary-blue text-white text-center py-2 px-4 rounded-full text-sm font-medium mb-4 mx-auto w-fit">
            나만의 아이템을 찾을 수 있어요
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {recommendations.items.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-xl overflow-hidden relative"
                style={{ backgroundColor: item.color || recommendations.color.hex }}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-xs text-center p-2 font-medium">
                  {item.title}
                </div>
              </div>
            ))}
          </div>

          <FeedbackRating
            value={itemFeedback}
            onChange={handleItemFeedback}
            label="추천이 마음에 드시나요?"
          />
        </Card>

        {/* Food Items Section */}
        <Card variant="outlined" padding="lg">
          <div className="bg-primary-blue text-white text-center py-2 px-4 rounded-full text-sm font-medium mb-4 mx-auto w-fit">
            나만의 힐링푸드를 먹을 수 있어요
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {recommendations.foods.map((food) => (
              <div
                key={food.id}
                className="aspect-square rounded-xl overflow-hidden relative"
                style={{ backgroundColor: food.color || recommendations.color.hex }}
              >
                <div className="w-full h-full flex items-center justify-center text-white text-xs text-center p-2 font-medium">
                  {food.title}
                </div>
              </div>
            ))}
          </div>

          <FeedbackRating
            value={foodFeedback}
            onChange={handleFoodFeedback}
            label="추천이 마음에 드시나요?"
          />
        </Card>

        {/* Weekly Review Button */}
        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleViewWeekly}
          className="bg-primary-blue hover:bg-primary-blue/90"
        >
          한주간 돌아보기
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
