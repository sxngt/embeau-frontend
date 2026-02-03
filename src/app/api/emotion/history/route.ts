import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "인증이 필요합니다.", 401);
    }

    // URL 파라미터에서 limit 가져오기
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "30", 10);

    const { data: entries, error } = await supabase
      .from("emotion_entries")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Get emotion history error:", error);
      return errorResponse(
        "DATABASE_ERROR",
        "감정 기록 조회 중 오류가 발생했습니다.",
        500
      );
    }

    const formattedEntries = (entries || []).map((entry) => ({
      id: entry.id,
      date: entry.created_at,
      text: entry.input_text,
      emotions: {
        anxiety: entry.anxiety,
        stress: entry.stress,
        satisfaction: entry.satisfaction,
        happiness: entry.happiness,
        depression: entry.depression,
      },
      healingColors: entry.healing_colors,
    }));

    return successResponse(formattedEntries);
  } catch (error) {
    console.error("Emotion history error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "감정 기록 조회 중 오류가 발생했습니다.",
      500
    );
  }
}
