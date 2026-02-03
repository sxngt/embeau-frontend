import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import {
  FASHION_RECOMMENDATIONS,
  FOOD_RECOMMENDATIONS,
  HEALING_COLOR_ITEMS,
  getColorNameFromHex,
} from "@/lib/constants/recommendations";

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

    // Get color from query params
    const { searchParams } = new URL(request.url);
    let colorHex = searchParams.get("color");

    if (!colorHex) {
      return errorResponse("BAD_REQUEST", "색상 코드가 필요합니다.", 400);
    }

    // Normalize color hex
    colorHex = colorHex.toUpperCase();
    if (!colorHex.startsWith("#")) {
      colorHex = `#${colorHex}`;
    }

    // Find matching recommendations for the color
    const colorItems = HEALING_COLOR_ITEMS[colorHex];

    let fashionItems;
    let foodItems;

    if (colorItems) {
      fashionItems = colorItems.fashion;
      foodItems = colorItems.food;
    } else {
      // Fall back to user's season recommendations
      const { data: colorResult } = await supabase
        .from("color_results")
        .select("season")
        .eq("user_id", user.id)
        .single();

      const season = colorResult?.season || "summer";
      fashionItems = (
        FASHION_RECOMMENDATIONS[season] || FASHION_RECOMMENDATIONS.summer
      ).slice(0, 2);
      foodItems = (
        FOOD_RECOMMENDATIONS[season] || FOOD_RECOMMENDATIONS.summer
      ).slice(0, 2);
    }

    const colorName = getColorNameFromHex(colorHex);

    return successResponse({
      color: {
        name: colorName,
        hex: colorHex,
      },
      items: fashionItems,
      foods: foodItems,
      activities: [],
    });
  } catch (error) {
    console.error("Recommendations by color error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "색상별 추천 조회 중 오류가 발생했습니다.",
      500
    );
  }
}
