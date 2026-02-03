import { createSupabaseServerClient } from "@/lib/supabase/server";
import { successResponse, errorResponse } from "@/lib/api-utils";
import type { WeeklyReportData } from "@/components/reports/WeeklyReportPDF";

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

    // Calculate week range (Monday to Sunday)
    const now = new Date();
    const dayOfWeek = now.getUTCDay();
    const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;

    const weekStart = new Date(now);
    weekStart.setUTCDate(now.getUTCDate() - diffToMonday);
    weekStart.setUTCHours(0, 0, 0, 0);

    const weekEnd = new Date(weekStart);
    weekEnd.setUTCDate(weekStart.getUTCDate() + 7);

    const weekStartStr = weekStart.toISOString().split("T")[0];
    const weekEndStr = weekEnd.toISOString().split("T")[0];

    // Get user profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("participant_id, name")
      .eq("id", user.id)
      .single();

    // Get personal color result
    const { data: colorResult } = await supabase
      .from("color_results")
      .select("season, tone, description")
      .eq("user_id", user.id)
      .single();

    // Get emotion entries for this week
    const { data: entries } = await supabase
      .from("emotion_entries")
      .select("anxiety, stress, satisfaction, happiness, depression")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lt("created_at", weekEnd.toISOString());

    // Calculate emotion averages
    let emotionSummary = undefined;
    if (entries && entries.length > 0) {
      emotionSummary = {
        anxiety: entries.reduce((sum, e) => sum + (e.anxiety || 0), 0) / entries.length,
        stress: entries.reduce((sum, e) => sum + (e.stress || 0), 0) / entries.length,
        satisfaction: entries.reduce((sum, e) => sum + (e.satisfaction || 0), 0) / entries.length,
        happiness: entries.reduce((sum, e) => sum + (e.happiness || 0), 0) / entries.length,
        depression: entries.reduce((sum, e) => sum + (e.depression || 0), 0) / entries.length,
        totalEntries: entries.length,
      };
    }

    // Get weekly insight
    const { data: insight } = await supabase
      .from("weekly_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStartStr)
      .single();

    let weeklyInsight = undefined;
    if (insight) {
      weeklyInsight = {
        improvement: insight.improvement,
        nextWeekSuggestion: insight.next_week_suggestion,
        activeDays: insight.active_days,
        moodImprovement: insight.mood_improvement || 0,
        stressRelief: insight.stress_relief || 0,
        colorImprovement: insight.color_improvement || 0,
      };
    }

    const reportData: WeeklyReportData = {
      user: {
        email: user.email || "",
        participantId: profile?.participant_id || "",
      },
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      personalColor: colorResult
        ? {
            season: colorResult.season,
            tone: colorResult.tone,
            description: colorResult.description,
          }
        : undefined,
      emotionSummary,
      weeklyInsight,
    };

    return successResponse(reportData);
  } catch (error) {
    console.error("Weekly report error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "주간 리포트 데이터 조회 중 오류가 발생했습니다.",
      500
    );
  }
}
