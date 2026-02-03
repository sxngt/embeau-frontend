import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { openai, OPENAI_MODELS } from "@/lib/openai";
import { COLOR_PALETTES, SEASON_DESCRIPTIONS } from "@/lib/constants/colors";
import { successResponse, errorResponse } from "@/lib/api-utils";

interface AnalyzeRequest {
  image: string; // base64 encoded image
}

interface VisionAnalysisResult {
  tone: {
    season: string;
    subtype: string;
    confidence: number;
    undertone: string;
    brightness: string;
    analysis_reason: string;
  };
  emotion: {
    facial_expression: string;
    facial_expression_confidence: number;
  };
  source?: string;
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

    const body: AnalyzeRequest = await request.json();

    if (!body.image) {
      return errorResponse("BAD_REQUEST", "이미지가 필요합니다.", 400);
    }

    // Base64 이미지 URL 형식 확인
    let imageUrl: string;
    if (body.image.includes(",")) {
      const base64Image = body.image.split(",")[1];
      imageUrl = `data:image/jpeg;base64,${base64Image}`;
    } else {
      imageUrl = `data:image/jpeg;base64,${body.image}`;
    }

    // GPT-4o Vision API로 분석
    const analysisData = await analyzeWithVisionAPI(imageUrl);

    // 분석 결과 파싱
    const toneData = analysisData.tone || {};
    const emotionData = analysisData.emotion || {};

    // 시즌 검증
    const validSeasons = new Set(["spring", "summer", "autumn", "winter"]);
    const rawSeason = (toneData.season || "summer").toLowerCase();
    const season = validSeasons.has(rawSeason) ? rawSeason : "summer";

    // 서브타입 검증
    const validSubtypes = new Set(["warm", "cool", "clear", "soft", "deep", "light"]);
    const rawSubtype = (toneData.subtype || "cool").toLowerCase();
    const subtype = validSubtypes.has(rawSubtype) ? rawSubtype : "cool";

    const confidence = toneData.confidence || 0.85;

    // 서브타입으로부터 톤 결정
    const tone = ["cool", "clear", "soft"].includes(subtype) ? "cool" : "warm";

    // 추천 색상 가져오기
    let paletteKey = `${season}_${subtype}`;
    if (!COLOR_PALETTES[paletteKey]) {
      paletteKey = `${season}_${tone}`;
    }
    const colors = COLOR_PALETTES[paletteKey] || COLOR_PALETTES.summer_cool;

    // 데이터베이스에 저장 (upsert)
    const { data: existingResult } = await supabase
      .from("color_results")
      .select("id")
      .eq("user_id", user.id)
      .single();

    const colorResultData = {
      user_id: user.id,
      season,
      tone,
      subtype: `${season}_${subtype}`.replace(/^\w/, (c) => c.toUpperCase()),
      confidence,
      description: SEASON_DESCRIPTIONS[season] || "",
      recommended_colors: colors,
      facial_expression: emotionData.facial_expression || null,
      analyzed_at: new Date().toISOString(),
    };

    if (existingResult) {
      await supabase
        .from("color_results")
        .update(colorResultData)
        .eq("user_id", user.id);
    } else {
      await supabase.from("color_results").insert(colorResultData);
    }

    return successResponse({
      season,
      tone,
      description: SEASON_DESCRIPTIONS[season] || "",
      recommendedColors: colors,
      analyzedAt: colorResultData.analyzed_at,
      confidence,
      subtype: colorResultData.subtype,
      facialExpression: emotionData.facial_expression || null,
    });
  } catch (error) {
    console.error("Color analysis error:", error);
    return errorResponse(
      "ANALYSIS_ERROR",
      "색상 분석 중 오류가 발생했습니다.",
      500
    );
  }
}

async function analyzeWithVisionAPI(imageUrl: string): Promise<VisionAnalysisResult> {
  if (!process.env.OPENAI_API_KEY) {
    console.warn("OpenAI API key not configured, using fallback");
    return fallbackAnalysis();
  }

  const prompt = `이 얼굴 이미지를 분석하여 퍼스널 컬러와 표정을 판단해주세요.

분석 항목:
1. 피부 언더톤 (웜톤/쿨톤)
2. 피부 밝기 (밝음/중간/어두움)
3. 계절 타입 - 반드시 다음 중 하나: spring, summer, autumn, winter
4. 세부 타입 - 반드시 다음 중 하나: warm, cool, clear, soft, deep, light
5. 표정 (happy/neutral/calm/sad/surprised/angry)

중요: 이미지가 불분명하거나 얼굴이 잘 보이지 않아도, 가장 가능성이 높은 값을 선택해주세요.
절대로 "unknown", "unclear", "cannot determine" 같은 값을 사용하지 마세요.

다음 JSON 형식으로만 응답해주세요:
{
    "tone": {
        "season": "spring 또는 summer 또는 autumn 또는 winter 중 하나만",
        "subtype": "warm 또는 cool 또는 clear 또는 soft 또는 deep 또는 light 중 하나만",
        "confidence": 0.0-1.0,
        "undertone": "warm|cool|neutral",
        "brightness": "light|medium|dark",
        "analysis_reason": "분석 이유 설명"
    },
    "emotion": {
        "facial_expression": "happy|neutral|calm|sad|surprised|angry",
        "facial_expression_confidence": 0.0-1.0
    }
}`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.vision,
      messages: [
        {
          role: "system",
          content:
            "당신은 전문 퍼스널 컬러 컨설턴트입니다. 피부 톤, 언더톤, 색상 조화를 정확하게 분석합니다.",
        },
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            {
              type: "image_url",
              image_url: { url: imageUrl, detail: "high" },
            },
          ],
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 500,
      temperature: 0.3,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    result.source = "gpt-4o-vision";
    return result;
  } catch (error) {
    console.warn("Vision API failed:", error);
    return fallbackAnalysis();
  }
}

function fallbackAnalysis(): VisionAnalysisResult {
  return {
    tone: {
      season: "summer",
      subtype: "cool",
      confidence: 0.7,
      undertone: "cool",
      brightness: "medium",
      analysis_reason: "API 분석 실패로 기본값 사용",
    },
    emotion: {
      facial_expression: "neutral",
      facial_expression_confidence: 0.5,
    },
    source: "fallback",
  };
}
