import type {
  ApiResponse,
  LoginResponse,
  PersonalColorResult,
  EmotionEntry,
  DailyHealingColor,
  Recommendation,
  WeeklyInsight,
  FeedbackData,
} from "@/types";

// Base API configuration
// Use proxy route to avoid HTTPS->HTTP mixed content issues on Vercel
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "/api/proxy";

// Token management
let accessToken: string | null = null;

export const setAccessToken = (token: string | null) => {
  accessToken = token;
  if (token) {
    localStorage.setItem("embeau-token", token);
  } else {
    localStorage.removeItem("embeau-token");
  }
};

export const getAccessToken = (): string | null => {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("embeau-token");
  }
  return accessToken;
};

export const clearAccessToken = () => {
  accessToken = null;
  localStorage.removeItem("embeau-token");
};

// Generic fetch wrapper with error handling
async function fetchApi<T>(
  endpoint: string,
  options?: RequestInit & { skipAuth?: boolean }
): Promise<ApiResponse<T>> {
  try {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options?.headers as Record<string, string>),
    };

    // Add Authorization header if token exists and not skipped
    const token = getAccessToken();
    if (token && !options?.skipAuth) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    const responseData = await response.json();

    if (!response.ok) {
      // Handle 401 Unauthorized - clear token
      if (response.status === 401) {
        clearAccessToken();
      }

      return {
        success: false,
        error: {
          code: responseData.error?.code || "UNKNOWN_ERROR",
          message: responseData.error?.message || "알 수 없는 오류가 발생했습니다.",
        },
      };
    }

    // Backend returns { success, data } structure
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

// Auth Service
export const authService = {
  login: (email: string, participantId: string) =>
    fetchApi<LoginResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, participantId }),
      skipAuth: true,
    }),

  logout: () =>
    fetchApi<void>("/auth/logout", {
      method: "POST",
    }),

  getProfile: () => fetchApi<LoginResponse["user"]>("/auth/profile"),
};

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
    fetchApi<void>("/feedback", {
      method: "POST",
      body: JSON.stringify(feedback),
    }),
};

// Report Service
export const reportService = {
  downloadWeeklyReport: async (): Promise<Blob> => {
    const headers: Record<string, string> = {
      Accept: "application/pdf",
    };

    const token = getAccessToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(`${API_BASE_URL}/reports/weekly`, {
      method: "GET",
      headers,
    });

    if (!response.ok) {
      throw new Error("리포트 다운로드에 실패했습니다.");
    }

    return response.blob();
  },
};
