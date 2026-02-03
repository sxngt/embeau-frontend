import { createSupabaseServerClient } from "@/lib/supabase/server";
import { openai, OPENAI_MODELS } from "@/lib/openai";
import { successResponse, errorResponse } from "@/lib/api-utils";
import {
  FASHION_RECOMMENDATIONS,
  FOOD_RECOMMENDATIONS,
  ACTIVITY_RECOMMENDATIONS,
  RecommendationItem,
} from "@/lib/constants/recommendations";

interface AIRecommendations {
  fashion: RecommendationItem[];
  food: RecommendationItem[];
  activities: RecommendationItem[];
}

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
      .select("season, tone, subtype, recommended_colors")
      .eq("user_id", user.id)
      .single();

    const season = colorResult?.season || "summer";
    const tone = colorResult?.tone || "cool";
    const subtype = colorResult?.subtype || "Summer_cool";

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

    // 최근 감정 기록 가져오기 (더 개인화된 추천을 위해)
    const { data: recentEmotions } = await supabase
      .from("emotion_entries")
      .select("anxiety, stress, satisfaction, happiness, depression")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(5);

    // OpenAI로 동적 추천 생성
    const recommendations = await generatePersonalizedRecommendations(
      season,
      tone,
      subtype,
      primaryColor,
      recentEmotions
    );

    return successResponse({
      color: primaryColor,
      items: recommendations.fashion,
      foods: recommendations.food,
      activities: recommendations.activities,
      _debug: {
        source: process.env.OPENAI_API_KEY ? "openai" : "fallback",
        season,
        tone,
        subtype,
      },
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

async function generatePersonalizedRecommendations(
  season: string,
  tone: string,
  subtype: string,
  primaryColor: { name: string; hex: string; description: string },
  recentEmotions: Array<{
    anxiety: number;
    stress: number;
    satisfaction: number;
    happiness: number;
    depression: number;
  }> | null
): Promise<AIRecommendations> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackRecommendations(season);
  }

  const seasonNames: Record<string, string> = {
    spring: "봄",
    summer: "여름",
    autumn: "가을",
    winter: "겨울",
  };

  const toneNames: Record<string, string> = {
    warm: "웜톤",
    cool: "쿨톤",
  };

  // 감정 상태 요약
  let emotionSummary = "감정 데이터 없음";
  if (recentEmotions && recentEmotions.length > 0) {
    const avgAnxiety = recentEmotions.reduce((sum, e) => sum + (e.anxiety || 0), 0) / recentEmotions.length;
    const avgStress = recentEmotions.reduce((sum, e) => sum + (e.stress || 0), 0) / recentEmotions.length;
    const avgHappiness = recentEmotions.reduce((sum, e) => sum + (e.happiness || 0), 0) / recentEmotions.length;

    const emotions: string[] = [];
    if (avgStress > 50) emotions.push("스트레스가 높음");
    if (avgAnxiety > 50) emotions.push("불안감이 있음");
    if (avgHappiness > 60) emotions.push("행복감이 높음");
    if (avgHappiness < 40) emotions.push("기분 전환이 필요함");

    emotionSummary = emotions.length > 0 ? emotions.join(", ") : "안정적인 상태";
  }

  const prompt = `당신은 퍼스널 컬러 전문가이자 라이프스타일 코디네이터입니다.
사용자의 퍼스널 컬러와 현재 감정 상태를 기반으로 개인화된 추천을 제공해주세요.

사용자 정보:
- 퍼스널 컬러: ${seasonNames[season] || season} ${toneNames[tone] || tone} (${subtype})
- 대표 색상: ${primaryColor.name} (${primaryColor.hex})
- 최근 감정 상태: ${emotionSummary}

각 카테고리별로 3개씩 추천해주세요:

1. 패션 아이템 (의류, 액세서리)
2. 음식/음료 (퍼스널 컬러와 어울리는)
3. 활동/취미 (감정 상태 개선에 도움되는)

각 추천 아이템은 사용자의 퍼스널 컬러 계절과 톤에 어울리는 색상을 포함해야 합니다.

JSON 형식으로만 응답해주세요:
{
  "fashion": [
    {"id": "f1", "type": "fashion", "title": "아이템명", "description": "설명 (2문장)", "color": "#HEX코드"},
    {"id": "f2", "type": "fashion", "title": "아이템명", "description": "설명", "color": "#HEX코드"},
    {"id": "f3", "type": "fashion", "title": "아이템명", "description": "설명", "color": "#HEX코드"}
  ],
  "food": [
    {"id": "fd1", "type": "food", "title": "음식명", "description": "설명", "color": "#HEX코드"},
    {"id": "fd2", "type": "food", "title": "음식명", "description": "설명", "color": "#HEX코드"},
    {"id": "fd3", "type": "food", "title": "음식명", "description": "설명", "color": "#HEX코드"}
  ],
  "activities": [
    {"id": "a1", "type": "activity", "title": "활동명", "description": "설명", "color": "#HEX코드"},
    {"id": "a2", "type": "activity", "title": "활동명", "description": "설명", "color": "#HEX코드"},
    {"id": "a3", "type": "activity", "title": "활동명", "description": "설명", "color": "#HEX코드"}
  ]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.text,
      messages: [
        {
          role: "system",
          content:
            "당신은 퍼스널 컬러와 컬러 테라피에 정통한 라이프스타일 전문가입니다. 색상의 심리적 효과와 퍼스널 컬러 조화를 고려하여 개인화된 추천을 제공합니다.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 1000,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    console.log("Generated recommendations:", JSON.stringify(result, null, 2));

    // 결과 검증 및 기본값 적용
    const validatedFashion = validateItems(result.fashion, "fashion", season);
    const validatedFood = validateItems(result.food, "food", season);
    const validatedActivities = validateItems(result.activities, "activity", season);

    return {
      fashion: validatedFashion,
      food: validatedFood,
      activities: validatedActivities,
    };
  } catch (error) {
    console.warn("OpenAI recommendations generation failed:", error);
    return fallbackRecommendations(season);
  }
}

function validateItems(
  items: RecommendationItem[] | undefined,
  type: "fashion" | "food" | "activity",
  season: string
): RecommendationItem[] {
  if (!items || !Array.isArray(items) || items.length === 0) {
    // fallback 데이터 사용
    if (type === "fashion") {
      return FASHION_RECOMMENDATIONS[season] || FASHION_RECOMMENDATIONS.summer;
    } else if (type === "food") {
      return FOOD_RECOMMENDATIONS[season] || FOOD_RECOMMENDATIONS.summer;
    } else {
      return ACTIVITY_RECOMMENDATIONS[season] || ACTIVITY_RECOMMENDATIONS.summer;
    }
  }

  // 각 아이템 검증
  return items.map((item, index) => ({
    id: item.id || `${type[0]}${index + 1}`,
    type: type,
    title: item.title || "추천 아이템",
    description: item.description || "",
    color: item.color || "#E6E6FA",
  }));
}

function fallbackRecommendations(season: string): AIRecommendations {
  return {
    fashion: FASHION_RECOMMENDATIONS[season] || FASHION_RECOMMENDATIONS.summer,
    food: FOOD_RECOMMENDATIONS[season] || FOOD_RECOMMENDATIONS.summer,
    activities: ACTIVITY_RECOMMENDATIONS[season] || ACTIVITY_RECOMMENDATIONS.summer,
  };
}
