// 백엔드 color_analyzer.py에서 마이그레이션

export const COLOR_PALETTES: Record<string, Array<{ name: string; hex: string; description: string }>> = {
  spring_warm: [
    { name: "코랄", hex: "#FF7F50", description: "따뜻하고 생기 있는 코랄" },
    { name: "피치", hex: "#FFDAB9", description: "부드러운 복숭아빛" },
    { name: "골든 옐로우", hex: "#FFD700", description: "밝고 화사한 금색" },
    { name: "라이트 그린", hex: "#90EE90", description: "싱그러운 연두색" },
    { name: "아이보리", hex: "#FFFFF0", description: "따뜻한 아이보리" },
  ],
  spring_clear: [
    { name: "브라이트 코랄", hex: "#FF6B6B", description: "선명한 코랄" },
    { name: "터콰이즈", hex: "#40E0D0", description: "맑은 청록색" },
    { name: "선 옐로우", hex: "#FFEF00", description: "맑고 밝은 노랑" },
    { name: "페퍼민트", hex: "#98FF98", description: "상쾌한 민트색" },
    { name: "퓨어 화이트", hex: "#FFFFFF", description: "깨끗한 순백색" },
  ],
  summer_cool: [
    { name: "라벤더", hex: "#E6E6FA", description: "차분한 라벤더" },
    { name: "스카이 블루", hex: "#87CEEB", description: "시원한 하늘색" },
    { name: "소프트 핑크", hex: "#FFB6C1", description: "부드러운 분홍" },
    { name: "민트 그린", hex: "#98FB98", description: "청량한 민트" },
    { name: "페일 그레이", hex: "#D3D3D3", description: "세련된 회색" },
  ],
  summer_soft: [
    { name: "더스티 핑크", hex: "#D8A9A9", description: "차분한 더스티 핑크" },
    { name: "세이지 그린", hex: "#9DC183", description: "부드러운 세이지" },
    { name: "모브", hex: "#E0B0FF", description: "우아한 모브" },
    { name: "블루 그레이", hex: "#6699CC", description: "세련된 블루 그레이" },
    { name: "로즈 베이지", hex: "#C4A484", description: "따뜻한 로즈 베이지" },
  ],
  autumn_warm: [
    { name: "테라코타", hex: "#E2725B", description: "따뜻한 테라코타" },
    { name: "머스타드", hex: "#FFDB58", description: "깊은 머스타드" },
    { name: "올리브 그린", hex: "#808000", description: "자연스러운 올리브" },
    { name: "버건디", hex: "#800020", description: "깊은 버건디" },
    { name: "카멜", hex: "#C19A6B", description: "클래식한 카멜" },
  ],
  autumn_deep: [
    { name: "초콜릿", hex: "#7B3F00", description: "깊은 초콜릿 브라운" },
    { name: "포레스트 그린", hex: "#228B22", description: "깊은 숲색" },
    { name: "퍼플 와인", hex: "#722F37", description: "고급스러운 와인색" },
    { name: "브릭 레드", hex: "#CB4154", description: "따뜻한 벽돌색" },
    { name: "골드", hex: "#D4AF37", description: "우아한 골드" },
  ],
  winter_cool: [
    { name: "로얄 블루", hex: "#4169E1", description: "선명한 로얄 블루" },
    { name: "퓨시아", hex: "#FF00FF", description: "강렬한 퓨시아" },
    { name: "에메랄드", hex: "#50C878", description: "선명한 에메랄드" },
    { name: "퓨어 화이트", hex: "#FFFFFF", description: "순수한 화이트" },
    { name: "실버", hex: "#C0C0C0", description: "차가운 실버" },
  ],
  winter_clear: [
    { name: "트루 레드", hex: "#FF0000", description: "선명한 빨강" },
    { name: "일렉트릭 블루", hex: "#7DF9FF", description: "강렬한 일렉트릭 블루" },
    { name: "핫 핑크", hex: "#FF69B4", description: "화려한 핫 핑크" },
    { name: "블랙", hex: "#000000", description: "깊은 블랙" },
    { name: "아이시 블루", hex: "#A5F2F3", description: "차가운 아이시 블루" },
  ],
};

export const SEASON_DESCRIPTIONS: Record<string, string> = {
  spring:
    "봄 타입은 밝고 따뜻한 색조가 잘 어울립니다. 피부에 황색 베이스가 있으며, 생기 있고 화사한 컬러가 얼굴을 환하게 밝혀줍니다.",
  summer:
    "여름 타입은 부드럽고 시원한 색조가 잘 어울립니다. 피부에 핑크빛 베이스가 있으며, 파스텔 톤과 그레이시한 컬러가 우아함을 더해줍니다.",
  autumn:
    "가을 타입은 따뜻하고 깊은 색조가 잘 어울립니다. 피부에 황금빛 베이스가 있으며, 어스 톤과 깊이 있는 컬러가 고급스러움을 연출합니다.",
  winter:
    "겨울 타입은 선명하고 차가운 색조가 잘 어울립니다. 피부에 푸른 베이스가 있으며, 대비가 강한 컬러가 세련된 인상을 줍니다.",
};

// 감정 기반 힐링 컬러 (color_analyzer.py의 HEALING_COLORS)
export const HEALING_COLORS: Record<string, Array<{ name: string; hex: string; effect: string }>> = {
  anxiety: [
    { name: "라벤더", hex: "#E6E6FA", effect: "마음을 진정시키고 불안을 완화합니다" },
    { name: "스카이 블루", hex: "#87CEEB", effect: "평온함과 안정감을 선사합니다" },
  ],
  stress: [
    { name: "민트 그린", hex: "#98FB98", effect: "긴장을 풀어주고 스트레스를 해소합니다" },
    { name: "페일 블루", hex: "#AFEEEE", effect: "마음의 휴식을 가져다줍니다" },
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

// 일일 확언 목록
export const DAILY_AFFIRMATIONS = [
  "오늘 하루도 당신은 충분히 멋집니다.",
  "작은 것에도 감사하는 하루가 되길 바랍니다.",
  "당신의 존재 자체가 빛나는 하루입니다.",
  "오늘의 색상이 당신에게 평온을 가져다주길 바랍니다.",
  "자신을 믿고 한 걸음씩 나아가세요.",
];
