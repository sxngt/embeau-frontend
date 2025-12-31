import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  authService,
  colorService,
  emotionService,
  recommendationService,
  feedbackService,
} from "@/services/api";
import type { FeedbackData } from "@/types";

// Query Keys
export const queryKeys = {
  profile: ["profile"] as const,
  colorResult: ["colorResult"] as const,
  dailyHealingColor: ["dailyHealingColor"] as const,
  emotionHistory: (limit?: number) => ["emotionHistory", limit] as const,
  weeklyInsight: ["weeklyInsight"] as const,
  recommendations: ["recommendations"] as const,
};

// Auth Hooks
export function useProfile() {
  return useQuery({
    queryKey: queryKeys.profile,
    queryFn: authService.getProfile,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Color Hooks
export function useColorResult() {
  return useQuery({
    queryKey: queryKeys.colorResult,
    queryFn: colorService.getColorResult,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useDailyHealingColor() {
  return useQuery({
    queryKey: queryKeys.dailyHealingColor,
    queryFn: colorService.getDailyHealingColor,
    staleTime: 60 * 60 * 1000, // 1 hour
  });
}

export function useAnalyzeColor() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (imageData: string) => colorService.analyzePersonalColor(imageData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.colorResult });
    },
  });
}

// Emotion Hooks
export function useEmotionHistory(limit?: number) {
  return useQuery({
    queryKey: queryKeys.emotionHistory(limit),
    queryFn: () => emotionService.getEmotionHistory(limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useWeeklyInsight() {
  return useQuery({
    queryKey: queryKeys.weeklyInsight,
    queryFn: emotionService.getWeeklyInsight,
    staleTime: 30 * 60 * 1000, // 30 minutes
  });
}

export function useAnalyzeEmotion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (text: string) => emotionService.analyzeEmotion(text),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["emotionHistory"] });
      queryClient.invalidateQueries({ queryKey: queryKeys.weeklyInsight });
    },
  });
}

// Recommendation Hooks
export function useRecommendations() {
  return useQuery({
    queryKey: queryKeys.recommendations,
    queryFn: recommendationService.getRecommendations,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Feedback Hooks
export function useSubmitFeedback() {
  return useMutation({
    mutationFn: (feedback: FeedbackData) => feedbackService.submitFeedback(feedback),
  });
}
