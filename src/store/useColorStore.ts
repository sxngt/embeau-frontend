import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersonalColorResult, DailyHealingColor, ColorItem } from "@/types";

interface ColorState {
  personalColorResult: PersonalColorResult | null;
  dailyHealingColor: DailyHealingColor | null;
  colorHistory: DailyHealingColor[];
  isAnalyzing: boolean;
  error: string | null;

  // Actions
  setPersonalColorResult: (result: PersonalColorResult) => void;
  setDailyHealingColor: (color: DailyHealingColor) => void;
  analyzeColor: (imageData: string) => Promise<PersonalColorResult>;
  clearColorResult: () => void;
  clearError: () => void;
}

// Mock personal color results for development
const mockColorResults: Record<string, PersonalColorResult> = {
  summer_cool: {
    season: "summer",
    tone: "cool",
    description: "자연스러운 광채를 돋보이게 하는 부드럽고 시원한 톤",
    recommendedColors: [
      { name: "겨자", hex: "#E6B422", description: "따뜻한 노란색" },
      { name: "주황색", hex: "#FF8C00", description: "생동감 있는 오렌지" },
      { name: "민트색", hex: "#98FF98", description: "상쾌한 민트" },
      { name: "라벤더", hex: "#E6E6FA", description: "부드러운 보라" },
    ],
    analyzedAt: new Date().toISOString(),
  },
};

export const useColorStore = create<ColorState>()(
  persist(
    (set, get) => ({
      personalColorResult: null,
      dailyHealingColor: null,
      colorHistory: [],
      isAnalyzing: false,
      error: null,

      setPersonalColorResult: (result: PersonalColorResult) => {
        set({ personalColorResult: result });
      },

      setDailyHealingColor: (color: DailyHealingColor) => {
        const currentHistory = get().colorHistory;
        set({
          dailyHealingColor: color,
          colorHistory: [color, ...currentHistory].slice(0, 30), // Keep last 30 days
        });
      },

      analyzeColor: async (imageData: string) => {
        set({ isAnalyzing: true, error: null });
        try {
          // TODO: Replace with actual API call
          // const response = await colorService.analyzePersonalColor(imageData);

          // Mock analysis for development
          await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API delay
          const result = mockColorResults.summer_cool;

          set({
            personalColorResult: result,
            isAnalyzing: false,
          });

          return result;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "색상 분석에 실패했습니다.";
          set({
            error: errorMessage,
            isAnalyzing: false,
          });
          throw error;
        }
      },

      clearColorResult: () => {
        set({ personalColorResult: null });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: "embeau-color",
      partialize: (state) => ({
        personalColorResult: state.personalColorResult,
        dailyHealingColor: state.dailyHealingColor,
        colorHistory: state.colorHistory,
      }),
    }
  )
);
