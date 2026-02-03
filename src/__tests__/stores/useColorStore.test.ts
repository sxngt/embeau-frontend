import { act, renderHook, waitFor } from '@testing-library/react';

// Mock the API service
const mockAnalyzePersonalColor = jest.fn();
const mockGetDailyHealingColor = jest.fn();

jest.mock('@/services/api', () => ({
  colorService: {
    analyzePersonalColor: (...args: unknown[]) => mockAnalyzePersonalColor(...args),
    getDailyHealingColor: () => mockGetDailyHealingColor(),
  },
}));

import { useColorStore } from '@/store/useColorStore';

describe('useColorStore', () => {
  const mockColorResult = {
    season: 'winter',
    tone: 'cool',
    description: '겨울 쿨톤입니다.',
    recommendedColors: [
      { name: '로얄 블루', hex: '#4169E1', description: '선명한 로얄 블루' },
    ],
    analyzedAt: '2024-01-01T00:00:00Z',
    confidence: 0.85,
    subtype: 'Winter_cool',
  };

  const mockHealingColor = {
    color: { name: '라벤더', hex: '#E6E6FA', description: '차분한 라벤더' },
    calmEffect: '마음을 편안하게 해줍니다.',
    personalFit: '쿨톤과 잘 어울립니다.',
    dailyAffirmation: '오늘 하루도 빛나세요.',
    date: '2024-01-01',
  };

  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store state
    act(() => {
      useColorStore.setState({
        personalColorResult: null,
        dailyHealingColor: null,
        colorHistory: [],
        isAnalyzing: false,
        isLoadingHealingColor: false,
        error: null,
      });
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useColorStore());

      expect(result.current.personalColorResult).toBeNull();
      expect(result.current.dailyHealingColor).toBeNull();
      expect(result.current.colorHistory).toEqual([]);
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.isLoadingHealingColor).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('setPersonalColorResult', () => {
    it('should set personal color result', () => {
      const { result } = renderHook(() => useColorStore());

      act(() => {
        result.current.setPersonalColorResult(mockColorResult);
      });

      expect(result.current.personalColorResult).toEqual(mockColorResult);
    });
  });

  describe('setDailyHealingColor', () => {
    it('should set daily healing color and add to history', () => {
      const { result } = renderHook(() => useColorStore());

      act(() => {
        result.current.setDailyHealingColor(mockHealingColor);
      });

      expect(result.current.dailyHealingColor).toEqual(mockHealingColor);
      expect(result.current.colorHistory).toHaveLength(1);
      expect(result.current.colorHistory[0]).toEqual(mockHealingColor);
    });

    it('should limit history to 30 items', () => {
      const { result } = renderHook(() => useColorStore());

      // Add 35 items
      for (let i = 0; i < 35; i++) {
        act(() => {
          result.current.setDailyHealingColor({
            ...mockHealingColor,
            date: `2024-01-${String(i + 1).padStart(2, '0')}`,
          });
        });
      }

      expect(result.current.colorHistory).toHaveLength(30);
    });

    it('should add new colors at the beginning of history', () => {
      const { result } = renderHook(() => useColorStore());

      act(() => {
        result.current.setDailyHealingColor({ ...mockHealingColor, date: '2024-01-01' });
      });

      act(() => {
        result.current.setDailyHealingColor({ ...mockHealingColor, date: '2024-01-02' });
      });

      expect(result.current.colorHistory[0].date).toBe('2024-01-02');
      expect(result.current.colorHistory[1].date).toBe('2024-01-01');
    });
  });

  describe('analyzeColor', () => {
    it('should analyze color successfully', async () => {
      mockAnalyzePersonalColor.mockResolvedValue({
        success: true,
        data: mockColorResult,
      });

      const { result } = renderHook(() => useColorStore());

      await act(async () => {
        await result.current.analyzeColor('base64imagedata');
      });

      expect(mockAnalyzePersonalColor).toHaveBeenCalledWith('base64imagedata');
      expect(result.current.personalColorResult).toEqual(mockColorResult);
      expect(result.current.isAnalyzing).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should handle analysis error and set error state', async () => {
      mockAnalyzePersonalColor.mockResolvedValue({
        success: false,
        error: { message: '분석에 실패했습니다.' },
      });

      const { result } = renderHook(() => useColorStore());

      await act(async () => {
        try {
          await result.current.analyzeColor('base64imagedata');
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
      mockAnalyzePersonalColor.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useColorStore());

      await act(async () => {
        try {
          await result.current.analyzeColor('base64imagedata');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBe('Network error');
      });
    });
  });

  describe('fetchDailyHealingColor', () => {
    it('should fetch daily healing color successfully', async () => {
      mockGetDailyHealingColor.mockResolvedValue({
        success: true,
        data: mockHealingColor,
      });

      const { result } = renderHook(() => useColorStore());

      let returnedColor;
      await act(async () => {
        returnedColor = await result.current.fetchDailyHealingColor();
      });

      expect(result.current.dailyHealingColor).toEqual(mockHealingColor);
      expect(result.current.isLoadingHealingColor).toBe(false);
      expect(result.current.colorHistory).toContainEqual(mockHealingColor);
      expect(returnedColor).toEqual(mockHealingColor);
    });

    it('should set isLoadingHealingColor during fetch', async () => {
      let resolvePromise: (value: unknown) => void;
      const pendingPromise = new Promise((resolve) => {
        resolvePromise = resolve;
      });

      mockGetDailyHealingColor.mockReturnValue(pendingPromise);

      const { result } = renderHook(() => useColorStore());

      // Start fetch but don't await
      act(() => {
        result.current.fetchDailyHealingColor().catch(() => {});
      });

      // Check loading state
      await waitFor(() => {
        expect(result.current.isLoadingHealingColor).toBe(true);
      });

      // Resolve the promise
      await act(async () => {
        resolvePromise!({ success: true, data: mockHealingColor });
      });

      await waitFor(() => {
        expect(result.current.isLoadingHealingColor).toBe(false);
      });
    });

    it('should handle fetch error and set error state', async () => {
      mockGetDailyHealingColor.mockResolvedValue({
        success: false,
        error: { message: '힐링 컬러를 불러오는데 실패했습니다.' },
      });

      const { result } = renderHook(() => useColorStore());

      await act(async () => {
        try {
          await result.current.fetchDailyHealingColor();
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.isLoadingHealingColor).toBe(false);
        expect(result.current.error).toBeTruthy();
      });
    });
  });

  describe('clearColorResult', () => {
    it('should clear personal color result', () => {
      const { result } = renderHook(() => useColorStore());

      act(() => {
        result.current.setPersonalColorResult(mockColorResult);
      });

      expect(result.current.personalColorResult).not.toBeNull();

      act(() => {
        result.current.clearColorResult();
      });

      expect(result.current.personalColorResult).toBeNull();
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      act(() => {
        useColorStore.setState({ error: 'Some error' });
      });

      const { result } = renderHook(() => useColorStore());

      expect(result.current.error).toBe('Some error');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });
});
