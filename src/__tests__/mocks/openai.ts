// Mock OpenAI client for testing

export const mockColorAnalysisResponse = {
  tone: {
    season: 'winter',
    subtype: 'cool',
    confidence: 0.85,
    undertone: 'cool',
    brightness: 'medium',
    analysis_reason: '피부톤이 푸른 기가 돌며 선명한 색상이 어울립니다.',
  },
  emotion: {
    facial_expression: 'neutral',
    facial_expression_confidence: 0.9,
  },
  source: 'gpt-4o-vision',
};

export const mockEmotionAnalysisResponse = {
  anxiety: 45,
  stress: 70,
  satisfaction: 30,
  happiness: 25,
  depression: 40,
  dominant_emotion: 'stress',
  analysis_note: '높은 스트레스 수준이 감지됩니다.',
};

export const mockHealingContentResponse = {
  calm_effect: '라벤더 컬러는 마음을 진정시키고 내면의 평화를 가져다 줍니다.',
  personal_fit: '당신의 쿨톤과 자연스럽게 어울려 세련된 느낌을 더해줍니다.',
  daily_affirmation: '오늘 하루, 당신은 어떤 어려움도 극복할 수 있는 강한 사람입니다.',
};

export const mockRecommendationsResponse = {
  fashion: [
    {
      id: 'f1',
      type: 'fashion',
      title: '로얄 블루 캐시미어 스웨터',
      description: '선명한 로얄 블루 컬러로 겨울 쿨톤의 피부톤을 돋보이게 해줍니다.',
      color: '#4169E1',
    },
    {
      id: 'f2',
      type: 'fashion',
      title: '퓨어 화이트 실크 블라우스',
      description: '깔끔한 화이트로 세련된 느낌을 연출합니다.',
      color: '#FFFFFF',
    },
    {
      id: 'f3',
      type: 'fashion',
      title: '블랙 테일러드 코트',
      description: '클래식한 블랙 코트로 겨울 쿨톤의 매력을 극대화합니다.',
      color: '#000000',
    },
  ],
  food: [
    {
      id: 'fd1',
      type: 'food',
      title: '블루베리 스무디',
      description: '항산화 성분이 풍부한 블루베리로 스트레스 해소에 도움됩니다.',
      color: '#4169E1',
    },
    {
      id: 'fd2',
      type: 'food',
      title: '석류 주스',
      description: '비타민이 풍부한 석류 주스로 활력을 되찾으세요.',
      color: '#DC143C',
    },
    {
      id: 'fd3',
      type: 'food',
      title: '다크 초콜릿',
      description: '진한 카카오로 기분 전환에 좋습니다.',
      color: '#8B4513',
    },
  ],
  activities: [
    {
      id: 'a1',
      type: 'activity',
      title: '명상',
      description: '마음을 진정시키고 스트레스를 해소하는 명상 시간을 가져보세요.',
      color: '#E6E6FA',
    },
    {
      id: 'a2',
      type: 'activity',
      title: '미술관 방문',
      description: '예술 작품 감상으로 마음의 평화를 찾아보세요.',
      color: '#4169E1',
    },
    {
      id: 'a3',
      type: 'activity',
      title: '독서',
      description: '차분한 시간과 함께 좋은 책을 읽어보세요.',
      color: '#8B4513',
    },
  ],
};

export const mockWeeklyInsightResponse = {
  improvement: '이번 주는 전반적으로 스트레스가 높았지만, 주말에 회복하는 모습을 보였습니다.',
  suggestion: '다음 주에는 규칙적인 수면과 가벼운 운동으로 스트레스를 관리해보세요.',
};

// Create mock OpenAI chat completion
export const createMockChatCompletion = (content: unknown) => ({
  choices: [
    {
      message: {
        content: JSON.stringify(content),
      },
      finish_reason: 'stop',
    },
  ],
  usage: {
    prompt_tokens: 100,
    completion_tokens: 200,
    total_tokens: 300,
  },
});

// Mock OpenAI client
export const createMockOpenAIClient = () => ({
  chat: {
    completions: {
      create: jest.fn().mockImplementation(({ messages }) => {
        // Determine which response to return based on message content
        const userMessage = messages.find((m: { role: string }) => m.role === 'user')?.content || '';
        const messageText = typeof userMessage === 'string'
          ? userMessage
          : JSON.stringify(userMessage);

        if (messageText.includes('퍼스널 컬러')) {
          return Promise.resolve(createMockChatCompletion(mockColorAnalysisResponse));
        } else if (messageText.includes('감정 상태')) {
          return Promise.resolve(createMockChatCompletion(mockEmotionAnalysisResponse));
        } else if (messageText.includes('힐링 컬러')) {
          return Promise.resolve(createMockChatCompletion(mockHealingContentResponse));
        } else if (messageText.includes('개인화된 추천')) {
          return Promise.resolve(createMockChatCompletion(mockRecommendationsResponse));
        } else if (messageText.includes('주간 인사이트') || messageText.includes('평균 감정 점수')) {
          return Promise.resolve(createMockChatCompletion(mockWeeklyInsightResponse));
        }

        return Promise.resolve(createMockChatCompletion({}));
      }),
    },
  },
});

// Jest mock for openai module
export const mockOpenAI = createMockOpenAIClient();
