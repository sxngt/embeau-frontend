import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@/types";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

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
  initializeAuth: () => Promise<void>;
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
          const supabase = createSupabaseBrowserClient();

          // 먼저 로그인 시도
          const { data: signInData, error: signInError } =
            await supabase.auth.signInWithPassword({
              email,
              password: participantId,
            });

          if (signInError) {
            // 로그인 실패 시 회원가입 시도 (신규 사용자)
            if (
              signInError.message.includes("Invalid login credentials") ||
              signInError.message.includes("invalid_credentials")
            ) {
              const { data: signUpData, error: signUpError } =
                await supabase.auth.signUp({
                  email,
                  password: participantId,
                  options: {
                    data: {
                      participant_id: participantId,
                    },
                  },
                });

              if (signUpError) {
                throw new Error(signUpError.message);
              }

              if (!signUpData.user) {
                throw new Error("회원가입에 실패했습니다.");
              }

              // 회원가입 성공
              const user: User = {
                id: signUpData.user.id,
                email: signUpData.user.email || email,
                participantId,
                createdAt: signUpData.user.created_at || new Date().toISOString(),
              };

              set({
                user,
                isAuthenticated: true,
                isLoading: false,
              });

              return;
            }

            throw new Error(signInError.message);
          }

          if (!signInData.user) {
            throw new Error("로그인에 실패했습니다.");
          }

          // 프로필 정보 가져오기
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", signInData.user.id)
            .single();

          const user: User = {
            id: signInData.user.id,
            email: signInData.user.email || email,
            participantId: profile?.participant_id || participantId,
            name: profile?.name,
            createdAt: signInData.user.created_at || new Date().toISOString(),
          };

          set({
            user,
            isAuthenticated: true,
            isLoading: false,
          });
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "로그인에 실패했습니다.";

          // 사용자 친화적인 에러 메시지로 변환
          let userMessage = message;
          if (message.includes("Invalid login credentials")) {
            userMessage = "이메일 또는 연구참여번호가 올바르지 않습니다.";
          } else if (message.includes("Email not confirmed")) {
            userMessage = "이메일 인증이 필요합니다.";
          } else if (message.includes("User already registered")) {
            userMessage =
              "이미 등록된 이메일입니다. 연구참여번호를 확인해주세요.";
          }

          set({
            error: userMessage,
            isLoading: false,
          });
          throw error;
        }
      },

      logout: async () => {
        try {
          const supabase = createSupabaseBrowserClient();
          await supabase.auth.signOut();
        } catch {
          // 로그아웃 API 에러 무시
        } finally {
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

      initializeAuth: async () => {
        const supabase = createSupabaseBrowserClient();

        const {
          data: { session },
        } = await supabase.auth.getSession();

        if (session?.user) {
          // 프로필 정보 가져오기
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", session.user.id)
            .single();

          const user: User = {
            id: session.user.id,
            email: session.user.email || "",
            participantId:
              profile?.participant_id ||
              session.user.user_metadata?.participant_id ||
              "",
            name: profile?.name,
            createdAt: session.user.created_at || new Date().toISOString(),
          };

          set({ user, isAuthenticated: true });
        } else {
          set({ user: null, isAuthenticated: false });
        }

        // 인증 상태 변화 리스너
        supabase.auth.onAuthStateChange(async (event, session) => {
          if (event === "SIGNED_OUT") {
            set({ user: null, isAuthenticated: false });
          } else if (event === "SIGNED_IN" && session?.user) {
            const { data: profile } = await supabase
              .from("profiles")
              .select("*")
              .eq("id", session.user.id)
              .single();

            const user: User = {
              id: session.user.id,
              email: session.user.email || "",
              participantId:
                profile?.participant_id ||
                session.user.user_metadata?.participant_id ||
                "",
              name: profile?.name,
              createdAt: session.user.created_at || new Date().toISOString(),
            };

            set({ user, isAuthenticated: true });
          }
        });
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
