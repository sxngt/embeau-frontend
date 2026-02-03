# Supabase 트리거 오류 수정

"Database error saving new user" 오류 해결용 SQL

## SQL Editor에서 실행

```sql
-- 1. 기존 트리거/함수 삭제 (있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS handle_new_user();

-- 2. profiles 테이블 확인 및 생성
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_id TEXT UNIQUE NOT NULL,
  name TEXT,
  consent_given BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. RLS 활성화
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. RLS 정책 (이미 있으면 무시됨)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'profiles' AND policyname = 'Users own data') THEN
    CREATE POLICY "Users own data" ON profiles FOR ALL USING (auth.uid() = id);
  END IF;
END $$;

-- 5. 트리거 함수 재생성
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO profiles (id, participant_id)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'participant_id', 'P-' || substr(NEW.id::text, 1, 8))
  );
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## 실행 후

회원가입 다시 시도
