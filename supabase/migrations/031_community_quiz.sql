-- ─── 031_community_quiz.sql ──────────────────────────────────────────────────
-- Thêm tính năng trắc nghiệm cho bài viết cộng đồng (tăng SEO + engagement)
-- 
-- Schema quiz JSONB:
-- {
--   "question": "Câu hỏi?",
--   "image_url": "https://...",
--   "options": [
--     {"id": 1, "text": "Đáp án A", "is_correct": false},
--     {"id": 2, "text": "Đáp án B", "is_correct": true}
--   ],
--   "explanation": "Giải thích đáp án đúng"
-- }
--
-- APPLY: paste vào Supabase SQL Editor → Run (idempotent)
-- ────────────────────────────────────────────────────────────────────────────

-- ─── 1. Thêm column quiz vào community_posts ─────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'quiz'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN quiz JSONB;
  END IF;
END $$;

-- Index để filter post có quiz
CREATE INDEX IF NOT EXISTS idx_community_posts_quiz
  ON public.community_posts((quiz IS NOT NULL))
  WHERE quiz IS NOT NULL;

-- ─── 2. Bảng tracking câu trả lời (anti-cheat: 1 user = 1 câu trả lời) ───────
CREATE TABLE IF NOT EXISTS public.community_quiz_answers (
  post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  selected_option INT NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (post_id, user_id)
);

CREATE INDEX IF NOT EXISTS idx_quiz_answers_user ON public.community_quiz_answers(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_answers_post ON public.community_quiz_answers(post_id);

-- RLS
ALTER TABLE public.community_quiz_answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own quiz answers" ON public.community_quiz_answers;
CREATE POLICY "Users can view own quiz answers"
  ON public.community_quiz_answers FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own quiz answers" ON public.community_quiz_answers;
CREATE POLICY "Users can insert own quiz answers"
  ON public.community_quiz_answers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Không cho update/delete (đã trả lời là không được đổi)

-- ─── 3. Thêm cột stats vào community_posts ───────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'quiz_total_answers'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN quiz_total_answers INT DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'community_posts' AND column_name = 'quiz_correct_answers'
  ) THEN
    ALTER TABLE public.community_posts ADD COLUMN quiz_correct_answers INT DEFAULT 0;
  END IF;
END $$;

-- ─── 4. Trigger: khi user trả lời quiz, cập nhật stats + cộng XP nếu đúng ───
CREATE OR REPLACE FUNCTION public.handle_quiz_answer()
RETURNS TRIGGER AS $$
DECLARE
  v_post_owner UUID;
  v_name TEXT;
  v_avatar TEXT;
  v_xp INT;
BEGIN
  -- Lấy chủ bài viết
  SELECT user_id INTO v_post_owner
  FROM public.community_posts WHERE id = NEW.post_id;

  -- Không cho tác giả tự trả lời bài của mình
  IF v_post_owner = NEW.user_id THEN
    RAISE EXCEPTION 'Không thể trả lời câu hỏi của chính mình';
  END IF;

  -- Cập nhật stats trong community_posts
  UPDATE public.community_posts
  SET quiz_total_answers = COALESCE(quiz_total_answers, 0) + 1,
      quiz_correct_answers = COALESCE(quiz_correct_answers, 0) + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END)
  WHERE id = NEW.post_id;

  -- Nếu trả lời đúng, cộng 1 XP (thông qua user_progress)
  IF NEW.is_correct THEN
    -- Đảm bảo user_progress tồn tại
    INSERT INTO public.user_progress (user_id, xp, updated_at)
    VALUES (NEW.user_id, 1, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      xp = COALESCE(public.user_progress.xp, 0) + 1,
      updated_at = NOW();

    -- Sync leaderboard
    SELECT COALESCE(display_name, 'Học viên'), avatar_url
    INTO v_name, v_avatar
    FROM public.user_profiles WHERE id = NEW.user_id;

    SELECT xp INTO v_xp FROM public.user_progress WHERE user_id = NEW.user_id;

    INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, updated_at)
    VALUES (NEW.user_id, COALESCE(v_name, 'Học viên'), v_avatar, v_xp, NOW())
    ON CONFLICT (user_id) DO UPDATE SET
      xp = EXCLUDED.xp,
      updated_at = EXCLUDED.updated_at;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS trg_quiz_answer ON public.community_quiz_answers;
CREATE TRIGGER trg_quiz_answer
  AFTER INSERT ON public.community_quiz_answers
  FOR EACH ROW EXECUTE FUNCTION public.handle_quiz_answer();

-- ─── DONE ──────────────────────────────────────────────────────────────────
