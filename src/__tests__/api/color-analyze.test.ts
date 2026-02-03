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

import { POST } from '@/app/api/color/analyze/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { openai } from '@/lib/openai';
import {
  createMockSupabaseClient,
  mockUser,
  mockColorResult,
} from '../mocks/supabase';
import { mockColorAnalysisResponse, createMockChatCompletion } from '../mocks/openai';

describe('/api/color/analyze', () => {
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

      const request = new NextRequest('http://localhost:3000/api/color/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'base64imagedata' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 if image is not provided', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/color/analyze', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should analyze image and return color result with OpenAI', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockColorAnalysisResponse)
      );

      const request = new NextRequest('http://localhost:3000/api/color/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,/9j/4AAQSkZJRg...' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('season');
      expect(data.data).toHaveProperty('tone');
      expect(data.data).toHaveProperty('recommendedColors');
      expect(data.data).toHaveProperty('_debug');
      expect(data.data._debug.source).toBe('gpt-4o-vision');
    });

    it('should use fallback when OpenAI fails', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockRejectedValue(
        new Error('OpenAI API error')
      );

      const request = new NextRequest('http://localhost:3000/api/color/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,testdata' }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.season).toBe('summer'); // fallback default
      expect(data.data._debug.source).toBe('fallback');
    });

    it('should handle base64 image without data URL prefix', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockColorAnalysisResponse)
      );

      const request = new NextRequest('http://localhost:3000/api/color/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: '/9j/4AAQSkZJRg...' }), // Without data URL prefix
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should save result to database', async () => {
      const mockClient = createMockSupabaseClient();
      const mockInsert = jest.fn().mockReturnThis();
      const mockUpdate = jest.fn().mockReturnThis();

      mockClient.from = jest.fn(() => ({
        select: jest.fn().mockReturnThis(),
        insert: mockInsert,
        update: mockUpdate,
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({ data: null, error: null }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      (openai.chat.completions.create as jest.Mock).mockResolvedValue(
        createMockChatCompletion(mockColorAnalysisResponse)
      );

      const request = new NextRequest('http://localhost:3000/api/color/analyze', {
        method: 'POST',
        body: JSON.stringify({ image: 'data:image/jpeg;base64,testdata' }),
      });

      await POST(request);

      expect(mockClient.from).toHaveBeenCalledWith('color_results');
    });
  });
});
