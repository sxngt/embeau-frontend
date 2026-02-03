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
      const { error: updateError } = await supabase
        .from("color_results")
        .update(colorResultData)
        .eq("user_id", user.id);

      if (updateError) {
        console.error("Update color result error:", {
          error: updateError,
          code: updateError.code,
          message: updateError.message,
          data: colorResultData,
        });
      } else {
        console.log("Color result updated for user:", user.id);
      }
    } else {
      const { error: insertError } = await supabase
        .from("color_results")
        .insert(colorResultData);

      if (insertError) {
        console.error("Insert color result error:", {
          error: insertError,
          code: insertError.code,
          message: insertError.message,
          data: colorResultData,
        });
      } else {
        console.log("Color result inserted for user:", user.id);
      }
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
      // 디버그 정보
      _debug: {
        source: analysisData.source || "unknown",
        rawSeason: toneData.season,
        rawSubtype: toneData.subtype,
        analysisReason: toneData.analysis_reason,
      },
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

  const prompt = `당신은 전문 퍼스널 컬러 컨설턴트입니다. 이 얼굴 이미지를 분석하여 퍼스널 컬러를 진단해주세요.

## 퍼스널 컬러 진단 기준

### 1. 피부 언더톤 분석
- **웜톤**: 피부가 노란빛, 복숭아빛, 황금빛을 띔. 혈관이 초록빛으로 보임.
- **쿨톤**: 피부가 분홍빛, 푸른빛, 붉은빛을 띔. 혈관이 파란빛/보라빛으로 보임.

### 2. 계절 타입 기준
- **봄(spring)**: 웜톤 + 밝고 선명한 피부. 생기있는 느낌. 밝은 갈색/금발 어울림.
- **여름(summer)**: 쿨톤 + 부드럽고 차분한 피부. 은은한 느낌. 회갈색/애쉬톤 어울림.
- **가을(autumn)**: 웜톤 + 깊고 따뜻한 피부. 성숙한 느낌. 짙은 갈색/구릿빛 어울림.
- **겨울(winter)**: 쿨톤 + 선명하고 차가운 피부. 대비가 강한 느낌. 검정/선명한 색 어울림.

### 3. 세부 타입
- **clear**: 선명하고 맑은 피부 (봄/겨울)
- **soft**: 부드럽고 차분한 피부 (여름/가을)
- **light**: 밝고 연한 피부 (봄/여름)
- **deep**: 깊고 진한 피부 (가을/겨울)
- **warm**: 따뜻한 톤 (봄/가을)
- **cool**: 차가운 톤 (여름/겨울)

## 분석 시 주의사항
- 조명의 영향을 고려하여 자연스러운 피부톤을 추정하세요.
- 눈동자 색, 머리카락 색, 입술 색도 함께 고려하세요.
- 피부의 붉은기, 노란기, 푸른기를 세밀하게 관찰하세요.

다음 JSON 형식으로만 응답해주세요:
{
    "tone": {
        "season": "spring 또는 summer 또는 autumn 또는 winter 중 하나만",
        "subtype": "warm 또는 cool 또는 clear 또는 soft 또는 deep 또는 light 중 하나만",
        "confidence": 0.0-1.0,
        "undertone": "warm 또는 cool 또는 neutral",
        "brightness": "light 또는 medium 또는 dark",
        "analysis_reason": "피부톤, 눈동자색, 머리카락색을 근거로 한 상세한 분석 이유"
    },
    "emotion": {
        "facial_expression": "happy 또는 neutral 또는 calm 또는 sad 또는 surprised 또는 angry",
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
    console.log("GPT-4o Vision Analysis Result:", JSON.stringify(result, null, 2));
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
