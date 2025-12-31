"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import FeedbackRating from "@/components/ui/FeedbackRating";
import BottomNavigation from "@/components/layout/BottomNavigation";
import type { FeedbackRating as FeedbackRatingType } from "@/types";

// Mock data for recommendations
const mockRecommendations = {
  color: {
    name: "부드러운 민트블루",
    hex: "#5ECFCF",
  },
  items: [
    {
      id: "1",
      imageUrl: "/images/recommendation/fashion-1.jpg",
      title: "민트 가디건",
    },
    {
      id: "2",
      imageUrl: "/images/recommendation/fashion-2.jpg",
      title: "하트 귀걸이",
    },
    {
      id: "3",
      imageUrl: "/images/recommendation/fashion-3.jpg",
      title: "민트 아이섀도우",
    },
  ],
  foods: [
    {
      id: "4",
      imageUrl: "/images/recommendation/food-1.jpg",
      title: "민트 마카롱",
    },
    {
      id: "5",
      imageUrl: "/images/recommendation/food-2.jpg",
      title: "민트초코 아이스",
    },
    {
      id: "6",
      imageUrl: "/images/recommendation/food-3.jpg",
      title: "민트 컵케이크",
    },
  ],
};

export default function RecommendationPage() {
  const router = useRouter();
  const [itemFeedback, setItemFeedback] = useState<FeedbackRatingType | undefined>();
  const [foodFeedback, setFoodFeedback] = useState<FeedbackRatingType | undefined>();

  const handleItemFeedback = (rating: FeedbackRatingType) => {
    setItemFeedback(rating);
    // TODO: Send feedback to API
    console.log("Item feedback:", rating);
  };

  const handleFoodFeedback = (rating: FeedbackRatingType) => {
    setFoodFeedback(rating);
    // TODO: Send feedback to API
    console.log("Food feedback:", rating);
  };

  const handleViewWeekly = () => {
    router.push("/insight");
  };

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
              style={{ backgroundColor: mockRecommendations.color.hex }}
            />
            <h2 className="text-lg font-bold text-neutral-800">
              {mockRecommendations.color.name}
            </h2>
          </div>
        </Card>

        {/* Fashion Items Section */}
        <Card variant="outlined" padding="lg">
          <div className="bg-primary-blue text-white text-center py-2 px-4 rounded-full text-sm font-medium mb-4 mx-auto w-fit">
            나만의 아이템을 찾을 수 있어요
          </div>

          <div className="grid grid-cols-3 gap-3 mb-4">
            {mockRecommendations.items.map((item) => (
              <div
                key={item.id}
                className="aspect-square rounded-xl bg-neutral-100 overflow-hidden relative"
              >
                {/* Placeholder for images */}
                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs">
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
            {mockRecommendations.foods.map((food) => (
              <div
                key={food.id}
                className="aspect-square rounded-xl bg-neutral-100 overflow-hidden relative"
              >
                {/* Placeholder for images */}
                <div className="w-full h-full flex items-center justify-center text-neutral-400 text-xs text-center p-2">
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
