-- ─── 033: Update guest_view_limit from 3 to 15 ────────────────────────────────
-- Web mới, cho khách xem nhiều bài hơn để thu hút người dùng

UPDATE public.community_settings
SET guest_view_limit = 15
WHERE id = 'global' AND guest_view_limit = 3;
