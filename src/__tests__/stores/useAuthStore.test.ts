import { act, renderHook, waitFor } from '@testing-library/react';

// Mock Supabase client
const mockSignInWithPassword = jest.fn();
const mockSignUp = jest.fn();
const mockSignOut = jest.fn();
const mockGetSession = jest.fn();
const mockOnAuthStateChange = jest.fn();
const mockFrom = jest.fn();

jest.mock('@/lib/supabase/client', () => ({
  createSupabaseBrowserClient: () => ({
    auth: {
      signInWithPassword: mockSignInWithPassword,
      signUp: mockSignUp,
      signOut: mockSignOut,
      getSession: mockGetSession,
      onAuthStateChange: mockOnAuthStateChange,
    },
    from: mockFrom,
  }),
}));

import { useAuthStore } from '@/store/useAuthStore';

describe('useAuthStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();

    // Reset store state
    act(() => {
      useAuthStore.setState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      });
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const { result } = renderHook(() => useAuthStore());

      expect(result.current.user).toBeNull();
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });
  });

  describe('login', () => {
    it('should login successfully with existing user', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
      };

      mockSignInWithPassword.mockResolvedValue({
        data: { user: mockUser, session: { access_token: 'token' } },
        error: null,
      });

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { participant_id: 'P12345', name: 'Test User' },
          error: null,
        }),
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('test@example.com', 'P12345');
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('test@example.com');
      expect(result.current.user?.participantId).toBe('P12345');
      expect(result.current.isLoading).toBe(false);
      expect(result.current.error).toBeNull();
    });

    it('should signup new user when login fails with invalid credentials', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      mockSignUp.mockResolvedValue({
        data: {
          user: {
            id: 'new-user-id',
            email: 'new@example.com',
            created_at: '2024-01-01T00:00:00Z',
          },
          session: { access_token: 'token' },
        },
        error: null,
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.login('new@example.com', 'P54321');
      });

      expect(mockSignUp).toHaveBeenCalledWith({
        email: 'new@example.com',
        password: 'P54321',
        options: {
          data: {
            participant_id: 'P54321',
          },
        },
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('new@example.com');
    });

    it('should set error state on login failure', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Some other error' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongpassword');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.isLoading).toBe(false);
    });

    it('should translate "Invalid login credentials" to user-friendly message', async () => {
      mockSignInWithPassword.mockResolvedValue({
        data: { user: null },
        error: { message: 'Invalid login credentials' },
      });

      mockSignUp.mockResolvedValue({
        data: { user: null },
        error: { message: 'User already registered' },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        try {
          await result.current.login('test@example.com', 'wrongid');
        } catch {
          // Expected to throw
        }
      });

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });

      expect(result.current.error).toContain('이미 등록된 이메일');
    });
  });

  describe('logout', () => {
    it('should logout successfully', async () => {
      // Set up logged in state first
      act(() => {
        useAuthStore.setState({
          user: {
            id: 'test-id',
            email: 'test@example.com',
            participantId: 'P12345',
            createdAt: '',
          },
          isAuthenticated: true,
        });
      });

      mockSignOut.mockResolvedValue({ error: null });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.logout();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });

    it('should clear state even if signOut API fails', async () => {
      act(() => {
        useAuthStore.setState({
          user: {
            id: 'test-id',
            email: 'test@example.com',
            participantId: 'P12345',
            createdAt: '',
          },
          isAuthenticated: true,
        });
      });

      mockSignOut.mockRejectedValue(new Error('Network error'));

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.logout();
      });

      // Should still clear state
      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });

  describe('setUser', () => {
    it('should set user and authentication state', () => {
      const { result } = renderHook(() => useAuthStore());

      act(() => {
        result.current.setUser({
          id: 'manual-id',
          email: 'manual@example.com',
          participantId: 'P99999',
          createdAt: '2024-01-01',
        });
      });

      expect(result.current.user?.id).toBe('manual-id');
      expect(result.current.isAuthenticated).toBe(true);
    });
  });

  describe('clearError', () => {
    it('should clear error state', () => {
      act(() => {
        useAuthStore.setState({ error: 'Some error message' });
      });

      const { result } = renderHook(() => useAuthStore());

      expect(result.current.error).toBe('Some error message');

      act(() => {
        result.current.clearError();
      });

      expect(result.current.error).toBeNull();
    });
  });

  describe('initializeAuth', () => {
    it('should restore session from storage', async () => {
      const mockSession = {
        user: {
          id: 'session-user-id',
          email: 'session@example.com',
          created_at: '2024-01-01',
          user_metadata: { participant_id: 'P11111' },
        },
      };

      mockGetSession.mockResolvedValue({
        data: { session: mockSession },
      });

      mockFrom.mockReturnValue({
        select: jest.fn().mockReturnThis(),
        eq: jest.fn().mockReturnThis(),
        single: jest.fn().mockResolvedValue({
          data: { participant_id: 'P11111', name: 'Session User' },
          error: null,
        }),
      });

      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.isAuthenticated).toBe(true);
      expect(result.current.user?.email).toBe('session@example.com');
    });

    it('should set unauthenticated state when no session exists', async () => {
      mockGetSession.mockResolvedValue({
        data: { session: null },
      });

      mockOnAuthStateChange.mockReturnValue({
        data: { subscription: { unsubscribe: jest.fn() } },
      });

      const { result } = renderHook(() => useAuthStore());

      await act(async () => {
        await result.current.initializeAuth();
      });

      expect(result.current.isAuthenticated).toBe(false);
      expect(result.current.user).toBeNull();
    });
  });
});
