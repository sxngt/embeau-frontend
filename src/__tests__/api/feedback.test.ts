/**
 * @jest-environment node
 */
import { NextRequest } from 'next/server';

// Mock dependencies before importing the route
jest.mock('@/lib/supabase/server', () => ({
  createSupabaseServerClient: jest.fn(),
}));

import { POST } from '@/app/api/feedback/route';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createMockSupabaseClient, mockFeedback } from '../mocks/supabase';

describe('/api/feedback', () => {
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

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 5,
          targetType: 'color_result',
          targetId: 'test-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 400 if rating is not provided', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          targetType: 'color_result',
          targetId: 'test-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return 400 if rating is out of range', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 6, // Invalid - should be 1-5
          targetType: 'color_result',
          targetId: 'test-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return 400 if rating is less than 1', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 0,
          targetType: 'color_result',
          targetId: 'test-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
    });

    it('should return 400 if targetType is invalid', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 4,
          targetType: 'invalid_type',
          targetId: 'test-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should return 400 if targetId is not provided', async () => {
      const mockClient = createMockSupabaseClient();
      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 4,
          targetType: 'color_result',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error.code).toBe('BAD_REQUEST');
    });

    it('should successfully submit feedback', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockFeedback,
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 5,
          targetType: 'color_result',
          targetId: 'color-result-id-123',
          comment: '정말 만족합니다!',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('id');
      expect(data.data).toHaveProperty('rating');
      expect(data.data).toHaveProperty('targetType');
      expect(data.data).toHaveProperty('targetId');
    });

    it('should accept all valid target types', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockFeedback,
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const validTargetTypes = ['color_result', 'emotion_map', 'healing_color', 'recommendation'];

      for (const targetType of validTargetTypes) {
        const request = new NextRequest('http://localhost:3000/api/feedback', {
          method: 'POST',
          body: JSON.stringify({
            rating: 4,
            targetType,
            targetId: 'test-id',
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });

    it('should accept feedback without comment', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { ...mockFeedback, comment: null },
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 3,
          targetType: 'emotion_map',
          targetId: 'emotion-map-id',
          // No comment
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle database errors gracefully', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: null,
          error: {
            code: '23505',
            message: 'Duplicate key violation',
            details: '',
            hint: '',
          },
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      const request = new NextRequest('http://localhost:3000/api/feedback', {
        method: 'POST',
        body: JSON.stringify({
          rating: 5,
          targetType: 'color_result',
          targetId: 'test-id',
        }),
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error.code).toBe('DATABASE_ERROR');
    });

    it('should accept all valid rating values (1-5)', async () => {
      const mockClient = createMockSupabaseClient();

      mockClient.from = jest.fn(() => ({
        insert: jest.fn().mockReturnThis(),
        select: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: mockFeedback,
          error: null,
        }),
      }));

      (createSupabaseServerClient as jest.Mock).mockResolvedValue(mockClient);

      for (let rating = 1; rating <= 5; rating++) {
        const request = new NextRequest('http://localhost:3000/api/feedback', {
          method: 'POST',
          body: JSON.stringify({
            rating,
            targetType: 'color_result',
            targetId: 'test-id',
          }),
        });

        const response = await POST(request);
        expect(response.status).toBe(200);
      }
    });
  });
});
