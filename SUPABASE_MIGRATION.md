# Supabase 스키마 마이그레이션

API와 테이블 스키마 불일치 수정용 SQL

## SQL Editor에서 실행

```sql
-- =============================================
-- 1. daily_healing_colors 테이블 컬럼 추가
-- =============================================
ALTER TABLE daily_healing_colors
ADD COLUMN IF NOT EXISTS color_description TEXT;

-- =============================================
-- 2. weekly_insights 테이블 컬럼 추가
-- =============================================
ALTER TABLE weekly_insights
ADD COLUMN IF NOT EXISTS color_improvement REAL DEFAULT 0;

ALTER TABLE weekly_insights
ADD COLUMN IF NOT EXISTS mood_improvement REAL DEFAULT 0;

ALTER TABLE weekly_insights
ADD COLUMN IF NOT EXISTS stress_relief REAL DEFAULT 0;

-- =============================================
-- 3. feedbacks 테이블 컬럼 추가
-- =============================================
ALTER TABLE feedbacks
ADD COLUMN IF NOT EXISTS comment TEXT;

-- =============================================
-- 4. 인덱스 추가 (성능 최적화)
-- =============================================
CREATE INDEX IF NOT EXISTS idx_emotion_entries_user_created
ON emotion_entries(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_daily_healing_colors_user_date
ON daily_healing_colors(user_id, date);

CREATE INDEX IF NOT EXISTS idx_weekly_insights_user_week
ON weekly_insights(user_id, week_start);

CREATE INDEX IF NOT EXISTS idx_feedbacks_user_created
ON feedbacks(user_id, created_at DESC);

-- =============================================
-- 5. 테이블 확인 쿼리
-- =============================================
-- 실행 후 아래 쿼리로 테이블 구조 확인:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'daily_healing_colors';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'weekly_insights';
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'feedbacks';
```

## 실행 후 확인

각 테이블에 데이터가 정상적으로 저장되는지 확인:

```sql
-- 최근 데이터 확인
SELECT * FROM daily_healing_colors ORDER BY date DESC LIMIT 5;
SELECT * FROM emotion_entries ORDER BY created_at DESC LIMIT 5;
SELECT * FROM weekly_insights ORDER BY week_start DESC LIMIT 5;
SELECT * FROM feedbacks ORDER BY created_at DESC LIMIT 5;
```
