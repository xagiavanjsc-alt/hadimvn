-- Add spaced repetition fields to hanja_flashcards
ALTER TABLE public.hanja_flashcards
ADD COLUMN IF NOT EXISTS next_review_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS ease_factor FLOAT DEFAULT 2.5,
ADD COLUMN IF NOT EXISTS interval_days INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS last_reviewed_at TIMESTAMP WITH TIME ZONE;

-- Create index for next review queries
CREATE INDEX IF NOT EXISTS idx_hanja_flashcards_next_review ON public.hanja_flashcards(user_id, next_review_at);

-- Create function to calculate next review date based on SM-2 algorithm
CREATE OR REPLACE FUNCTION public.calculate_next_review(
  p_ease_factor FLOAT,
  p_interval_days INTEGER,
  p_quality INTEGER -- 0-5: 0=complete blackout, 5=perfect response
)
RETURNS TABLE(next_review_at TIMESTAMP WITH TIME ZONE, new_ease_factor FLOAT, new_interval_days INTEGER) AS $$
DECLARE
  v_new_ease_factor FLOAT;
  v_new_interval_days INTEGER;
BEGIN
  -- Calculate new ease factor
  v_new_ease_factor := p_ease_factor + (0.1 - (5 - p_quality) * (0.08 + (5 - p_quality) * 0.02));
  IF v_new_ease_factor < 1.3 THEN
    v_new_ease_factor := 1.3;
  END IF;
  
  -- Calculate new interval
  IF p_quality < 3 THEN
    v_new_interval_days := 1; -- Reset to 1 day if quality is poor
  ELSE
    v_new_interval_days := LEAST(
      ROUND(p_interval_days * v_new_ease_factor),
      365 -- Max 1 year
    );
    IF v_new_interval_days = p_interval_days THEN
      v_new_interval_days := p_interval_days + 1;
    END IF;
  END IF;
  
  RETURN QUERY SELECT
    NOW() + (v_new_interval_days || ' days')::INTERVAL AS next_review_at,
    v_new_ease_factor AS new_ease_factor,
    v_new_interval_days AS new_interval_days;
END;
$$ LANGUAGE plpgsql;

-- Create RPC function to update flashcard after review
CREATE OR REPLACE FUNCTION public.update_flashcard_review(
  p_flashcard_id UUID,
  p_quality INTEGER -- 0-5 rating
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_flashcard RECORD;
  v_next_review TIMESTAMP WITH TIME ZONE;
  v_new_ease_factor FLOAT;
  v_new_interval_days INTEGER;
BEGIN
  -- Get current flashcard
  SELECT * INTO v_flashcard
  FROM hanja_flashcards
  WHERE id = p_flashcard_id AND user_id = auth.uid();
  
  IF v_flashcard.id IS NULL THEN
    RETURN jsonb_build_object('error', 'Flashcard not found');
  END IF;
  
  -- Calculate next review
  SELECT * INTO v_next_review, v_new_ease_factor, v_new_interval_days
  FROM calculate_next_review(
    COALESCE(v_flashcard.ease_factor, 2.5),
    COALESCE(v_flashcard.interval_days, 0),
    p_quality
  );
  
  -- Update flashcard
  UPDATE hanja_flashcards
  SET
    review_count = review_count + 1,
    ease_factor = v_new_ease_factor,
    interval_days = v_new_interval_days,
    next_review_at = v_next_review,
    last_reviewed_at = NOW(),
    mastered = p_quality >= 4
  WHERE id = p_flashcard_id;
  
  RETURN jsonb_build_object(
    'success', TRUE,
    'next_review_at', v_next_review,
    'new_ease_factor', v_new_ease_factor,
    'new_interval_days', v_new_interval_days
  );
END;
$$;

GRANT EXECUTE ON FUNCTION public.update_flashcard_review(UUID, INTEGER) TO authenticated;
