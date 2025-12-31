import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { PersonalColorResult, DailyHealingColor } from "@/types";
import { colorService } from "@/services/api";

interface ColorState {
  personalColorResult: PersonalColorResult | null;
  dailyHealingColor: DailyHealingColor | null;
  colorHistory: DailyHealingColor[];
  isAnalyzing: boolean;
  isLoadingHealingColor: boolean;
  error: string | null;

  // Actions
  setPersonalColorResult: (result: PersonalColorResult) => void;
  setDailyHealingColor: (color: DailyHealingColor) => void;
  analyzeColor: (imageData: string) => Promise<PersonalColorResult>;
  fetchDailyHealingColor: () => Promise<DailyHealingColor>;
  clearColorResult: () => void;
  clearError: () => void;
}

export const useColorStore = create<ColorState>()(
  persist(
    (set, get) => ({
      personalColorResult: null,
      dailyHealingColor: null,
      colorHistory: [],
      isAnalyzing: false,
      isLoadingHealingColor: false,
      error: null,

      setPersonalColorResult: (result: PersonalColorResult) => {
        set({ personalColorResult: result });
      },

      setDailyHealingColor: (color: DailyHealingColor) => {
        const currentHistory = get().colorHistory;
        set({
          dailyHealingColor: color,
          colorHistory: [color, ...currentHistory].slice(0, 30),
        });
      },

      analyzeColor: async (imageData: string) => {
        set({ isAnalyzing: true, error: null });
        try {
          const response = await colorService.analyzePersonalColor(imageData);

          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "색상 분석에 실패했습니다.");
          }

          const result = response.data;

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

      fetchDailyHealingColor: async () => {
        set({ isLoadingHealingColor: true, error: null });
        try {
          const response = await colorService.getDailyHealingColor();

          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "힐링 컬러를 불러오는데 실패했습니다.");
          }

          const healingColor = response.data;
          const currentHistory = get().colorHistory;

          set({
            dailyHealingColor: healingColor,
            colorHistory: [healingColor, ...currentHistory].slice(0, 30),
            isLoadingHealingColor: false,
          });

          return healingColor;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "힐링 컬러를 불러오는데 실패했습니다.";
          set({
            error: errorMessage,
            isLoadingHealingColor: false,
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
