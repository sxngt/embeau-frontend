import { createSupabaseServerClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import {
  FASHION_RECOMMENDATIONS,
  FOOD_RECOMMENDATIONS,
  ACTIVITY_RECOMMENDATIONS,
} from "@/lib/constants/recommendations";

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

    // Get user's personal color
    const { data: colorResult } = await supabase
      .from("color_results")
      .select("season, tone, recommended_colors")
      .eq("user_id", user.id)
      .single();

    const season = colorResult?.season || "summer";

    // Get primary color
    let primaryColor = { name: "라벤더", hex: "#E6E6FA", description: "차분한 라벤더" };
    if (colorResult?.recommended_colors) {
      const colors = colorResult.recommended_colors as Array<{
        name: string;
        hex: string;
        description?: string;
      }>;
      if (colors.length > 0) {
        primaryColor = {
          name: colors[0].name,
          hex: colors[0].hex,
          description: colors[0].description || "",
        };
      }
    }

    // Get recommendations for the season
    const fashionItems =
      FASHION_RECOMMENDATIONS[season] || FASHION_RECOMMENDATIONS.summer;
    const foodItems =
      FOOD_RECOMMENDATIONS[season] || FOOD_RECOMMENDATIONS.summer;
    const activityItems =
      ACTIVITY_RECOMMENDATIONS[season] || ACTIVITY_RECOMMENDATIONS.summer;

    return successResponse({
      color: primaryColor,
      items: fashionItems,
      foods: foodItems,
      activities: activityItems,
    });
  } catch (error) {
    console.error("Recommendations error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "추천 조회 중 오류가 발생했습니다.",
      500
    );
  }
}
