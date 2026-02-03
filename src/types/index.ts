// User types
export interface User {
  id: string;
  email: string;
  participantId: string;
  name?: string;
  personalColor?: PersonalColorSummary;
  createdAt: string;
}

export interface PersonalColorSummary {
  season: string;
  tone: string;
}

// Personal Color types
export type PersonalColorSeason = "spring" | "summer" | "autumn" | "winter";
export type PersonalColorTone = "warm" | "cool";

export interface PersonalColorResult {
  season: PersonalColorSeason;
  tone: PersonalColorTone;
  description: string;
  recommendedColors: ColorItem[];
  analyzedAt: string;
}

export interface ColorItem {
  name: string;
  hex: string;
  description?: string;
}

// Emotion types
export interface EmotionState {
  anxiety: number; // 불안
  stress: number; // 스트레스
  satisfaction: number; // 만족
  happiness: number; // 행복
  depression: number; // 우울
}

export interface EmotionEntry {
  id: string;
  date: string;
  text: string;
  emotions: EmotionState;
  healingColors: HealingColor[];
}

export interface HealingColor {
  name: string;
  hex: string;
  effect: string;
}

// Daily Healing Color types
export interface DailyHealingColor {
  color: ColorItem;
  calmEffect: string;
  personalFit: string;
  dailyAffirmation: string;
  date: string;
}

// Recommendation types
export interface RecommendationItem {
  id: string;
  type: "fashion" | "food" | "activity";
  title: string;
  imageUrl: string;
  color: string;
}

export interface Recommendation {
  color: ColorItem;
  items: RecommendationItem[];
  foods: RecommendationItem[];
}

// Weekly Insight types
export interface WeeklyInsight {
  weekStart: string;
  weekEnd: string;
  emotionDistribution: {
    anxiety: number;
    stress: number;
    satisfaction: number;
    happiness: number;
    depression: number;
  };
  improvement: string;
  nextWeekSuggestion: string;
  stats: {
    activeDays: number;
    colorImprovement: number;
    moodImprovement: number;
    stressRelief: number;
  };
}

// Feedback types
export type FeedbackRating = 1 | 2 | 3 | 4 | 5;

export interface FeedbackData {
  rating: FeedbackRating;
  targetType: "color_result" | "emotion_map" | "healing_color" | "recommendation";
  targetId: string;
  timestamp: string;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// Navigation types
export type TabType = "home" | "guide" | "report";
