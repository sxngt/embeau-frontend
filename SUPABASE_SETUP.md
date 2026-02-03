# Supabase 데이터베이스 설정 가이드

## 접속 방법
1. https://supabase.com/dashboard 로그인
2. 프로젝트 선택
3. 왼쪽 메뉴 → **SQL Editor** 클릭

---

## Step 1: 테이블 생성

```sql
-- 1. 프로필 테이블 (auth.users 확장)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_id TEXT UNIQUE NOT NULL,
  name TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 퍼스널 컬러 결과
CREATE TABLE color_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  season TEXT NOT NULL CHECK (season IN ('spring', 'summer', 'autumn', 'winter')),
  tone TEXT NOT NULL CHECK (tone IN ('warm', 'cool')),
  subtype TEXT,
  confidence REAL NOT NULL,
  description TEXT NOT NULL,
  recommended_colors JSONB NOT NULL,
  facial_expression TEXT,
  analyzed_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 일일 힐링 컬러
CREATE TABLE daily_healing_colors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  color_name TEXT NOT NULL,
  color_hex TEXT NOT NULL,
  calm_effect TEXT NOT NULL,
  personal_fit TEXT NOT NULL,
  daily_affirmation TEXT NOT NULL,
  date DATE NOT NULL,
  UNIQUE(user_id, date)
);

-- 4. 감정 기록
CREATE TABLE emotion_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  input_text TEXT NOT NULL,
  anxiety REAL DEFAULT 0,
  stress REAL DEFAULT 0,
  satisfaction REAL DEFAULT 0,
  happiness REAL DEFAULT 0,
  depression REAL DEFAULT 0,
  healing_colors JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 주간 인사이트
CREATE TABLE weekly_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_start DATE NOT NULL,
  week_end DATE NOT NULL,
  avg_anxiety REAL DEFAULT 0,
  avg_stress REAL DEFAULT 0,
  avg_satisfaction REAL DEFAULT 0,
  avg_happiness REAL DEFAULT 0,
  avg_depression REAL DEFAULT 0,
  improvement TEXT NOT NULL,
  next_week_suggestion TEXT NOT NULL,
  active_days INTEGER DEFAULT 0,
  UNIQUE(user_id, week_start)
);

-- 6. 피드백
CREATE TABLE feedbacks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  target_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 추천 아이템 (정적 데이터)
CREATE TABLE recommendation_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_type TEXT NOT NULL CHECK (item_type IN ('fashion', 'food', 'activity')),
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT,
  primary_color_hex TEXT NOT NULL,
  season TEXT,
  is_active BOOLEAN DEFAULT TRUE
);
```

---

## Step 2: RLS (Row Level Security) 설정

```sql
-- RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_healing_colors ENABLE ROW LEVEL SECURITY;
ALTER TABLE emotion_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE weekly_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedbacks ENABLE ROW LEVEL SECURITY;
ALTER TABLE recommendation_items ENABLE ROW LEVEL SECURITY;

-- 사용자 본인 데이터만 접근 가능
CREATE POLICY "Users own data" ON profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Users own data" ON color_results FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON daily_healing_colors FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON emotion_entries FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON weekly_insights FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Users own data" ON feedbacks FOR ALL USING (auth.uid() = user_id);
CREATE POLICY "Public read" ON recommendation_items FOR SELECT USING (true);
```

---

## Step 3: 트리거 설정 (회원가입 시 프로필 자동 생성)

```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, participant_id)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'participant_id', 'P-' || substr(NEW.id::text, 1, 8)));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

---

## 실행 순서

1. **Step 1** 실행 → 테이블 생성 확인
2. **Step 2** 실행 → RLS 정책 적용
3. **Step 3** 실행 → 트리거 생성

각 Step의 SQL을 복사해서 SQL Editor에 붙여넣고 **Run** 버튼 클릭 (또는 `Cmd+Enter`)
