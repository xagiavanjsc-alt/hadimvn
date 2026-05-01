-- =================================================================
-- EMAIL TRIGGERS & CRON JOBS — Hàn Quốc Ơi!
-- =================================================================
-- Cách dùng:
--   1. Deploy Edge Function send-email trước (xem supabase/functions/send-email/README.md)
--   2. Set 2 GUC config (chạy 1 lần):
--      SELECT set_config('app.supabase_url', 'https://<your-ref>.supabase.co', false);
--      SELECT set_config('app.internal_secret', '<INTERNAL_API_SECRET>', false);
--      (Thay <your-ref> và <INTERNAL_API_SECRET> theo env của bạn)
--
--   TỐT HƠN: dùng Supabase Vault để lưu secret an toàn:
--      SELECT vault.create_secret('https://<your-ref>.supabase.co', 'supabase_url');
--      SELECT vault.create_secret('<INTERNAL_API_SECRET>', 'internal_secret');
--
--   3. Chạy toàn bộ SQL này trong SQL Editor
--   4. Verify: gửi email test qua trigger (xem phần TEST ở cuối)
-- =================================================================

-- Bật extensions cần thiết
CREATE EXTENSION IF NOT EXISTS pg_net;
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- =================================================================
-- HELPER FUNCTION: gọi Edge Function send-email
-- =================================================================
CREATE OR REPLACE FUNCTION public.send_email(
  p_template text,
  p_to text,
  p_variables jsonb DEFAULT '{}'::jsonb
) RETURNS bigint
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_url text;
  v_secret text;
  v_request_id bigint;
BEGIN
  -- Lấy config từ Vault (nếu có) hoặc GUC
  BEGIN
    SELECT decrypted_secret INTO v_url FROM vault.decrypted_secrets WHERE name = 'supabase_url';
    SELECT decrypted_secret INTO v_secret FROM vault.decrypted_secrets WHERE name = 'internal_secret';
  EXCEPTION WHEN OTHERS THEN
    v_url := current_setting('app.supabase_url', true);
    v_secret := current_setting('app.internal_secret', true);
  END;

  IF v_url IS NULL OR v_secret IS NULL THEN
    RAISE WARNING 'send_email: missing config app.supabase_url or app.internal_secret';
    RETURN NULL;
  END IF;

  IF p_to IS NULL OR p_to = '' THEN
    RAISE WARNING 'send_email: missing "to" email';
    RETURN NULL;
  END IF;

  SELECT net.http_post(
    url := v_url || '/functions/v1/send-email',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'x-internal-secret', v_secret
    ),
    body := jsonb_build_object(
      'template', p_template,
      'to', p_to,
      'variables', p_variables
    )
  ) INTO v_request_id;

  RETURN v_request_id;
END;
$$;

-- =================================================================
-- 1. WELCOME EMAIL — khi user mới đăng ký
-- =================================================================
CREATE OR REPLACE FUNCTION public.trigger_welcome_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_name text;
BEGIN
  -- Chỉ gửi khi email đã confirmed
  IF NEW.email_confirmed_at IS NOT NULL AND (OLD.email_confirmed_at IS NULL OR OLD IS NULL) THEN
    v_name := COALESCE(
      NEW.raw_user_meta_data->>'display_name',
      split_part(NEW.email, '@', 1),
      'bạn'
    );

    PERFORM public.send_email(
      'welcome',
      NEW.email,
      jsonb_build_object('USER_NAME', v_name)
    );
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_welcome ON auth.users;
CREATE TRIGGER on_auth_user_welcome
AFTER INSERT OR UPDATE OF email_confirmed_at ON auth.users
FOR EACH ROW
EXECUTE FUNCTION public.trigger_welcome_email();

-- =================================================================
-- 2. VIP SUCCESS — khi có bản ghi vip_revenue_log mới
-- =================================================================
CREATE OR REPLACE FUNCTION public.trigger_vip_success_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  -- Lấy email + name từ user_profiles (fallback NEW.user_email)
  SELECT email, display_name INTO v_email, v_name
  FROM public.user_profiles WHERE id = NEW.user_id;

  v_email := COALESCE(v_email, NEW.user_email);
  v_name := COALESCE(v_name, NEW.user_name, 'bạn');

  IF v_email IS NULL THEN RETURN NEW; END IF;

  PERFORM public.send_email(
    'vip-success',
    v_email,
    jsonb_build_object(
      'USER_NAME', v_name,
      'PLAN_NAME', COALESCE(NEW.vip_type, 'VIP'),
      'AMOUNT', to_char(NEW.amount, 'FM999,999,999') || ' ' || COALESCE(NEW.currency, 'VND'),
      'PAYMENT_DATE', to_char(NEW.granted_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY HH24:MI'),
      'EXPIRES_AT', to_char(NEW.expires_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY')
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_vip_revenue_insert ON public.vip_revenue_log;
CREATE TRIGGER on_vip_revenue_insert
AFTER INSERT ON public.vip_revenue_log
FOR EACH ROW
EXECUTE FUNCTION public.trigger_vip_success_email();

-- =================================================================
-- 3. COUPON RECEIVED — khi user nhận coupon mới
-- =================================================================
CREATE OR REPLACE FUNCTION public.trigger_coupon_received_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
  v_name text;
  v_coupon record;
BEGIN
  SELECT email, display_name INTO v_email, v_name
  FROM public.user_profiles WHERE id = NEW.user_id;

  IF v_email IS NULL THEN RETURN NEW; END IF;

  SELECT code, discount_percent, valid_until INTO v_coupon
  FROM public.coupons WHERE id = NEW.coupon_id;

  PERFORM public.send_email(
    'coupon-received',
    v_email,
    jsonb_build_object(
      'USER_NAME', COALESCE(v_name, 'bạn'),
      'COUPON_CODE', COALESCE(v_coupon.code, NEW.coupon_id),
      'COUPON_DESCRIPTION', 'Bạn vừa nhận được mã giảm giá đặc biệt dành cho các gói VIP.',
      'DISCOUNT_VALUE', '-' || COALESCE(v_coupon.discount_percent, 0) || '%',
      'EXPIRES_AT', to_char(COALESCE(v_coupon.valid_until, now() + interval '30 days') AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY'),
      'APPLICABLE_PLANS', 'Tất cả gói VIP'
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_user_coupon_insert ON public.user_coupons;
CREATE TRIGGER on_user_coupon_insert
AFTER INSERT ON public.user_coupons
FOR EACH ROW
EXECUTE FUNCTION public.trigger_coupon_received_email();

-- =================================================================
-- 4. FEEDBACK REPLY — khi admin trả lời app_feedback
-- =================================================================
CREATE OR REPLACE FUNCTION public.trigger_feedback_reply_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
  v_name text;
BEGIN
  -- Chỉ gửi khi admin_note được cập nhật (trước đó là NULL)
  IF NEW.admin_note IS NULL OR NEW.admin_note = '' THEN RETURN NEW; END IF;
  IF OLD.admin_note IS NOT NULL AND OLD.admin_note = NEW.admin_note THEN RETURN NEW; END IF;

  v_email := COALESCE(NEW.user_email, (SELECT email FROM public.user_profiles WHERE id = NEW.user_id));
  v_name := COALESCE(NEW.user_name, (SELECT display_name FROM public.user_profiles WHERE id = NEW.user_id), 'bạn');

  IF v_email IS NULL THEN RETURN NEW; END IF;

  PERFORM public.send_email(
    'feedback-reply',
    v_email,
    jsonb_build_object(
      'USER_NAME', v_name,
      'FEEDBACK_DATE', to_char(NEW.created_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY'),
      'ORIGINAL_FEEDBACK', COALESCE(NEW.content, NEW.title, ''),
      'ADMIN_REPLY', NEW.admin_note
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_feedback_reply ON public.app_feedback;
CREATE TRIGGER on_feedback_reply
AFTER UPDATE OF admin_note ON public.app_feedback
FOR EACH ROW
EXECUTE FUNCTION public.trigger_feedback_reply_email();

-- =================================================================
-- 5. STREAK MILESTONE — khi streak đạt 7/30/100/365 ngày
-- =================================================================
CREATE OR REPLACE FUNCTION public.trigger_streak_milestone_email()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_email text;
  v_name text;
  v_milestone int;
  v_message text;
  v_xp int;
  v_badge text;
BEGIN
  IF NEW.streak_count IS NULL OR NEW.streak_count = COALESCE(OLD.streak_count, 0) THEN
    RETURN NEW;
  END IF;

  v_milestone := NEW.streak_count;
  IF v_milestone NOT IN (7, 14, 30, 60, 100, 200, 365, 500, 1000) THEN
    RETURN NEW;
  END IF;

  SELECT email, display_name INTO v_email, v_name
  FROM public.user_profiles WHERE id = NEW.user_id;

  IF v_email IS NULL THEN RETURN NEW; END IF;

  v_message := CASE v_milestone
    WHEN 7 THEN 'Một tuần liên tiếp — khởi đầu tuyệt vời! Giữ đà nhé.'
    WHEN 14 THEN 'Hai tuần rồi — thói quen đang hình thành rõ rệt.'
    WHEN 30 THEN 'Một tháng không nghỉ — bạn thực sự quyết tâm!'
    WHEN 60 THEN 'Hai tháng liên tiếp — đỉnh cao của sự kiên trì.'
    WHEN 100 THEN '100 ngày! Bạn đã trở thành huyền thoại của cộng đồng.'
    WHEN 200 THEN '200 ngày — không còn gì có thể cản bước bạn.'
    WHEN 365 THEN 'Trọn một năm! Chúc mừng chiến binh bất bại!'
    ELSE v_milestone || ' ngày — bạn là nguồn cảm hứng cho mọi người!'
  END;

  v_xp := v_milestone * 10;
  v_badge := CASE
    WHEN v_milestone >= 365 THEN 'Huyền thoại'
    WHEN v_milestone >= 100 THEN 'Chiến binh'
    WHEN v_milestone >= 30 THEN 'Kiên trì'
    ELSE 'Bắt đầu'
  END;

  PERFORM public.send_email(
    'streak-milestone',
    v_email,
    jsonb_build_object(
      'USER_NAME', COALESCE(v_name, 'bạn'),
      'MILESTONE', v_milestone,
      'MILESTONE_MESSAGE', v_message,
      'XP_REWARD', v_xp,
      'BADGE_NAME', v_badge
    )
  );

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_streak_milestone ON public.study_progress;
CREATE TRIGGER on_streak_milestone
AFTER UPDATE OF streak_count ON public.study_progress
FOR EACH ROW
EXECUTE FUNCTION public.trigger_streak_milestone_email();

-- =================================================================
-- 6. CRON: VIP EXPIRING — gửi 3 ngày trước khi hết hạn (daily 8am)
-- =================================================================
CREATE OR REPLACE FUNCTION public.cron_vip_expiring_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r record;
  v_days_left int;
BEGIN
  FOR r IN
    SELECT id, email, display_name, vip_expires_at
    FROM public.user_profiles
    WHERE is_vip = true
      AND vip_expires_at IS NOT NULL
      AND email IS NOT NULL
      AND vip_expires_at BETWEEN now() AND now() + interval '3 days'
  LOOP
    v_days_left := GREATEST(0, EXTRACT(DAY FROM r.vip_expires_at - now())::int);
    PERFORM public.send_email(
      'vip-expiring',
      r.email,
      jsonb_build_object(
        'USER_NAME', COALESCE(r.display_name, 'bạn'),
        'DAYS_LEFT', v_days_left,
        'EXPIRES_AT', to_char(r.vip_expires_at AT TIME ZONE 'Asia/Ho_Chi_Minh', 'DD/MM/YYYY')
      )
    );
  END LOOP;
END;
$$;

-- Chạy mỗi ngày lúc 8h sáng (VN time = 1h UTC)
SELECT cron.schedule(
  'email-vip-expiring-daily',
  '0 1 * * *',
  $$ SELECT public.cron_vip_expiring_emails(); $$
);

-- =================================================================
-- 7. CRON: STREAK WARNING — gửi 20h mỗi ngày nếu chưa học
-- =================================================================
CREATE OR REPLACE FUNCTION public.cron_streak_warning_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r record;
  v_hours_left int;
BEGIN
  -- Gửi cho user có streak >= 3 ngày, streak_last_date = hôm qua (chưa học hôm nay)
  FOR r IN
    SELECT sp.user_id, sp.streak_count, up.email, up.display_name
    FROM public.study_progress sp
    JOIN public.user_profiles up ON up.id = sp.user_id
    WHERE sp.streak_count >= 3
      AND sp.streak_last_date = (current_date AT TIME ZONE 'Asia/Ho_Chi_Minh' - interval '1 day')::date
      AND up.email IS NOT NULL
  LOOP
    v_hours_left := GREATEST(1, 24 - EXTRACT(HOUR FROM now() AT TIME ZONE 'Asia/Ho_Chi_Minh')::int);
    PERFORM public.send_email(
      'streak-warning',
      r.email,
      jsonb_build_object(
        'USER_NAME', COALESCE(r.display_name, 'bạn'),
        'STREAK_COUNT', r.streak_count,
        'HOURS_LEFT', v_hours_left
      )
    );
  END LOOP;
END;
$$;

-- Chạy mỗi ngày 20h VN (13h UTC)
SELECT cron.schedule(
  'email-streak-warning-daily',
  '0 13 * * *',
  $$ SELECT public.cron_streak_warning_emails(); $$
);

-- =================================================================
-- 8. CRON: WEEKLY SUMMARY — Chủ nhật 9h sáng
-- =================================================================
CREATE OR REPLACE FUNCTION public.cron_weekly_summary_emails()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  r record;
  v_study_time int;
  v_lessons int;
  v_rank int;
BEGIN
  FOR r IN
    SELECT up.id, up.email, up.display_name, lb.xp, lb.streak, lb.words_learned
    FROM public.user_profiles up
    LEFT JOIN public.leaderboard lb ON lb.user_id = up.id
    WHERE up.email IS NOT NULL
      AND lb.xp > 0
      AND lb.updated_at > now() - interval '7 days'
  LOOP
    SELECT COALESCE(SUM(study_time), 0), COALESCE(SUM(grammar_count), 0)
    INTO v_study_time, v_lessons
    FROM public.study_history
    WHERE user_id = r.id AND study_date > current_date - 7;

    SELECT COUNT(*) + 1 INTO v_rank
    FROM public.leaderboard WHERE xp > r.xp;

    PERFORM public.send_email(
      'weekly-summary',
      r.email,
      jsonb_build_object(
        'USER_NAME', COALESCE(r.display_name, 'bạn'),
        'WEEK_RANGE', to_char(current_date - 7, 'DD/MM') || ' - ' || to_char(current_date - 1, 'DD/MM'),
        'WORDS_LEARNED', COALESCE(r.words_learned, 0),
        'LESSONS_DONE', v_lessons,
        'STREAK_COUNT', COALESCE(r.streak, 0),
        'XP_EARNED', r.xp,
        'RANK', v_rank,
        'STUDY_TIME', (v_study_time / 60) || ' phút',
        'MOTIVATION_MESSAGE', 'Tuần mới đang đến — tiếp tục phát huy nhé! 화이팅!'
      )
    );
  END LOOP;
END;
$$;

-- Chủ nhật 9h sáng VN (2h UTC CN)
SELECT cron.schedule(
  'email-weekly-summary',
  '0 2 * * 0',
  $$ SELECT public.cron_weekly_summary_emails(); $$
);

-- =================================================================
-- TEST — gửi thử email tới email của bạn
-- =================================================================
-- Uncomment và thay 'ban@gmail.com' để test:
-- SELECT public.send_email(
--   'welcome',
--   'ban@gmail.com',
--   jsonb_build_object('USER_NAME', 'Test User')
-- );

-- =================================================================
-- KIỂM TRA CRON JOBS đã schedule
-- =================================================================
-- SELECT * FROM cron.job;
-- SELECT * FROM cron.job_run_details ORDER BY start_time DESC LIMIT 10;

-- =================================================================
-- DISABLE / XOÁ trigger khi cần
-- =================================================================
-- ALTER TABLE auth.users DISABLE TRIGGER on_auth_user_welcome;
-- SELECT cron.unschedule('email-vip-expiring-daily');
