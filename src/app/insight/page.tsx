"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import BottomNavigation from "@/components/layout/BottomNavigation";
import EmotionPieChart from "@/components/charts/EmotionPieChart";
import { useEmotionStore } from "@/store/useEmotionStore";

export default function InsightPage() {
  const router = useRouter();
  const { weeklyInsight, getWeeklyInsight, isAnalyzing } = useEmotionStore();

  useEffect(() => {
    if (!weeklyInsight) {
      getWeeklyInsight();
    }
  }, [weeklyInsight, getWeeklyInsight]);

  // Mock data while loading
  const insight = weeklyInsight || {
    emotionDistribution: {
      anxiety: 35,
      stress: 35,
      satisfaction: 35,
      happiness: 70,
      depression: 70,
    },
    improvement: "불안에서 안정으로 더 빠른 전환. 이번주 당신의 회복시간이 40% 향상되었습니다.",
    nextWeekSuggestion: "다음 주에는 라벤더 색을 더 활용해보세요. 마음이 한결 가벼워 질꺼에요",
    stats: {
      activeDays: 7,
      colorImprovement: 23,
      moodImprovement: 85,
      stressRelief: 12,
    },
  };

  const handleDownload = () => {
    // TODO: Implement PDF download
    console.log("Downloading report...");
  };

  const handleGoHome = () => {
    router.push("/main");
  };

  return (
    <div className="min-h-screen pb-36">
      {/* Title Section */}
      <div className="text-center pt-12 md:pt-16 px-8 mb-8">
        <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-3">
          <span className="text-gradient-purple">주간</span>{" "}
          <span className="text-primary-blue">인사이트</span>
        </h1>
      </div>

      <div className="px-5 md:px-8 lg:px-16 space-y-5 max-w-3xl mx-auto">
        {/* Emotion Distribution Card */}
        <Card variant="outlined" padding="lg">
          <h3 className="font-semibold text-neutral-800 text-center mb-4">
            감정 분포
          </h3>
          <EmotionPieChart distribution={insight.emotionDistribution} />
        </Card>

        {/* Main Improvement Card */}
        <Card variant="outlined" padding="lg">
          <h3 className="font-semibold text-primary-blue mb-2">주요개선</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {insight.improvement}
          </p>
        </Card>

        {/* Next Week Suggestion Card */}
        <Card variant="outlined" padding="lg" className="bg-neutral-50">
          <h3 className="font-semibold text-neutral-800 mb-2">다음 주 추천</h3>
          <p className="text-sm text-neutral-600 leading-relaxed">
            {insight.nextWeekSuggestion}
          </p>
        </Card>

        {/* Stats Card */}
        <Card variant="outlined" padding="lg">
          <h3 className="font-semibold text-neutral-800 mb-4">이번 주 통계</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-pink">
                {insight.stats.activeDays}
              </p>
              <p className="text-xs text-neutral-500">활동 일수</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-blue">
                {insight.stats.colorImprovement}
              </p>
              <p className="text-xs text-neutral-500">색상 개선</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-pink">
                {insight.stats.moodImprovement}%
              </p>
              <p className="text-xs text-neutral-500">기분 개선</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-primary-blue">
                {insight.stats.stressRelief}
              </p>
              <p className="text-xs text-neutral-500">스트레스 해소</p>
            </div>
          </div>
        </Card>

        {/* Action Buttons */}
        <Button
          variant="outline"
          size="lg"
          fullWidth
          onClick={handleDownload}
          className="border-primary-pink text-primary-pink hover:bg-primary-pink hover:text-white"
        >
          <Download className="w-5 h-5 mr-2" />
          다운로드
        </Button>

        <Button
          variant="primary"
          size="lg"
          fullWidth
          onClick={handleGoHome}
          className="bg-primary-blue hover:bg-primary-blue/90"
        >
          처음 화면으로 돌아가기
        </Button>
      </div>

      <BottomNavigation />
    </div>
  );
}
