import { createSupabaseServerClient } from "@/lib/supabase/server";
import { COLOR_PALETTES, DAILY_AFFIRMATIONS } from "@/lib/constants/colors";
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

    // 오늘 날짜 (UTC 기준)
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayStr = today.toISOString().split("T")[0];

    // 오늘의 힐링 컬러가 이미 있는지 확인
    const { data: existingColor } = await supabase
      .from("daily_healing_colors")
      .select("*")
      .eq("user_id", user.id)
      .eq("date", todayStr)
      .single();

    if (existingColor) {
      return successResponse({
        color: {
          name: existingColor.color_name,
          hex: existingColor.color_hex,
          description: existingColor.color_description,
        },
        calmEffect: existingColor.calm_effect,
        personalFit: existingColor.personal_fit,
        dailyAffirmation: existingColor.daily_affirmation,
        date: existingColor.date,
      });
    }

    // 사용자의 퍼스널 컬러 가져오기
    const { data: personalColor } = await supabase
      .from("color_results")
      .select("season, tone")
      .eq("user_id", user.id)
      .single();

    // 적절한 색상 팔레트 선택
    let colors: Array<{ name: string; hex: string; description: string }>;
    if (personalColor) {
      const paletteKey = `${personalColor.season}_${personalColor.tone}`;
      colors = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.summer_cool;
    } else {
      colors = COLOR_PALETTES.summer_cool;
    }

    // 오늘 날짜 기준으로 색상 선택 (일년 중 몇 번째 날인지)
    const dayOfYear = Math.floor(
      (today.getTime() - new Date(today.getFullYear(), 0, 0).getTime()) /
        (1000 * 60 * 60 * 24)
    );
    const selectedColor = colors[dayOfYear % colors.length];

    // 새로운 힐링 컬러 생성
    const newDailyColor = {
      user_id: user.id,
      color_name: selectedColor.name,
      color_hex: selectedColor.hex,
      color_description: selectedColor.description,
      calm_effect: `${selectedColor.name}은(는) 마음을 편안하게 해주고 일상의 스트레스를 완화하는 효과가 있습니다.`,
      personal_fit:
        "당신의 퍼스널 컬러와 조화롭게 어울려 자연스러운 아름다움을 더해줍니다.",
      daily_affirmation: DAILY_AFFIRMATIONS[dayOfYear % DAILY_AFFIRMATIONS.length],
      date: todayStr,
    };

    const { data: insertedData, error: insertError } = await supabase
      .from("daily_healing_colors")
      .insert(newDailyColor)
      .select()
      .single();

    if (insertError) {
      console.error("Insert daily healing color error:", {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        data: newDailyColor,
      });
      // 에러가 있어도 응답은 반환 (저장 실패해도 컬러는 보여줌)
    } else {
      console.log("Daily healing color saved:", insertedData?.id);
    }

    return successResponse({
      color: {
        name: newDailyColor.color_name,
        hex: newDailyColor.color_hex,
        description: newDailyColor.color_description,
      },
      calmEffect: newDailyColor.calm_effect,
      personalFit: newDailyColor.personal_fit,
      dailyAffirmation: newDailyColor.daily_affirmation,
      date: newDailyColor.date,
    });
  } catch (error) {
    console.error("Daily healing color error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "일일 힐링 컬러 조회 중 오류가 발생했습니다.",
      500
    );
  }
}
