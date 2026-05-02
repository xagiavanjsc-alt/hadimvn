-- =====================================================
-- Refactor study_progress - Split into normalized tables
-- Purpose: Fix data inconsistency, enable cross-module features
-- =====================================================

-- ─── 1. Create user_progress (unified XP, streak, level) ─────────────────────────────
CREATE TABLE IF NOT EXISTS public.user_progress (
    user_id UUID PRIMARY KEY REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    xp INTEGER DEFAULT 0,
    level TEXT DEFAULT 'beginner',
    streak_count INTEGER DEFAULT 0,
    streak_last_date DATE,
    total_study_time_seconds INTEGER DEFAULT 0,
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own user_progress" ON public.user_progress;
DROP POLICY IF EXISTS "Users can update own user_progress" ON public.user_progress;

CREATE POLICY "Users can view own user_progress"
    ON public.user_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own user_progress"
    ON public.user_progress FOR ALL
    USING (auth.uid() = user_id);

-- ─── 2. Create module_progress (progress per module: eps, seoul, hanja, melon, topik) ───
CREATE TABLE IF NOT EXISTS public.module_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    module_id TEXT NOT NULL, -- 'eps', 'seoul', 'hanja', 'melon', 'topik'
    progress_percent INTEGER DEFAULT 0,
    lessons_completed INTEGER DEFAULT 0,
    total_lessons INTEGER DEFAULT 0,
    last_studied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, module_id)
);

CREATE INDEX idx_module_progress_user ON public.module_progress(user_id);
CREATE INDEX idx_module_progress_module ON public.module_progress(module_id);

ALTER TABLE public.module_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own module_progress" ON public.module_progress;
DROP POLICY IF EXISTS "Users can update own module_progress" ON public.module_progress;

CREATE POLICY "Users can view own module_progress"
    ON public.module_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own module_progress"
    ON public.module_progress FOR ALL
    USING (auth.uid() = user_id);

-- ─── 3. Create flashcard_data (unified flashcard system) ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.flashcard_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    card_id TEXT NOT NULL, -- unique identifier for the card (word_id, lesson_id, etc.)
    module_id TEXT NOT NULL, -- 'eps', 'seoul', 'hanja', 'melon', 'topik'
    status TEXT DEFAULT 'new', -- 'new', 'learning', 'review', 'mastered'
    box INTEGER DEFAULT 0, -- Leitner box (0-5)
    next_review TIMESTAMP WITH TIME ZONE,
    review_count INTEGER DEFAULT 0,
    success_count INTEGER DEFAULT 0,
    last_reviewed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, card_id)
);

CREATE INDEX idx_flashcard_data_user ON public.flashcard_data(user_id);
CREATE INDEX idx_flashcard_data_module ON public.flashcard_data(module_id);
CREATE INDEX idx_flashcard_data_next_review ON public.flashcard_data(next_review);
CREATE INDEX idx_flashcard_data_status ON public.flashcard_data(status);

ALTER TABLE public.flashcard_data ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own flashcard_data" ON public.flashcard_data;
DROP POLICY IF EXISTS "Users can update own flashcard_data" ON public.flashcard_data;

CREATE POLICY "Users can view own flashcard_data"
    ON public.flashcard_data FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own flashcard_data"
    ON public.flashcard_data FOR ALL
    USING (auth.uid() = user_id);

-- ─── 4. Migrate existing data from study_progress ─────────────────────────────────────
-- Migrate to user_progress
INSERT INTO public.user_progress (user_id, xp, streak_count, streak_last_date, updated_at)
SELECT 
    user_id,
    0, -- XP will be recalculated by trigger
    streak_count,
    streak_last_date,
    updated_at
FROM public.study_progress
ON CONFLICT (user_id) DO NOTHING;

-- Migrate EPS progress to module_progress
INSERT INTO public.module_progress (user_id, module_id, lessons_completed, last_studied_at, updated_at)
SELECT 
    user_id,
    'eps',
    (SELECT COUNT(*) FROM jsonb_object_keys(eps_answers)) as lessons_completed,
    updated_at,
    updated_at
FROM public.study_progress
WHERE jsonb_object_keys(eps_answers) IS NOT NULL
ON CONFLICT (user_id, module_id) DO NOTHING;

-- Migrate flashcard data to flashcard_data (from flashcard_known)
INSERT INTO public.flashcard_data (user_id, card_id, module_id, status, created_at, updated_at)
SELECT 
    user_id,
    key as card_id,
    'hanja', -- default to hanja for now
    CASE WHEN value THEN 'mastered' ELSE 'new' END,
    updated_at,
    updated_at
FROM public.study_progress,
    jsonb_each_text(flashcard_known)
WHERE flashcard_known IS NOT NULL
ON CONFLICT (user_id, card_id) DO NOTHING;

-- ─── 5. Update leaderboard to use user_progress.xp ───────────────────────────────────
-- Create trigger to sync XP from user_progress to leaderboard
CREATE OR REPLACE FUNCTION public.sync_leaderboard_from_user_progress()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.leaderboard (user_id, display_name, xp, streak, updated_at)
    VALUES (
        NEW.user_id,
        (SELECT display_name FROM public.user_profiles WHERE id = NEW.user_id),
        NEW.xp,
        NEW.streak_count,
        NEW.updated_at
    )
    ON CONFLICT (user_id) 
    DO UPDATE SET
        xp = NEW.xp,
        streak = NEW.streak_count,
        updated_at = NEW.updated_at;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_sync_leaderboard ON public.user_progress;
CREATE TRIGGER trg_sync_leaderboard
    AFTER INSERT OR UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.sync_leaderboard_from_user_progress();

-- ─── DONE ───────────────────────────────────────────────────────────────────────────
-- Next steps:
-- 1. Update useStudySync hook to use new tables
-- 2. Update XP calculation to write to user_progress
-- 3. Create unified flashcard/exam components
