import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { EmotionEntry, EmotionState, WeeklyInsight } from "@/types";
import { emotionService } from "@/services/api";

interface EmotionStoreState {
  currentEmotion: EmotionState | null;
  emotionHistory: EmotionEntry[];
  weeklyInsight: WeeklyInsight | null;
  isAnalyzing: boolean;
  isLoadingInsight: boolean;
  error: string | null;

  // Actions
  setCurrentEmotion: (emotion: EmotionState) => void;
  addEmotionEntry: (text: string) => Promise<EmotionEntry>;
  fetchEmotionHistory: (limit?: number) => Promise<EmotionEntry[]>;
  getWeeklyInsight: () => Promise<WeeklyInsight>;
  clearError: () => void;
}

export const useEmotionStore = create<EmotionStoreState>()(
  persist(
    (set, get) => ({
      currentEmotion: null,
      emotionHistory: [],
      weeklyInsight: null,
      isAnalyzing: false,
      isLoadingInsight: false,
      error: null,

      setCurrentEmotion: (emotion: EmotionState) => {
        set({ currentEmotion: emotion });
      },

      addEmotionEntry: async (text: string) => {
        set({ isAnalyzing: true, error: null });
        try {
          const response = await emotionService.analyzeEmotion(text);

          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "감정 분석에 실패했습니다.");
          }

          const entry = response.data;
          const currentHistory = get().emotionHistory;

          set({
            currentEmotion: entry.emotions,
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

      fetchEmotionHistory: async (limit?: number) => {
        set({ isAnalyzing: true, error: null });
        try {
          const response = await emotionService.getEmotionHistory(limit);

          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "감정 기록을 불러오는데 실패했습니다.");
          }

          const history = response.data;

          set({
            emotionHistory: history,
            isAnalyzing: false,
          });

          return history;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "감정 기록을 불러오는데 실패했습니다.";
          set({
            error: errorMessage,
            isAnalyzing: false,
          });
          throw error;
        }
      },

      getWeeklyInsight: async () => {
        set({ isLoadingInsight: true, error: null });
        try {
          const response = await emotionService.getWeeklyInsight();

          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "주간 인사이트를 불러오는데 실패했습니다.");
          }

          const insight = response.data;

          set({
            weeklyInsight: insight,
            isLoadingInsight: false,
          });

          return insight;
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : "주간 인사이트를 불러오는데 실패했습니다.";
          set({
            error: errorMessage,
            isLoadingInsight: false,
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
