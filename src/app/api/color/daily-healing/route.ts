import { createSupabaseServerClient } from "@/lib/supabase/server";
import { COLOR_PALETTES } from "@/lib/constants/colors";
import { openai, OPENAI_MODELS } from "@/lib/openai";
import { successResponse, errorResponse } from "@/lib/api-utils";

interface HealingColorContent {
  calm_effect: string;
  personal_fit: string;
  daily_affirmation: string;
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

    // OpenAI로 동적 컨텐츠 생성
    const healingContent = await generateHealingContent(
      selectedColor.name,
      selectedColor.hex,
      selectedColor.description,
      personalColor?.season || "summer",
      personalColor?.tone || "cool"
    );

    // 새로운 힐링 컬러 생성
    const newDailyColor = {
      user_id: user.id,
      color_name: selectedColor.name,
      color_hex: selectedColor.hex,
      color_description: selectedColor.description,
      calm_effect: healingContent.calm_effect,
      personal_fit: healingContent.personal_fit,
      daily_affirmation: healingContent.daily_affirmation,
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

async function generateHealingContent(
  colorName: string,
  colorHex: string,
  colorDescription: string,
  season: string,
  tone: string
): Promise<HealingColorContent> {
  if (!process.env.OPENAI_API_KEY) {
    return fallbackHealingContent(colorName);
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

  const prompt = `당신은 전문 컬러 테라피스트이자 심리 상담사입니다.
오늘의 힐링 컬러에 대한 개인화된 메시지를 생성해주세요.

오늘의 힐링 컬러: ${colorName} (${colorHex})
컬러 설명: ${colorDescription}
사용자 퍼스널 컬러: ${seasonNames[season] || season} ${toneNames[tone] || tone}

다음 세 가지 메시지를 작성해주세요:

1. calm_effect: 이 컬러가 주는 심리적 안정 효과 (2-3문장, 구체적인 효과 설명)
2. personal_fit: 사용자의 퍼스널 컬러와 이 힐링 컬러가 어떻게 조화를 이루는지 (2문장)
3. daily_affirmation: 오늘 하루를 위한 따뜻한 확언/격려 메시지 (1-2문장, 긍정적이고 힘이 되는 메시지)

JSON 형식으로만 응답해주세요:
{
  "calm_effect": "...",
  "personal_fit": "...",
  "daily_affirmation": "..."
}`;

  try {
    const response = await openai.chat.completions.create({
      model: OPENAI_MODELS.text,
      messages: [
        {
          role: "system",
          content:
            "당신은 따뜻하고 공감 능력이 뛰어난 컬러 테라피 전문가입니다. 색상의 심리적 효과에 대해 깊이 이해하고, 개인화된 힐링 메시지를 제공합니다.",
        },
        { role: "user", content: prompt },
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
      max_tokens: 400,
    });

    const result = JSON.parse(response.choices[0].message.content || "{}");
    console.log("Generated healing content:", result);

    return {
      calm_effect: result.calm_effect || fallbackHealingContent(colorName).calm_effect,
      personal_fit: result.personal_fit || fallbackHealingContent(colorName).personal_fit,
      daily_affirmation: result.daily_affirmation || fallbackHealingContent(colorName).daily_affirmation,
    };
  } catch (error) {
    console.warn("OpenAI healing content generation failed:", error);
    return fallbackHealingContent(colorName);
  }
}

function fallbackHealingContent(colorName: string): HealingColorContent {
  return {
    calm_effect: `${colorName}은(는) 마음을 편안하게 해주고 일상의 스트레스를 완화하는 효과가 있습니다. 이 컬러를 통해 내면의 평화를 찾아보세요.`,
    personal_fit: "당신의 퍼스널 컬러와 조화롭게 어울려 자연스러운 아름다움을 더해줍니다.",
    daily_affirmation: "오늘 하루도 당신은 충분히 아름답고 가치 있는 존재입니다. 자신을 믿으세요.",
  };
}
