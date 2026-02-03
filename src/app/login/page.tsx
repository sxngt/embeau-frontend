"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Header from "@/components/layout/Header";
import { useAuthStore } from "@/store/useAuthStore";

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState("");
  const [participantId, setParticipantId] = useState("");
  const [formErrors, setFormErrors] = useState<{
    email?: string;
    participantId?: string;
  }>({});

  const validateForm = () => {
    const errors: { email?: string; participantId?: string } = {};

    if (!email.trim()) {
      errors.email = "이메일을 입력해주세요.";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      errors.email = "올바른 이메일 형식을 입력해주세요.";
    }

    if (!participantId.trim()) {
      errors.participantId = "연구참여번호를 입력해주세요.";
    } else if (participantId.trim().length < 6) {
      errors.participantId = "연구참여번호는 6자 이상이어야 합니다.";
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();

    if (!validateForm()) return;

    try {
      await login(email, participantId);
      router.push("/main");
    } catch {
      // Error is handled by store
    }
  };

  return (
    <div className="min-h-screen">
      <Header showBack onBack={() => router.push("/")} />

      <div className="flex flex-col items-center justify-center px-8 pt-8 md:pt-16 pb-12">
        <Logo size="md" className="mb-8 md:mb-12" />

        <h2 className="text-2xl md:text-3xl font-bold text-neutral-800 mb-2">오셨군요.</h2>
        <p className="text-neutral-600 text-center mb-4 md:text-lg">
          오늘도 당신의 마음빛을 만나러 가볼까요?
        </p>
        <p className="text-sm text-neutral-500 text-center mb-10">
          처음 방문하시면 자동으로 계정이 생성됩니다.
        </p>

        <form onSubmit={handleSubmit} className="w-full max-w-md space-y-4">
          <Input
            type="email"
            placeholder="이메일"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (formErrors.email) {
                setFormErrors((prev) => ({ ...prev, email: undefined }));
              }
            }}
            error={formErrors.email}
            autoComplete="email"
          />

          <Input
            type="text"
            placeholder="연구참여번호"
            value={participantId}
            onChange={(e) => {
              setParticipantId(e.target.value);
              if (formErrors.participantId) {
                setFormErrors((prev) => ({ ...prev, participantId: undefined }));
              }
            }}
            error={formErrors.participantId}
            autoComplete="off"
          />

          {error && (
            <p className="text-sm text-error text-center">{error}</p>
          )}

          <div className="pt-6">
            <Button
              type="submit"
              variant="primary"
              size="lg"
              fullWidth
              isLoading={isLoading}
            >
              시작하기
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
