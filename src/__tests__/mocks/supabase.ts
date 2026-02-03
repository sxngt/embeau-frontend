// Mock Supabase client for testing

export const mockUser = {
  id: 'test-user-id-123',
  email: 'test@example.com',
  user_metadata: {
    participant_id: 'P12345',
  },
};

export const mockColorResult = {
  id: 'color-result-id-123',
  user_id: 'test-user-id-123',
  season: 'winter',
  tone: 'cool',
  subtype: 'Winter_cool',
  confidence: 0.85,
  description: '겨울 쿨톤입니다.',
  recommended_colors: [
    { name: '로얄 블루', hex: '#4169E1', description: '선명한 로얄 블루' },
    { name: '퓨어 화이트', hex: '#FFFFFF', description: '깔끔한 화이트' },
    { name: '블랙', hex: '#000000', description: '세련된 블랙' },
  ],
  facial_expression: 'neutral',
  analyzed_at: new Date().toISOString(),
};

export const mockEmotionEntry = {
  id: 'emotion-entry-id-123',
  user_id: 'test-user-id-123',
  input_text: '오늘 하루가 너무 피곤하고 스트레스 받았어요.',
  anxiety: 45,
  stress: 70,
  satisfaction: 30,
  happiness: 25,
  depression: 40,
  healing_colors: ['#E6E6FA', '#87CEEB'],
  created_at: new Date().toISOString(),
};

export const mockDailyHealingColor = {
  id: 'daily-healing-id-123',
  user_id: 'test-user-id-123',
  color_name: '라벤더',
  color_hex: '#E6E6FA',
  color_description: '차분한 라벤더',
  calm_effect: '마음을 편안하게 해주는 라벤더 컬러입니다.',
  personal_fit: '당신의 쿨톤과 잘 어울립니다.',
  daily_affirmation: '오늘 하루도 당신은 빛나는 존재입니다.',
  date: new Date().toISOString().split('T')[0],
};

export const mockWeeklyInsight = {
  id: 'weekly-insight-id-123',
  user_id: 'test-user-id-123',
  week_start: '2024-01-01',
  week_end: '2024-01-07',
  avg_anxiety: 45,
  avg_stress: 55,
  avg_satisfaction: 50,
  avg_happiness: 45,
  avg_depression: 35,
  improvement: '이번 주는 스트레스가 높았습니다.',
  next_week_suggestion: '휴식을 취해보세요.',
  active_days: 5,
  color_improvement: 75,
  mood_improvement: 10,
  stress_relief: 15,
};

export const mockFeedback = {
  id: 'feedback-id-123',
  user_id: 'test-user-id-123',
  rating: 4,
  target_type: 'color_result',
  target_id: 'color-result-id-123',
  comment: '만족합니다.',
  created_at: new Date().toISOString(),
};

// Mock Supabase query builder
export const createMockQueryBuilder = (data: unknown, error: unknown = null) => ({
  select: jest.fn().mockReturnThis(),
  insert: jest.fn().mockReturnThis(),
  update: jest.fn().mockReturnThis(),
  delete: jest.fn().mockReturnThis(),
  eq: jest.fn().mockReturnThis(),
  gte: jest.fn().mockReturnThis(),
  lt: jest.fn().mockReturnThis(),
  order: jest.fn().mockReturnThis(),
  limit: jest.fn().mockReturnThis(),
  single: jest.fn().mockResolvedValue({ data, error }),
  then: jest.fn((resolve) => resolve({ data, error })),
});

// Mock Supabase client
export const createMockSupabaseClient = (overrides: Record<string, unknown> = {}) => {
  const defaultAuth = {
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null,
    }),
    signInWithPassword: jest.fn().mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'test-token' } },
      error: null,
    }),
    signUp: jest.fn().mockResolvedValue({
      data: { user: mockUser, session: { access_token: 'test-token' } },
      error: null,
    }),
    signOut: jest.fn().mockResolvedValue({ error: null }),
  };

  return {
    auth: { ...defaultAuth, ...overrides.auth },
    from: jest.fn((table: string) => {
      const mockData: Record<string, unknown> = {
        color_results: mockColorResult,
        emotion_entries: mockEmotionEntry,
        daily_healing_colors: mockDailyHealingColor,
        weekly_insights: mockWeeklyInsight,
        feedbacks: mockFeedback,
        ...overrides.tables,
      };
      return createMockQueryBuilder(mockData[table] || null);
    }),
  };
};

// Jest mock for createSupabaseServerClient
export const mockCreateSupabaseServerClient = jest.fn(() =>
  Promise.resolve(createMockSupabaseClient())
);
