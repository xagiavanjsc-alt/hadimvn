-- ─── 107: Sync leaderboard best_score và words_learned từ user_progress ─────
-- Vấn đề: Leaderboard hiển thị 0 cho EPS cao nhất và Từ đã học
-- Giải pháp: Sync thủ công từ user_progress để đảm bảo dữ liệu đúng

-- 1. Đảm bảo user_progress có columns cần thiết
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'best_score') THEN
    ALTER TABLE public.user_progress ADD COLUMN best_score INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'words_learned') THEN
    ALTER TABLE public.user_progress ADD COLUMN words_learned INT DEFAULT 0;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'user_progress' AND column_name = 'streak_count') THEN
    ALTER TABLE public.user_progress ADD COLUMN streak_count INT DEFAULT 0;
  END IF;
END $$;

-- 2. Tính toán và cập nhật best_score cho tất cả users từ exam_results
UPDATE public.user_progress up
SET best_score = (
  SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
  FROM public.exam_results
  WHERE user_id = up.user_id AND is_valid = true AND total > 0
)
WHERE EXISTS (
  SELECT 1 FROM public.exam_results
  WHERE user_id = up.user_id AND is_valid = true AND total > 0
);

-- 3. Tính toán và cập nhật words_learned từ flashcard_known (giả lập từ localStorage)
-- Vì words_learned không có trong database, ta dùng flashcard_known từ exam_results
UPDATE public.user_progress up
SET words_learned = sub.word_count
FROM (
  SELECT er.user_id, COUNT(DISTINCT elem.word) as word_count
  FROM public.exam_results er,
       LATERAL jsonb_array_elements_text(er.correct_ids) as elem(word)
  WHERE er.is_valid = true AND er.correct_ids IS NOT NULL AND jsonb_array_length(er.correct_ids) > 0
  GROUP BY er.user_id
) sub
WHERE up.user_id = sub.user_id;

-- 3.5. Tạo avatar mặc định cho các user chưa có avatar trong user_profiles
UPDATE public.user_profiles p
SET avatar_url = 'https://ui-avatars.com/api/?name=' || encode(url_encode(p.display_name), 'escape') || '&background=random&color=fff&size=128'
WHERE avatar_url IS NULL AND display_name IS NOT NULL;

-- 4. Sync từ user_progress sang leaderboard cho tất cả users
INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, streak, best_score, words_learned, level, is_vip, vip_expires_at, updated_at)
SELECT 
  up.user_id,
  COALESCE(p.display_name, 'Học viên'),
  p.avatar_url,
  COALESCE(up.xp, 0),
  COALESCE(up.streak_count, 0),
  COALESCE(up.best_score, 0),
  COALESCE(up.words_learned, 0),
  CASE
    WHEN COALESCE(up.best_score, 0) >= 80 THEN 'TOPIK II'
    WHEN COALESCE(up.best_score, 0) >= 60 THEN 'TOPIK I'
    ELSE 'Cơ bản'
  END,
  COALESCE(p.is_vip, FALSE),
  p.vip_expires_at,
  NOW()
FROM public.user_progress up
LEFT JOIN public.user_profiles p ON p.id = up.user_id
ON CONFLICT (user_id) DO UPDATE SET
  display_name = COALESCE(EXCLUDED.display_name, public.leaderboard.display_name),
  avatar_url = COALESCE(EXCLUDED.avatar_url, public.leaderboard.avatar_url),
  xp = EXCLUDED.xp,
  streak = EXCLUDED.streak,
  best_score = EXCLUDED.best_score,
  words_learned = EXCLUDED.words_learned,
  level = EXCLUDED.level,
  is_vip = EXCLUDED.is_vip,
  vip_expires_at = EXCLUDED.vip_expires_at,
  updated_at = EXCLUDED.updated_at;

-- 5. Đảm bảo trigger sync_leaderboard_from_user_progress tồn tại và đúng
CREATE OR REPLACE FUNCTION public.sync_leaderboard_from_user_progress()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_display_name TEXT;
    v_avatar_url TEXT;
    v_is_vip BOOLEAN;
    v_vip_expires_at TIMESTAMP WITH TIME ZONE;
BEGIN
    SELECT display_name, avatar_url, is_vip, vip_expires_at
    INTO v_display_name, v_avatar_url, v_is_vip, v_vip_expires_at
    FROM public.user_profiles
    WHERE id = NEW.user_id;

    INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, streak, best_score, words_learned, level, is_vip, vip_expires_at, updated_at)
    VALUES (
        NEW.user_id,
        COALESCE(v_display_name, 'Học viên'),
        v_avatar_url,
        NEW.xp,
        NEW.streak_count,
        NEW.best_score,
        NEW.words_learned,
        NEW.level,
        COALESCE(v_is_vip, FALSE),
        v_vip_expires_at,
        NEW.updated_at
    )
    ON CONFLICT (user_id)
    DO UPDATE SET
        display_name = COALESCE(v_display_name, public.leaderboard.display_name),
        avatar_url = v_avatar_url,
        xp = NEW.xp,
        streak = NEW.streak_count,
        best_score = NEW.best_score,
        words_learned = NEW.words_learned,
        level = NEW.level,
        is_vip = COALESCE(v_is_vip, FALSE),
        vip_expires_at = v_vip_expires_at,
        updated_at = NEW.updated_at;
    RETURN NEW;
END;
$$;

-- 6. Đảm bảo trigger tồn tại trên user_progress
DROP TRIGGER IF EXISTS on_user_progress_change ON public.user_progress;
CREATE TRIGGER on_user_progress_change
AFTER INSERT OR UPDATE OF xp, streak_count, best_score, words_learned, level, updated_at
ON public.user_progress
FOR EACH ROW EXECUTE FUNCTION public.sync_leaderboard_from_user_progress();
