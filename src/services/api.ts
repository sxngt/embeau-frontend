import type {
  ApiResponse,
  PersonalColorResult,
  EmotionEntry,
  DailyHealingColor,
  Recommendation,
  WeeklyInsight,
  FeedbackData,
} from "@/types";

// Base API configuration - Now uses Next.js API routes directly
const API_BASE_URL = "/api";

// Generic fetch wrapper with error handling
// Auth is handled by Supabase cookies automatically
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
      credentials: "include", // Include cookies for Supabase auth
    });

    const responseData = await response.json();

    if (!response.ok) {
      return {
        success: false,
        error: {
          code: responseData.error?.code || "UNKNOWN_ERROR",
          message: responseData.error?.message || "알 수 없는 오류가 발생했습니다.",
        },
      };
    }

    // API returns { success, data } structure
    if (responseData.success !== undefined) {
      return responseData as ApiResponse<T>;
    }

    // Fallback for direct data response
    return {
      success: true,
      data: responseData as T,
    };
  } catch (error) {
    return {
      success: false,
      error: {
        code: "NETWORK_ERROR",
        message: "네트워크 오류가 발생했습니다. 인터넷 연결을 확인해주세요.",
      },
    };
  }
}

// Color Analysis Service
export const colorService = {
  analyzePersonalColor: (imageData: string) =>
    fetchApi<PersonalColorResult>("/color/analyze", {
      method: "POST",
      body: JSON.stringify({ image: imageData }),
    }),

  getColorResult: () => fetchApi<PersonalColorResult>("/color/result"),

  getDailyHealingColor: () => fetchApi<DailyHealingColor>("/color/daily-healing"),
};

// Emotion Service
export const emotionService = {
  analyzeEmotion: (text: string) =>
    fetchApi<EmotionEntry>("/emotion/analyze", {
      method: "POST",
      body: JSON.stringify({ text }),
    }),

  getEmotionHistory: (limit?: number) =>
    fetchApi<EmotionEntry[]>(`/emotion/history${limit ? `?limit=${limit}` : ""}`),

  getWeeklyInsight: () => fetchApi<WeeklyInsight>("/emotion/weekly-insight"),
};

// Recommendation Service
export const recommendationService = {
  getRecommendations: () => fetchApi<Recommendation>("/recommendations"),

  getRecommendationsByColor: (colorHex: string) =>
    fetchApi<Recommendation>(`/recommendations/by-color?color=${encodeURIComponent(colorHex)}`),
};

// Feedback Service
export const feedbackService = {
  submitFeedback: (feedback: FeedbackData) =>
    fetchApi<{ id: string; rating: number; targetType: string; targetId: string; createdAt: string }>(
      "/feedback",
      {
        method: "POST",
        body: JSON.stringify(feedback),
      }
    ),
};

// Report Service - Now uses client-side PDF generation
// Use the useWeeklyReport hook from @/hooks/useWeeklyReport instead for PDF download
export const reportService = {
  getWeeklyReportData: () =>
    fetchApi<{
      user: { email: string; participantId: string };
      weekStart: string;
      weekEnd: string;
      personalColor?: { season: string; tone: string; description: string };
      emotionSummary?: {
        anxiety: number;
        stress: number;
        satisfaction: number;
        happiness: number;
        depression: number;
        totalEntries: number;
      };
      weeklyInsight?: {
        improvement: string;
        nextWeekSuggestion: string;
        activeDays: number;
        moodImprovement: number;
        stressRelief: number;
        colorImprovement: number;
      };
    }>("/reports/weekly"),
};
