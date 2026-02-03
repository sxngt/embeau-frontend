/**
 * @jest-environment node
 */

// Mock dependencies before importing the route
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

jest.mock('@/lib/openai', () => ({
  openai: {
    chat: {
      completions: {
        create: jest.fn(),
      },
    },
  },
  OPENAI_MODELS: {
    vision: 'gpt-4o',
    text: 'gpt-4o-mini',
  },
}));

import { GET } from '@/app/api/recommendations/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import {
  createMockSupabaseClient,
  mockColorResult,
  mockEmotionEntry,
} from '../mocks/supabase';
import { mockRecommendationsResponse, createMockChatCompletion } from '../mocks/openai';

describe('/api/recommendations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('GET', () => {
    it('should return 401 if user is not authenticated', async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return personalized recommendations with OpenAI', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn((table: string) => {
        if (table === 'color_results') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockColorResult, error: null }),
          };
        }

        if (table === 'emotion_entries') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: [mockEmotionEntry],
              error: null,
            }),
          };
        }

        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockRecommendationsResponse)
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('color');
      expect(data.data).toHaveProperty('items'); // fashion
      expect(data.data).toHaveProperty('foods');
      expect(data.data).toHaveProperty('activities');
      expect(data.data._debug.source).toBe('openai');
    });

    it('should include user personal color information', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn((table: string) => {
        if (table === 'color_results') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockColorResult, error: null }),
          };
        }

        if (table === 'emotion_entries') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }

        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockRecommendationsResponse)
      );

      const response = await GET();
      const data = await response.json();

      expect(data.data.color.name).toBe(mockColorResult.recommended_colors[0].name);
      expect(data.data._debug.season).toBe(mockColorResult.season);
      expect(data.data._debug.tone).toBe(mockColorResult.tone);
    });

    it('should use fallback when OpenAI fails', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn((table: string) => {
        if (table === 'color_results') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockColorResult, error: null }),
          };
        }

        if (table === 'emotion_entries') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }

        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error('OpenAI API error')
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      // Even when OpenAI fails, the API should return recommendations using fallback
      expect(data.data.items.length).toBeGreaterThan(0);
      // The source reflects environment setup, not actual usage
      expect(data.data._debug.source).toBe('openai');
    });

    it('should use default values when user has no color result', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn((table: string) => {
        if (table === 'color_results') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }

        if (table === 'emotion_entries') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }

        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockRecommendationsResponse)
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data._debug.season).toBe('summer'); // default
      expect(data.data._debug.tone).toBe('cool'); // default
    });

    it('should consider recent emotion entries for personalization', async () => {
      const mockClient = createMockSupabaseClient();

      const highStressEmotions = [
        { ...mockEmotionEntry, stress: 80, anxiety: 70 },
        { ...mockEmotionEntry, stress: 75, anxiety: 65 },
      ];

      mockClient.from = jest.fn((table: string) => {
        if (table === 'color_results') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockColorResult, error: null }),
          };
        }

        if (table === 'emotion_entries') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({
              data: highStressEmotions,
              error: null,
            }),
          };
        }

        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      // Capture the OpenAI call to verify emotion context is included
      let capturedPrompt = '';
      (openai.chat.completions.create as jest.Mock).mockImplementation(({ messages }) => {
        const userMessage = messages.find((m: { role: string }) => m.role === 'user');
        capturedPrompt = userMessage?.content || '';
        return Promise.resolve(createMockChatCompletion(mockRecommendationsResponse));
      });

      await GET();

      // The prompt should include emotion information
      expect(capturedPrompt).toContain('스트레스가 높음');
    });

    it('should return valid recommendation structure', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn((table: string) => {
        if (table === 'color_results') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockColorResult, error: null }),
          };
        }

        if (table === 'emotion_entries') {
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            order: jest.fn().mockReturnThis(),
            limit: jest.fn().mockResolvedValue({ data: [], error: null }),
          };
        }

        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: null, error: null }),
        };
      });

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockRecommendationsResponse)
      );

      const response = await GET();
      const data = await response.json();

      // Validate structure of fashion items
      data.data.items.forEach((item: { id: string; type: string; title: string; description: string; color: string }) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('title');
        expect(item).toHaveProperty('description');
        expect(item).toHaveProperty('color');
      });

      // Validate structure of food items
      data.data.foods.forEach((item: { id: string; type: string; title: string }) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('title');
      });

      // Validate structure of activities
      data.data.activities.forEach((item: { id: string; type: string; title: string }) => {
        expect(item).toHaveProperty('id');
        expect(item).toHaveProperty('type');
        expect(item).toHaveProperty('title');
      });
    });
  });
});
