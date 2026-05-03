-- ─── Fix: column reference "rating_count" is ambiguous ─────────────────────
-- Bug: Trong migration 029, hàm update_post_rating() declare biến local
-- `rating_count INTEGER` cùng tên với cột `rating_count` của community_posts,
-- gây lỗi "column reference rating_count is ambiguous" khi UPDATE.
-- Fix: rename biến local thành v_rating_count, v_avg_rating.

CREATE OR REPLACE FUNCTION update_post_rating()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating DECIMAL(3,2);
  v_rating_count INTEGER;
BEGIN
  IF TG_OP = 'INSERT' OR TG_OP = 'UPDATE' THEN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*) INTO v_avg_rating, v_rating_count
    FROM public.community_ratings
    WHERE post_id = NEW.post_id AND status = 'approved';

    UPDATE public.community_posts
    SET rating_average = COALESCE(v_avg_rating, 0),
        rating_count = COALESCE(v_rating_count, 0)
    WHERE id = NEW.post_id;
  ELSIF TG_OP = 'DELETE' THEN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*) INTO v_avg_rating, v_rating_count
    FROM public.community_ratings
    WHERE post_id = OLD.post_id AND status = 'approved';

    UPDATE public.community_posts
    SET rating_average = COALESCE(v_avg_rating, 0),
        rating_count = COALESCE(v_rating_count, 0)
    WHERE id = OLD.post_id;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION update_post_rating_on_status()
RETURNS TRIGGER AS $$
DECLARE
  v_avg_rating DECIMAL(3,2);
  v_rating_count INTEGER;
BEGIN
  IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
    SELECT AVG(rating)::DECIMAL(3,2), COUNT(*) INTO v_avg_rating, v_rating_count
    FROM public.community_ratings
    WHERE post_id = NEW.post_id AND status = 'approved';

    UPDATE public.community_posts
    SET rating_average = COALESCE(v_avg_rating, 0),
        rating_count = COALESCE(v_rating_count, 0)
    WHERE id = NEW.post_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
