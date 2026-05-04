-- ─── 037_xp_never_decrease.sql ───────────────────────────────────────────────
-- Áp dụng quy tắc XP site-wide: server_xp = GREATEST(xp_hiện_tại, xp_công_thức)
-- Đảm bảo XP KHÔNG BAO GIỜ giảm khi có exam/community trigger chạy.
-- Khớp với logic client trong useXPSystem.scheduleServerSync và useStudySync.
--
-- APPLY: paste vào Supabase SQL Editor → Run (idempotent)
-- ────────────────────────────────────────────────────────────────────────────

-- ─── 1. Sửa trigger community: dùng GREATEST để không giảm ──────────────────
CREATE OR REPLACE FUNCTION public.update_user_xp_on_community_activity()
RETURNS TRIGGER AS $$
DECLARE
  v_uid UUID;
  v_xp INT;
  v_current_xp INT;
  v_final_xp INT;
  v_name TEXT;
  v_avatar TEXT;
BEGIN
  v_uid := COALESCE(NEW.user_id, OLD.user_id);
  v_xp := public.compute_user_xp(v_uid);

  -- Đọc xp hiện tại; nếu không tồn tại coi như 0
  SELECT COALESCE(xp, 0) INTO v_current_xp
  FROM public.user_progress WHERE user_id = v_uid;

  -- XP RULE: never decrease
  v_final_xp := GREATEST(COALESCE(v_current_xp, 0), v_xp);

  -- Upsert user_progress
  INSERT INTO public.user_progress (user_id, xp, updated_at)
  VALUES (v_uid, v_final_xp, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = GREATEST(public.user_progress.xp, EXCLUDED.xp),
    updated_at = NOW();

  -- Lấy display_name từ user_profiles
  SELECT COALESCE(display_name, 'Học viên'), avatar_url
  INTO v_name, v_avatar
  FROM public.user_profiles WHERE id = v_uid;

  -- Cập nhật leaderboard (GREATEST để không giảm)
  INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, updated_at)
  VALUES (v_uid, COALESCE(v_name, 'Học viên'), v_avatar, v_final_xp, NOW())
  ON CONFLICT (user_id) DO UPDATE SET
    xp = GREATEST(public.leaderboard.xp, EXCLUDED.xp),
    updated_at = EXCLUDED.updated_at;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 2. Sửa trigger exam: dùng GREATEST ─────────────────────────────────────
CREATE OR REPLACE FUNCTION public.sync_best_score_on_exam()
RETURNS TRIGGER AS $$
DECLARE
  v_best INT;
  v_xp INT;
  v_current_xp INT;
  v_final_xp INT;
  v_name TEXT;
  v_avatar TEXT;
BEGIN
  IF NEW.is_valid = true AND NEW.total > 0 THEN
    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
    INTO v_best
    FROM public.exam_results
    WHERE user_id = NEW.user_id AND is_valid = true AND total > 0;

    v_xp := public.compute_user_xp(NEW.user_id);

    SELECT COALESCE(xp, 0) INTO v_current_xp
    FROM public.user_progress WHERE user_id = NEW.user_id;

    v_final_xp := GREATEST(COALESCE(v_current_xp, 0), v_xp);

    SELECT COALESCE(display_name, 'Học viên'), avatar_url
    INTO v_name, v_avatar
    FROM public.user_profiles WHERE id = NEW.user_id;

    UPDATE public.user_progress
    SET best_score = GREATEST(COALESCE(best_score, 0), v_best),
        xp = v_final_xp,
        updated_at = NOW()
    WHERE user_id = NEW.user_id;

    INSERT INTO public.leaderboard (user_id, display_name, avatar_url, xp, best_score, level, updated_at)
    VALUES (
      NEW.user_id, COALESCE(v_name, 'Học viên'), v_avatar, v_final_xp, v_best,
      CASE WHEN v_best >= 80 THEN 'TOPIK II' WHEN v_best >= 60 THEN 'TOPIK I' ELSE 'Cơ bản' END,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      xp = GREATEST(public.leaderboard.xp, EXCLUDED.xp),
      best_score = GREATEST(public.leaderboard.best_score, EXCLUDED.best_score),
      level = EXCLUDED.level,
      updated_at = EXCLUDED.updated_at;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── 3. Sửa recalculate_all_xp: dùng GREATEST ────────────────────────────────
CREATE OR REPLACE FUNCTION public.recalculate_all_xp()
RETURNS VOID AS $$
DECLARE
  r RECORD;
  v_best_score INT;
  v_words_learned INT;
  v_streak INT;
  v_xp INT;
  v_display_name TEXT;
  v_avatar_url TEXT;
  v_is_vip BOOLEAN;
  v_vip_expires TIMESTAMPTZ;
BEGIN
  FOR r IN SELECT DISTINCT up.user_id FROM public.user_progress up LOOP
    SELECT display_name, avatar_url, is_vip, vip_expires_at
    INTO v_display_name, v_avatar_url, v_is_vip, v_vip_expires
    FROM public.user_profiles WHERE id = r.user_id;

    v_display_name := COALESCE(v_display_name, 'Học viên');

    SELECT COALESCE(MAX(ROUND((score::FLOAT / NULLIF(total,0)) * 100))::INT, 0)
    INTO v_best_score
    FROM public.exam_results
    WHERE user_id = r.user_id AND is_valid = true AND total > 0;

    v_words_learned := 0;
    BEGIN
      SELECT COUNT(*) INTO v_words_learned
      FROM public.flashcard_data
      WHERE user_id = r.user_id AND status IN ('review', 'mastered');
    EXCEPTION WHEN undefined_table OR undefined_column THEN
      v_words_learned := 0;
    END;

    IF v_words_learned = 0 THEN
      BEGIN
        SELECT COALESCE(
          (SELECT COUNT(*) FROM jsonb_each(flashcard_known) WHERE value = 'true'::jsonb),
          0
        )
        INTO v_words_learned
        FROM public.study_progress WHERE user_id = r.user_id;
      EXCEPTION WHEN undefined_table OR undefined_column THEN
        v_words_learned := 0;
      END;
    END IF;

    SELECT COALESCE(streak_count, 0) INTO v_streak
    FROM public.user_progress WHERE user_id = r.user_id;

    v_xp := public.compute_user_xp(r.user_id);

    -- XP RULE: never decrease
    UPDATE public.user_progress
    SET xp = GREATEST(COALESCE(xp, 0), v_xp),
        best_score = GREATEST(COALESCE(best_score, 0), v_best_score),
        words_learned = GREATEST(COALESCE(words_learned, 0), v_words_learned),
        updated_at = NOW()
    WHERE user_id = r.user_id;

    INSERT INTO public.leaderboard (
      user_id, display_name, avatar_url, xp, streak, best_score,
      words_learned, level, is_vip, vip_expires_at, updated_at
    )
    VALUES (
      r.user_id,
      v_display_name,
      v_avatar_url,
      v_xp,
      v_streak,
      v_best_score,
      v_words_learned,
      CASE
        WHEN v_best_score >= 80 THEN 'TOPIK II'
        WHEN v_best_score >= 60 THEN 'TOPIK I'
        ELSE 'Cơ bản'
      END,
      COALESCE(v_is_vip, FALSE),
      v_vip_expires,
      NOW()
    )
    ON CONFLICT (user_id) DO UPDATE SET
      display_name = COALESCE(EXCLUDED.display_name, public.leaderboard.display_name),
      avatar_url = COALESCE(EXCLUDED.avatar_url, public.leaderboard.avatar_url),
      xp = GREATEST(public.leaderboard.xp, EXCLUDED.xp),
      streak = EXCLUDED.streak,
      best_score = GREATEST(public.leaderboard.best_score, EXCLUDED.best_score),
      words_learned = GREATEST(public.leaderboard.words_learned, EXCLUDED.words_learned),
      level = EXCLUDED.level,
      is_vip = EXCLUDED.is_vip,
      vip_expires_at = EXCLUDED.vip_expires_at,
      updated_at = EXCLUDED.updated_at;
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ─── DONE ─────────────────────────────────────────────────────────────────
-- Verify:
--   SELECT xp FROM public.user_progress WHERE user_id = 'your-uuid';
--   SELECT compute_user_xp('your-uuid');
--   -- Sau khi chạy migration này, XP chỉ có thể tăng.
