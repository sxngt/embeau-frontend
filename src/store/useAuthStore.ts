import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { authService, setAccessToken, clearAccessToken, getAccessToken } from "@/services/api";

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;

  // Actions
  login: (email: string, participantId: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
  clearError: () => void;
  initializeAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      login: async (email: string, participantId: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await authService.login(email, participantId);

          if (!response.success || !response.data) {
            throw new Error(response.error?.message || "로그인에 실패했습니다.");
          }

          const { user, token } = response.data;

          // Store JWT token
          setAccessToken(token.accessToken);

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          set({
            error: error instanceof Error ? error.message : "로그인에 실패했습니다.",
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          await authService.logout();
        } catch {
          // Ignore logout API errors
        } finally {
          clearAccessToken();
          set({
            user: null,
            isAuthenticated: false,
            error: null,
          });
        }
      },

      setUser: (user: User) => {
        set({ user, isAuthenticated: true });
      },

      clearError: () => {
        set({ error: null });
      },

      initializeAuth: () => {
        // Check if token exists on app start
        const token = getAccessToken();
        if (token && get().user) {
          set({ isAuthenticated: true });
        } else if (!token) {
          set({ user: null, isAuthenticated: false });
        }
      },
    }),
    {
      name: "embeau-auth",
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
