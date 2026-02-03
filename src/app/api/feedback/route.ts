import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-utils";

interface FeedbackRequest {
  rating: 1 | 2 | 3 | 4 | 5;
  targetType: "color_result" | "emotion_map" | "healing_color" | "recommendation";
  targetId: string;
  comment?: string;
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return errorResponse("UNAUTHORIZED", "인증이 필요합니다.", 401);
    }

    const body: FeedbackRequest = await request.json();

    // Validate rating
    if (!body.rating || body.rating < 1 || body.rating > 5) {
      return errorResponse("BAD_REQUEST", "평점은 1-5 사이여야 합니다.", 400);
    }

    // Validate target type
    const validTargetTypes = ["color_result", "emotion_map", "healing_color", "recommendation"];
    if (!validTargetTypes.includes(body.targetType)) {
      return errorResponse("BAD_REQUEST", "유효하지 않은 피드백 대상입니다.", 400);
    }

    if (!body.targetId) {
      return errorResponse("BAD_REQUEST", "대상 ID가 필요합니다.", 400);
    }

    // Insert feedback
    const feedbackData = {
      user_id: user.id,
      rating: body.rating,
      target_type: body.targetType,
      target_id: body.targetId,
      comment: body.comment || null,
    };

    const { data: insertedFeedback, error: insertError } = await supabase
      .from("feedbacks")
      .insert(feedbackData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert feedback error:", insertError);
      return errorResponse(
        "DATABASE_ERROR",
        "피드백 저장 중 오류가 발생했습니다.",
        500
      );
    }

    return successResponse({
      id: insertedFeedback.id,
      rating: insertedFeedback.rating,
      targetType: insertedFeedback.target_type,
      targetId: insertedFeedback.target_id,
      createdAt: insertedFeedback.created_at,
    });
  } catch (error) {
    console.error("Feedback error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "피드백 제출 중 오류가 발생했습니다.",
      500
    );
  }
}
