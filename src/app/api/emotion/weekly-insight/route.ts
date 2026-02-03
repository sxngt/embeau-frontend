import { createSupabaseServerClient } from "@/lib/supabase/server";
import { openai, OPENAI_MODELS } from "@/lib/openai";
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

    // 이번 주 시작/끝 계산 (월요일 시작)
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

    // 캐시된 인사이트 확인
    const { data: cachedInsight } = await supabase
      .from("weekly_insights")
      .select("*")
      .eq("user_id", user.id)
      .eq("week_start", weekStartStr)
      .single();

    if (cachedInsight) {
      return successResponse({
        weekStart: cachedInsight.week_start,
        weekEnd: cachedInsight.week_end,
        emotionDistribution: {
          anxiety: cachedInsight.avg_anxiety,
          stress: cachedInsight.avg_stress,
          satisfaction: cachedInsight.avg_satisfaction,
          happiness: cachedInsight.avg_happiness,
          depression: cachedInsight.avg_depression,
        },
        improvement: cachedInsight.improvement,
        nextWeekSuggestion: cachedInsight.next_week_suggestion,
        stats: {
          activeDays: cachedInsight.active_days,
          colorImprovement: cachedInsight.color_improvement || 0,
          moodImprovement: cachedInsight.mood_improvement || 0,
          stressRelief: cachedInsight.stress_relief || 0,
        },
      });
    }

    // 이번 주 감정 기록 가져오기
    const { data: entries } = await supabase
      .from("emotion_entries")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", weekStart.toISOString())
      .lt("created_at", weekEnd.toISOString());

    if (!entries || entries.length === 0) {
      return successResponse({
        weekStart: weekStartStr,
        weekEnd: weekEndStr,
        emotionDistribution: {
          anxiety: 0,
          stress: 0,
          satisfaction: 0,
          happiness: 0,
          depression: 0,
        },
        improvement: "이번 주에 기록된 감정이 없습니다. 매일 감정을 기록해보세요!",
        nextWeekSuggestion:
          "다음 주에는 하루에 한 번씩 감정을 기록해보는 것은 어떨까요?",
        stats: {
          activeDays: 0,
          colorImprovement: 0,
          moodImprovement: 0,
          stressRelief: 0,
        },
      });
    }

    // 평균 계산
    const avgAnxiety =
      entries.reduce((sum, e) => sum + (e.anxiety || 0), 0) / entries.length;
    const avgStress =
      entries.reduce((sum, e) => sum + (e.stress || 0), 0) / entries.length;
    const avgSatisfaction =
      entries.reduce((sum, e) => sum + (e.satisfaction || 0), 0) / entries.length;
    const avgHappiness =
      entries.reduce((sum, e) => sum + (e.happiness || 0), 0) / entries.length;
    const avgDepression =
      entries.reduce((sum, e) => sum + (e.depression || 0), 0) / entries.length;

    // 활동일 수 계산
    const activeDays = new Set(
      entries.map((e) => new Date(e.created_at).toISOString().split("T")[0])
    ).size;

    // AI 인사이트 생성
    let improvement: string;
    let suggestion: string;

    if (process.env.OPENAI_API_KEY) {
      const aiInsight = await generateAIInsight(
        avgAnxiety,
        avgStress,
        avgSatisfaction,
        avgHappiness,
        avgDepression
      );
      improvement = aiInsight.improvement;
      suggestion = aiInsight.suggestion;
    } else {
      const simpleInsight = generateSimpleInsight(
        avgAnxiety,
        avgStress,
        avgSatisfaction,
        avgHappiness,
        avgDepression
      );
      improvement = simpleInsight.improvement;
      suggestion = simpleInsight.suggestion;
    }

    // 이전 주 데이터와 비교
    const prevWeekStart = new Date(weekStart);
    prevWeekStart.setUTCDate(prevWeekStart.getUTCDate() - 7);

    const { data: prevEntries } = await supabase
      .from("emotion_entries")
      .select("happiness, stress")
      .eq("user_id", user.id)
      .gte("created_at", prevWeekStart.toISOString())
      .lt("created_at", weekStart.toISOString());

    let moodImprovement = 0;
    let stressRelief = 0;

    if (prevEntries && prevEntries.length > 0) {
      const prevHappiness =
        prevEntries.reduce((sum, e) => sum + (e.happiness || 0), 0) /
        prevEntries.length;
      const prevStress =
        prevEntries.reduce((sum, e) => sum + (e.stress || 0), 0) /
        prevEntries.length;

      moodImprovement =
        prevHappiness > 0
          ? ((avgHappiness - prevHappiness) / prevHappiness) * 100
          : 0;
      stressRelief =
        prevStress > 0 ? ((prevStress - avgStress) / prevStress) * 100 : 0;
    }

    // 인사이트 저장
    const insightData = {
      user_id: user.id,
      week_start: weekStartStr,
      week_end: weekEndStr,
      avg_anxiety: avgAnxiety,
      avg_stress: avgStress,
      avg_satisfaction: avgSatisfaction,
      avg_happiness: avgHappiness,
      avg_depression: avgDepression,
      improvement,
      next_week_suggestion: suggestion,
      active_days: activeDays,
      color_improvement: Math.min(activeDays * 15, 100),
      mood_improvement: Math.max(Math.min(moodImprovement, 100), -100),
      stress_relief: Math.max(Math.min(stressRelief, 100), -100),
    };

    const { data: insertedInsight, error: insertError } = await supabase
      .from("weekly_insights")
      .insert(insightData)
      .select()
      .single();

    if (insertError) {
      console.error("Insert weekly insight error:", {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        data: insightData,
      });
      // 에러가 있어도 응답은 반환
    } else {
      console.log("Weekly insight saved:", insertedInsight?.id);
    }

    return successResponse({
      weekStart: weekStartStr,
      weekEnd: weekEndStr,
      emotionDistribution: {
        anxiety: avgAnxiety,
        stress: avgStress,
        satisfaction: avgSatisfaction,
        happiness: avgHappiness,
        depression: avgDepression,
      },
      improvement,
      nextWeekSuggestion: suggestion,
      stats: {
        activeDays,
        colorImprovement: insightData.color_improvement,
        moodImprovement: insightData.mood_improvement,
        stressRelief: insightData.stress_relief,
      },
    });
  } catch (error) {
    console.error("Weekly insight error:", error);
    return errorResponse(
      "INTERNAL_ERROR",
      "주간 인사이트 조회 중 오류가 발생했습니다.",
      500
    );
  }
}

async function generateAIInsight(
  anxiety: number,
  stress: number,
  satisfaction: number,
  happiness: number,
  depression: number
): Promise<{ improvement: string; suggestion: string }> {
  const prompt = `다음은 사용자의 이번 주 평균 감정 점수입니다 (0-100):
- 불안: ${anxiety.toFixed(1)}
- 스트레스: ${stress.toFixed(1)}
- 만족감: ${satisfaction.toFixed(1)}
- 행복: ${happiness.toFixed(1)}
- 우울: ${depression.toFixed(1)}

1. 이번 주 감정 상태에 대한 간단한 분석 (2-3문장)
2. 다음 주를 위한 따뜻한 조언 (1-2문장)

JSON 형식으로 응답해주세요:
{"improvement": "...", "suggestion": "..."}`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.text,
      messages: [
        {
          role: "system",
          content: "당신은 따뜻하고 공감 능력이 뛰어난 상담 전문가입니다.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      improvement: result.improvement || "",
      suggestion: result.suggestion || "",
    };
  } catch {
    return generateSimpleInsight(anxiety, stress, satisfaction, happiness, depression);
  }
}

function generateSimpleInsight(
  anxiety: number,
  stress: number,
  satisfaction: number,
  happiness: number,
  depression: number
): { improvement: string; suggestion: string } {
  const positiveScore = (satisfaction + happiness) / 2;
  const negativeScore = (anxiety + stress + depression) / 3;

  if (positiveScore > negativeScore) {
    return {
      improvement:
        "이번 주는 전반적으로 긍정적인 감정이 우세했습니다. 좋은 한 주였네요!",
      suggestion:
        "다음 주에도 현재의 긍정적인 상태를 유지하면서 작은 기쁨들을 찾아보세요.",
    };
  } else if (stress > 60) {
    return {
      improvement:
        "이번 주는 스트레스가 높았던 것 같습니다. 충분한 휴식이 필요해 보여요.",
      suggestion:
        "다음 주에는 자신을 위한 시간을 조금 더 가져보는 건 어떨까요?",
    };
  } else if (anxiety > 60) {
    return {
      improvement:
        "불안한 마음이 많았던 한 주였네요. 당신의 감정은 충분히 이해됩니다.",
      suggestion: "깊은 호흡과 함께 천천히 마음을 가라앉혀 보세요.",
    };
  } else {
    return {
      improvement: "다양한 감정을 경험한 한 주였습니다.",
      suggestion: "다음 주에는 힐링 컬러와 함께 마음의 평화를 찾아보세요.",
    };
  }
}
