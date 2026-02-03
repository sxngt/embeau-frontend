/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

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

import { POST } from '@/app/api/emotion/analyze/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import { createMockSupabaseClient, mockEmotionEntry } from '../mocks/supabase';
import { mockEmotionAnalysisResponse, createMockChatCompletion } from '../mocks/openai';

describe('/api/emotion/analyze', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST', () => {
    it('should return 401 if user is not authenticated', async () => {
      const mockClient = createMockSupabaseClient();
      mockClient.auth.getUser = jest.fn().mockResolvedValue({
        data: { user: null },
        error: { message: 'Not authenticated' },
      });
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: '오늘 기분이 좋아요' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 if text is not provided', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return 400 if text is empty', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: '   ' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should analyze text and return emotion scores with OpenAI', async () => {
      const mockClient = createMockSupabaseClient();

      // Mock from() to return proper query builder for insert
      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockEmotionEntry, id: 'new-entry-id' },
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockEmotionAnalysisResponse)
      );

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: '오늘 하루가 너무 피곤하고 스트레스 받았어요.' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('emotions');
      expect(data.data.emotions).toHaveProperty('anxiety');
      expect(data.data.emotions).toHaveProperty('stress');
      expect(data.data.emotions).toHaveProperty('satisfaction');
      expect(data.data.emotions).toHaveProperty('happiness');
      expect(data.data.emotions).toHaveProperty('depression');
      expect(data.data).toHaveProperty('healingColors');
    });

    it('should use keyword-based fallback when OpenAI fails', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockEmotionEntry, id: 'new-entry-id' },
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error('OpenAI API error')
      );

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: '너무 불안하고 걱정돼요' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.emotions).toBeDefined();
    });

    it('should detect anxiety keywords correctly', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockEmotionEntry, id: 'new-entry-id' },
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      // Use fallback (no OpenAI key in this test context)
      const originalEnv = process.env.OPENAI_API_KEY;
      delete process.env.OPENAI_API_KEY;

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: '불안하고 걱정되고 초조해요' }),
      });

      const response = await POST(request);
      const data = await response.json();

      process.env.OPENAI_API_KEY = originalEnv;

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should save emotion entry to database', async () => {
      const mockClient = createMockSupabaseClient();
      const mockInsert = jest.fn().mockReturnThis();

      mockClient.from = jest.fn(() => ({
        insert: mockInsert,
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockEmotionEntry, id: 'new-entry-id' },
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockEmotionAnalysisResponse)
      );

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: '테스트 텍스트입니다.' }),
      });

      await POST(request);

      expect(mockClient.from).toHaveBeenCalledWith('emotion_entries');
      expect(mockInsert).toHaveBeenCalled();
    });

    it('should return healing colors based on dominant emotion', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockEmotionEntry, id: 'new-entry-id' },
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockEmotionAnalysisResponse)
      );

      const request = new NextRequest('http://localhost:3000/api/emotion/analyze', {
        method: 'POST',
        body: JSON.stringify({ text: '스트레스 받아요' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(data.data.healingColors).toBeDefined();
      expect(Array.isArray(data.data.healingColors)).toBe(true);
    });
  });
});
