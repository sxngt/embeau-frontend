import { act, renderHook, waitFor } from '@testing-library/react';

// Mock the API service
const mockAnalyzeEmotion = jest.fn();
const mockGetEmotionHistory = jest.fn();
const mockGetWeeklyInsight = jest.fn();

jest.mock('@/services/api', () => ({
  emotionService: {
    analyzeEmotion: (...args: unknown[]) => mockAnalyzeEmotion(...args),
    getEmotionHistory: (...args: unknown[]) => mockGetEmotionHistory(...args),
    getWeeklyInsight: () => mockGetWeeklyInsight(),
  },
}));

import { useEmotionStore } from '@/store/useEmotionStore';

describe('useEmotionStore', () => {
  const mockEmotionEntry = {
    id: 'entry-1',
    inputText: '오늘 기분이 좋아요',
    emotions: {
      anxiety: 10,
      stress: 15,
      satisfaction: 80,
      happiness: 85,
      depression: 5,
    },
    healingColors: [
      { name: '코랄', hex: '#FF7F50', description: '따뜻한 코랄' },
    ],
    createdAt: '2024-01-01T10:00:00Z',
  };

  const mockWeeklyInsight = {
    weekStart: '2024-01-01',
    weekEnd: '2024-01-07',
    avgAnxiety: 20,
    avgStress: 25,
    avgSatisfaction: 70,
    avgHappiness: 75,
    avgDepression: 10,
    improvement: '스트레스가 지난주 대비 20% 감소했어요.',
    nextWeekSuggestion: '명상을 시도해보세요.',
    activeDays: 5,
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store state
    act(() => {
      useEmotionStore.setState({
        currentEmotion: null,
        emotionHistory: [],
        weeklyInsight: null,
        isAnalyzing: false,
        isLoadingInsight: false,
        error: null,
      });
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useEmotionStore());

      expect(result.current.currentEmotion).toBeNull();
      expect(result.current.emotionHistory).toEqual([]);
      expect(result.current.weeklyInsight).toBeNull();
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.isLoadingInsight).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setCurrentEmotion', () => {
    it('should set current emotion', () => {
      const { result } = renderHook(() => useEmotionStore());

      act(() => {
        result.current.setCurrentEmotion(mockEmotionEntry.emotions);
      });

      expect(result.current.currentEmotion).toEqual(mockEmotionEntry.emotions);
    });
  });

  describe('addEmotionEntry', () => {
    it('should analyze emotion and add entry successfully', async () => {
      mockAnalyzeEmotion.mockResolvedValue({
        success: true,
        data: mockEmotionEntry,
      });

      const { result } = renderHook(() => useEmotionStore());

      await act(async () => {
        await result.current.addEmotionEntry('오늘 기분이 좋아요');
      });

      expect(mockAnalyzeEmotion).toHaveBeenCalledWith('오늘 기분이 좋아요');
      expect(result.current.currentEmotion).toEqual(mockEmotionEntry.emotions);
      expect(result.current.emotionHistory).toHaveLength(1);
      expect(result.current.emotionHistory[0]).toEqual(mockEmotionEntry);
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should add new entries at the beginning of history', async () => {
      const { result } = renderHook(() => useEmotionStore());

      mockAnalyzeEmotion.mockResolvedValue({
        success: true,
        data: { ...mockEmotionEntry, id: 'entry-1' },
      });

      await act(async () => {
        await result.current.addEmotionEntry('첫 번째');
      });

      mockAnalyzeEmotion.mockResolvedValue({
        success: true,
        data: { ...mockEmotionEntry, id: 'entry-2' },
      });

      await act(async () => {
        await result.current.addEmotionEntry('두 번째');
      });

      expect(result.current.emotionHistory[0].id).toBe('entry-2');
      expect(result.current.emotionHistory[1].id).toBe('entry-1');
    });

    it('should handle analysis error and set error state', async () => {
      mockAnalyzeEmotion.mockResolvedValue({
        success: false,
        error: { message: '분석에 실패했습니다.' },
      });

      const { result } = renderHook(() => useEmotionStore());

      await act(async () => {
        try {
          await result.current.addEmotionEntry('테스트');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('분석에 실패했습니다.');
      });

      expect(result.current.isAnalyzing).toBe(false);
    });

    it('should handle network error and set error state', async () => {
      mockAnalyzeEmotion.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useEmotionStore());

      await act(async () => {
        try {
          await result.current.addEmotionEntry('테스트');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('fetchEmotionHistory', () => {
    it('should fetch emotion history successfully', async () => {
      const mockHistory = [
        { ...mockEmotionEntry, id: 'entry-1' },
        { ...mockEmotionEntry, id: 'entry-2' },
      ];

      mockGetEmotionHistory.mockResolvedValue({
        success: true,
        data: mockHistory,
      });

      const { result } = renderHook(() => useEmotionStore());

      let returnedHistory;
      await act(async () => {
        returnedHistory = await result.current.fetchEmotionHistory();
      });

      expect(result.current.emotionHistory).toEqual(mockHistory);
      expect(result.current.isAnalyzing).toBe(false);
      expect(returnedHistory).toEqual(mockHistory);
    });

    it('should pass limit parameter', async () => {
      mockGetEmotionHistory.mockResolvedValue({
        success: true,
        data: [mockEmotionEntry],
      });

      const { result } = renderHook(() => useEmotionStore());

      await act(async () => {
        await result.current.fetchEmotionHistory(10);
      });

      expect(mockGetEmotionHistory).toHaveBeenCalledWith(10);
    });

    it('should handle fetch error and set error state', async () => {
      mockGetEmotionHistory.mockResolvedValue({
        success: false,
        error: { message: '기록을 불러올 수 없습니다.' },
      });

      const { result } = renderHook(() => useEmotionStore());

      await act(async () => {
        try {
          await result.current.fetchEmotionHistory();
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('기록을 불러올 수 없습니다.');
      });

      expect(result.current.isAnalyzing).toBe(false);
    });
  });

  describe('getWeeklyInsight', () => {
    it('should fetch weekly insight successfully', async () => {
      mockGetWeeklyInsight.mockResolvedValue({
        success: true,
        data: mockWeeklyInsight,
      });

      const { result } = renderHook(() => useEmotionStore());

      let returnedInsight;
      await act(async () => {
        returnedInsight = await result.current.getWeeklyInsight();
      });

      expect(result.current.weeklyInsight).toEqual(mockWeeklyInsight);
      expect(result.current.isLoadingInsight).toBe(false);
      expect(returnedInsight).toEqual(mockWeeklyInsight);
    });

    it('should set isLoadingInsight during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockGetWeeklyInsight.mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useEmotionStore());

      // Start fetch but don't await
      act(() => {
        result.current.getWeeklyInsight().catch(() => {});
      });

      // Check loading state
      await waitFor(() => {
        expect(result.current.isLoadingInsight).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ success: true, data: mockWeeklyInsight });
      });

      await waitFor(() => {
        expect(result.current.isLoadingInsight).toBe(false);
      });
    });

    it('should handle insight fetch error', async () => {
      mockGetWeeklyInsight.mockResolvedValue({
        success: false,
        error: { message: '인사이트를 불러올 수 없습니다.' },
      });

      const { result } = renderHook(() => useEmotionStore());

      await act(async () => {
        try {
          await result.current.getWeeklyInsight();
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isLoadingInsight).toBe(false);
        expect(result.current.error).toBe('인사이트를 불러올 수 없습니다.');
      });
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      act(() => {
        useEmotionStore.setState({ error: 'Some error' });
      });

      const { result } = renderHook(() => useEmotionStore());

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
