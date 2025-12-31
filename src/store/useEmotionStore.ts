import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EmotionEntry, EmotionState, HealingColor, WeeklyInsight } from "@/types";

interface EmotionStoreState {
  currentEmotion: EmotionState | null;
  emotionHistory: EmotionEntry[];
  weeklyInsight: WeeklyInsight | null;
  isAnalyzing: boolean;
  error: string | null;

  // Actions
  setCurrentEmotion: (emotion: EmotionState) => void;
  addEmotionEntry: (text: string) => Promise<EmotionEntry>;
  getWeeklyInsight: () => Promise<WeeklyInsight>;
  clearError: () => void;
}

// Mock healing colors based on emotion
const getHealingColors = (emotions: EmotionState): HealingColor[] => {
  const colors: HealingColor[] = [];

  if (emotions.anxiety > 50) {
    colors.push({
      name: "편안한 라벤더",
      hex: "#E6E6FA",
      effect: "불안을 줄여줍니다.",
    });
  }

  if (emotions.stress > 50) {
    colors.push({
      name: "평화로운 녹색",
      hex: "#90EE90",
      effect: "균형을 촉진합니다.",
    });
  }

  if (emotions.depression > 50) {
    colors.push({
      name: "따뜻한 노란색",
      hex: "#FFD700",
      effect: "기분을 밝게 해줍니다.",
    });
  }

  if (colors.length === 0) {
    colors.push({
      name: "부드러운 민트블루",
      hex: "#5ECFCF",
      effect: "마음의 평화를 유지합니다.",
    });
  }

  return colors;
};

export const useEmotionStore = create<EmotionStoreState>()(
  persist(
    (set, get) => ({
      currentEmotion: null,
      emotionHistory: [],
      weeklyInsight: null,
      isAnalyzing: false,
      error: null,

      setCurrentEmotion: (emotion: EmotionState) => {
        set({ currentEmotion: emotion });
      },

      addEmotionEntry: async (text: string) => {
        set({ isAnalyzing: true, error: null });
        try {
          // TODO: Replace with actual API call for emotion analysis
          // const response = await emotionService.analyzeEmotion(text);

          // Mock emotion analysis
          await new Promise((resolve) => setTimeout(resolve, 1500));

          const mockEmotion: EmotionState = {
            anxiety: Math.floor(Math.random() * 100),
            stress: Math.floor(Math.random() * 100),
            satisfaction: Math.floor(Math.random() * 100),
            happiness: Math.floor(Math.random() * 100),
            depression: Math.floor(Math.random() * 100),
          };

          const entry: EmotionEntry = {
            id: "emotion_" + Date.now(),
            date: new Date().toISOString(),
            text,
            emotions: mockEmotion,
            healingColors: getHealingColors(mockEmotion),
          };

          const currentHistory = get().emotionHistory;
          set({
            currentEmotion: mockEmotion,
            emotionHistory: [entry, ...currentHistory].slice(0, 100),
            isAnalyzing: false,
          });

          return entry;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "감정 분석에 실패했습니다.";
          set({
            error: errorMessage,
            isAnalyzing: false,
          });
          throw error;
        }
      },

      getWeeklyInsight: async () => {
        set({ isAnalyzing: true, error: null });
        try {
          // TODO: Replace with actual API call
          // const response = await emotionService.getWeeklyInsight();

          // Mock weekly insight
          await new Promise((resolve) => setTimeout(resolve, 1000));

          const now = new Date();
          const weekStart = new Date(now);
          weekStart.setDate(now.getDate() - 7);

          const insight: WeeklyInsight = {
            weekStart: weekStart.toISOString(),
            weekEnd: now.toISOString(),
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

          set({
            weeklyInsight: insight,
            isAnalyzing: false,
          });

          return insight;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "주간 인사이트를 불러오는데 실패했습니다.";
          set({
            error: errorMessage,
            isAnalyzing: false,
          });
          throw error;
        }
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "embeau-emotion",
      partialize: (state) => ({
        emotionHistory: state.emotionHistory,
        weeklyInsight: state.weeklyInsight,
      }),
    }
  )
);
