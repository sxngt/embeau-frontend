import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import type { SupabaseClient } from "@supabase/supabase-js";

// API 응답 타입
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

// 성공 응답
export function successResponse<T>(data: T, status = 200) {
  return NextResponse.json<ApiResponse<T>>(
    { success: true, data },
    { status }
  );
}

// 에러 응답
export function errorResponse(
  code: string,
  message: string,
  status = 400
) {
  return NextResponse.json<ApiResponse<never>>(
    { success: false, error: { code, message } },
    { status }
  );
}

// 인증이 필요한 API 핸들러 래퍼
export async function withAuth<T>(
  handler: (userId: string, supabase: SupabaseClient) => Promise<T>
): Promise<NextResponse<ApiResponse<T>> | NextResponse<ApiResponse<never>>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return errorResponse("UNAUTHORIZED", "인증이 필요합니다.", 401);
    }

    const result = await handler(user.id, supabase);
    return successResponse(result);
  } catch (error) {
    console.error("API Error:", error);
    const message =
      error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}

// 인증이 필요한 API 핸들러 래퍼 (응답 커스터마이징 가능)
export async function withAuthRaw<T>(
  handler: (userId: string, supabase: SupabaseClient) => Promise<NextResponse<T>>
): Promise<NextResponse<T> | NextResponse<ApiResponse<never>>> {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      return errorResponse("UNAUTHORIZED", "인증이 필요합니다.", 401);
    }

    return await handler(user.id, supabase);
  } catch (error) {
    console.error("API Error:", error);
    const message =
      error instanceof Error ? error.message : "서버 오류가 발생했습니다.";
    return errorResponse("INTERNAL_ERROR", message, 500);
  }
}
