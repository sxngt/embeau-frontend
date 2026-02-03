import { NextRequest } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { openai, OPENAI_MODELS } from "@/lib/openai";
import {
  EMOTION_HEALING_COLORS,
  analyzeWithKeywords,
  getDominantNegativeEmotion,
  getHealingColors,
} from "@/lib/constants/emotions";
import { successResponse, errorResponse } from "@/lib/api-utils";

interface AnalyzeRequest {
  text: string;
}

interface EmotionAnalysisResult {
  anxiety: number;
  stress: number;
  satisfaction: number;
  happiness: number;
  depression: number;
  dominant_emotion?: string;
  analysis_note?: string;
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

    if (!body.text || body.text.trim().length === 0) {
      return errorResponse("BAD_REQUEST", "분석할 텍스트가 필요합니다.", 400);
    }

    // 감정 분석 (OpenAI 사용 가능하면 사용, 아니면 키워드 기반)
    let emotions: EmotionAnalysisResult;
    if (process.env.OPENAI_API_KEY) {
      emotions = await analyzeWithOpenAI(body.text);
    } else {
      const keywordResult = analyzeWithKeywords(body.text);
      emotions = keywordResult;
    }

    // 지배적인 감정 결정 및 힐링 컬러 가져오기
    const dominantEmotion = getDominantNegativeEmotion(emotions);
    const healingColors = getHealingColors(dominantEmotion);

    // 데이터베이스에 저장
    const emotionEntry = {
      user_id: user.id,
      input_text: body.text,
      anxiety: emotions.anxiety,
      stress: emotions.stress,
      satisfaction: emotions.satisfaction,
      happiness: emotions.happiness,
      depression: emotions.depression,
      healing_colors: healingColors,
    };

    const { data: insertedEntry, error: insertError } = await supabase
      .from("emotion_entries")
      .insert(emotionEntry)
      .select()
      .single();

    if (insertError) {
      console.error("Insert emotion entry error:", {
        error: insertError,
        code: insertError.code,
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        data: emotionEntry,
      });
      return errorResponse(
        "DATABASE_ERROR",
        `감정 기록 저장 중 오류가 발생했습니다: ${insertError.message}`,
        500
      );
    }

    console.log("Emotion entry saved:", insertedEntry.id);

    return successResponse({
      id: insertedEntry.id,
      date: insertedEntry.created_at,
      text: body.text,
      emotions: {
        anxiety: emotions.anxiety,
        stress: emotions.stress,
        satisfaction: emotions.satisfaction,
        happiness: emotions.happiness,
        depression: emotions.depression,
      },
      healingColors,
    });
  } catch (error) {
    console.error("Emotion analysis error:", error);
    return errorResponse(
      "ANALYSIS_ERROR",
      "감정 분석 중 오류가 발생했습니다.",
      500
    );
  }
}

async function analyzeWithOpenAI(text: string): Promise<EmotionAnalysisResult> {
  const prompt = `당신은 전문 심리 상담사입니다. 다음 텍스트에서 작성자의 감정 상태를 세밀하게 분석해주세요.

텍스트: "${text}"

각 감정에 대해 0-100 사이의 점수를 매겨주세요.
텍스트의 맥락, 단어 선택, 표현 방식을 종합적으로 고려하여 분석해주세요.

점수 기준:
- 0-20: 거의 감지되지 않음
- 21-40: 약하게 감지됨
- 41-60: 보통 수준
- 61-80: 강하게 감지됨
- 81-100: 매우 강하게 감지됨

다음 JSON 형식으로만 응답해주세요:
{
    "anxiety": 0-100,
    "stress": 0-100,
    "satisfaction": 0-100,
    "happiness": 0-100,
    "depression": 0-100,
    "dominant_emotion": "가장 두드러진 감정 이름",
    "analysis_note": "간단한 분석 메모 (선택)"
}`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.text,
      messages: [
        {
          role: "system",
          content:
            "당신은 공감 능력이 뛰어난 심리 상담 전문가입니다. 텍스트에서 미묘한 감정의 뉘앙스까지 정확하게 파악합니다. 한국어 표현과 문화적 맥락을 잘 이해합니다.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.2,
      max_tokens: 300,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    return {
      anxiety: Number(result.anxiety) || 0,
      stress: Number(result.stress) || 0,
      satisfaction: Number(result.satisfaction) || 0,
      happiness: Number(result.happiness) || 0,
      depression: Number(result.depression) || 0,
      dominant_emotion: result.dominant_emotion,
      analysis_note: result.analysis_note,
    };
  } catch (error) {
    console.warn("OpenAI emotion analysis failed:", error);
    return analyzeWithKeywords(text);
  }
}
