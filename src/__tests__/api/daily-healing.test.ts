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

import { GET } from '@/app/api/color/daily-healing/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import {
  createMockSupabaseClient,
  mockDailyHealingColor,
  mockColorResult,
} from '../mocks/supabase';
import { mockHealingContentResponse, createMockChatCompletion } from '../mocks/openai';

describe('/api/color/daily-healing', () => {
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

    it('should return existing daily healing color if already generated today', async () => {
      const mockClient = createMockSupabaseClient();

      // First call for daily_healing_colors (existing), second for color_results
      let callCount = 0;
      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockImplementation(() => {
          callCount++;
          if (callCount === 1) {
            return Promise.resolve({ data: mockDailyHealingColor, error: null });
          }
          return Promise.resolve({ data: mockColorResult, error: null });
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.color.name).toBe(mockDailyHealingColor.color_name);
      expect(data.data.calmEffect).toBe(mockDailyHealingColor.calm_effect);
    });

    it('should generate new daily healing color with OpenAI if not exists', async () => {
      const mockClient = createMockSupabaseClient();

      let fromCallCount = 0;
      mockClient.from = jest.fn((table: string) => {
        fromCallCount++;

        if (table === 'daily_healing_colors' && fromCallCount === 1) {
          // Check for existing - return null
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }

        if (table === 'color_results') {
          // Get personal color
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: mockColorResult, error: null }),
          };
        }

        if (table === 'daily_healing_colors') {
          // Insert new
          return {
            insert: jest.fn().mockReturnThis(),
            select: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({
              data: { id: 'new-healing-id' },
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
        createMockChatCompletion(mockHealingContentResponse)
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('color');
      expect(data.data).toHaveProperty('calmEffect');
      expect(data.data).toHaveProperty('personalFit');
      expect(data.data).toHaveProperty('dailyAffirmation');
    });

    it('should use fallback when OpenAI fails', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn((table: string) => {
        if (table === 'daily_healing_colors') {
          return {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }

        return {
          select: jest.fn().mockReturnThis(),
          eq: jest.fn().mockReturnThis(),
          single: jest.fn().mockResolvedValue({ data: mockColorResult, error: null }),
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
      // Fallback should still provide content
      expect(data.data.calmEffect).toBeDefined();
    });

    it('should use default palette when user has no personal color', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn((table: string) => {
        if (table === 'daily_healing_colors') {
          return {
            select: jest.fn().mockReturnThis(),
            insert: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          };
        }

        if (table === 'color_results') {
          // No personal color
          return {
            select: jest.fn().mockReturnThis(),
            eq: jest.fn().mockReturnThis(),
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
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
        createMockChatCompletion(mockHealingContentResponse)
      );

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.color).toBeDefined();
    });
  });
});
