import { createSupabaseServerClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

export async function GET() {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "인증이 필요합니다.", 401);
    }

    const { data: colorResult, error } = await supabase
      .from("color_results")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error || !colorResult) {
      return errorResponse(
        "NOT_FOUND",
        "색상 분석 결과가 없습니다. 먼저 분석을 진행해주세요.",
        404
      );
    }

    return successResponse({
      season: colorResult.season,
      tone: colorResult.tone,
      description: colorResult.description,
      recommendedColors: colorResult.recommended_colors,
      analyzedAt: colorResult.analyzed_at,
      confidence: colorResult.confidence,
      subtype: colorResult.subtype,
      facialExpression: colorResult.facial_expression,
    });
  } catch (error) {
    console.error("Get color result error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "색상 결과 조회 중 오류가 발생했습니다.",
      500
    );
  }
}
