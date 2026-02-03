import OpenAI from "openai";

export const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// 모델 설정
export const OPENAI_MODELS = {
  vision: "gpt-4o", // 이미지 분석용
  text: "gpt-4o-mini", // 텍스트 분석용 (빠르고 저렴)
} as const;
