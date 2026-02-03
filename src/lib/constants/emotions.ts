// 백엔드 emotion_analyzer.py에서 마이그레이션

export const EMOTION_HEALING_COLORS: Record<string, Array<{ name: string; hex: string; effect: string }>> = {
  anxiety: [
    { name: "라벤더", hex: "#E6E6FA", effect: "마음을 진정시키고 불안을 완화합니다" },
    { name: "페일 블루", hex: "#AFEEEE", effect: "평온함과 안정감을 선사합니다" },
  ],
  stress: [
    { name: "민트 그린", hex: "#98FB98", effect: "긴장을 풀어주고 스트레스를 해소합니다" },
    { name: "스카이 블루", hex: "#87CEEB", effect: "마음의 휴식을 가져다줍니다" },
  ],
  depression: [
    { name: "소프트 옐로우", hex: "#FFFACD", effect: "밝은 에너지로 기분을 북돋웁니다" },
    { name: "피치", hex: "#FFDAB9", effect: "따뜻함으로 마음을 감싸줍니다" },
  ],
  happiness: [
    { name: "코랄", hex: "#FF7F50", effect: "행복한 에너지를 더욱 증폭시킵니다" },
    { name: "골드", hex: "#FFD700", effect: "긍정적인 기운을 더해줍니다" },
  ],
  satisfaction: [
    { name: "세이지 그린", hex: "#9DC183", effect: "만족감을 지속시키고 균형을 유지합니다" },
    { name: "소프트 베이지", hex: "#F5F5DC", effect: "안정감과 편안함을 선사합니다" },
  ],
};

// 키워드 기반 감정 분석용 (폴백)
export const EMOTION_KEYWORDS = {
  anxiety: ["불안", "걱정", "두려움", "무서움", "초조", "긴장"],
  stress: ["스트레스", "피곤", "지침", "힘듦", "벅참", "압박"],
  satisfaction: ["만족", "뿌듯", "성취", "보람", "충족"],
  happiness: ["행복", "기쁨", "즐거움", "좋음", "신남", "기분좋"],
  depression: ["우울", "슬픔", "외로움", "공허", "무기력", "우울함"],
};

// 감정 분석을 위한 키워드 기반 폴백 함수
export function analyzeWithKeywords(text: string): {
  anxiety: number;
  stress: number;
  satisfaction: number;
  happiness: number;
  depression: number;
} {
  const textLower = text.toLowerCase();

  const countKeywords = (keywords: string[]): number => {
    const count = keywords.filter((keyword) => textLower.includes(keyword)).length;
    return Math.min(count * 30, 100); // 키워드당 30점, 최대 100점
  };

  return {
    anxiety: countKeywords(EMOTION_KEYWORDS.anxiety),
    stress: countKeywords(EMOTION_KEYWORDS.stress),
    satisfaction: countKeywords(EMOTION_KEYWORDS.satisfaction),
    happiness: countKeywords(EMOTION_KEYWORDS.happiness),
    depression: countKeywords(EMOTION_KEYWORDS.depression),
  };
}

// 지배적인 부정 감정 찾기
export function getDominantNegativeEmotion(emotions: {
  anxiety: number;
  stress: number;
  satisfaction: number;
  happiness: number;
  depression: number;
}): string {
  const negativeEmotions = {
    anxiety: emotions.anxiety,
    stress: emotions.stress,
    depression: emotions.depression,
  };

  const positiveSum = emotions.satisfaction + emotions.happiness;
  const negativeSum = emotions.anxiety + emotions.stress + emotions.depression;

  if (positiveSum > negativeSum) {
    return emotions.happiness > emotions.satisfaction ? "happiness" : "satisfaction";
  }

  return Object.entries(negativeEmotions).reduce((a, b) =>
    a[1] > b[1] ? a : b
  )[0];
}

// 힐링 컬러 가져오기
export function getHealingColors(dominantEmotion: string) {
  return EMOTION_HEALING_COLORS[dominantEmotion] || EMOTION_HEALING_COLORS.stress;
}
