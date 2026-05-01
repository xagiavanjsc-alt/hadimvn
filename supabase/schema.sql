-- =====================================================
-- Han Quoc Oi - Supabase Database Schema
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- User Profiles
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    email TEXT UNIQUE,
    avatar_url TEXT,
    is_vip BOOLEAN DEFAULT FALSE,
    vip_type TEXT DEFAULT 'none', -- 'none', 'month', 'year'
    vip_expires_at TIMESTAMP WITH TIME ZONE,
    is_admin BOOLEAN DEFAULT FALSE,
    is_banned BOOLEAN DEFAULT FALSE,
    ban_reason TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_profiles (drop if exists to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.user_profiles;

CREATE POLICY "Users can view own profile"
    ON public.user_profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON public.user_profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
    ON public.user_profiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- Admin can view all profiles
CREATE POLICY "Admins can view all profiles"
    ON public.user_profiles FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- Study Progress
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    streak_count INTEGER DEFAULT 0,
    streak_last_date DATE,
    eps_answers JSONB DEFAULT '{}',
    flashcard_known JSONB DEFAULT '{}',
    hangul_known JSONB DEFAULT '{}',
    quiz_history JSONB DEFAULT '[]',
    news_lessons JSONB DEFAULT '[]',
    pdf_exports_count INTEGER DEFAULT 0,
    pdf_exports_month TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.study_progress ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own study progress" ON public.study_progress;
DROP POLICY IF EXISTS "Users can update own study progress" ON public.study_progress;

CREATE POLICY "Users can view own study progress"
    ON public.study_progress FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own study progress"
    ON public.study_progress FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- Exam Results
-- =====================================================
CREATE TABLE IF NOT EXISTS public.exam_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    exam_type TEXT NOT NULL, -- 'topik1', 'topik2', 'eps'
    score INTEGER NOT NULL,
    total INTEGER NOT NULL,
    time_used INTEGER, -- in seconds
    correct_ids UUID[] DEFAULT '{}',
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.exam_results ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own exam results" ON public.exam_results;
DROP POLICY IF EXISTS "Users can insert own exam results" ON public.exam_results;

CREATE POLICY "Users can view own exam results"
    ON public.exam_results FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own exam results"
    ON public.exam_results FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- Leaderboard
-- =====================================================
CREATE TABLE IF NOT EXISTS public.leaderboard (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    xp INTEGER DEFAULT 0,
    streak INTEGER DEFAULT 0,
    best_score INTEGER DEFAULT 0,
    words_learned INTEGER DEFAULT 0,
    level TEXT DEFAULT 'beginner',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id)
);

ALTER TABLE public.leaderboard ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view leaderboard" ON public.leaderboard;
DROP POLICY IF EXISTS "Users can update own leaderboard entry" ON public.leaderboard;

CREATE POLICY "Everyone can view leaderboard"
    ON public.leaderboard FOR SELECT
    TO PUBLIC
    USING (TRUE);

CREATE POLICY "Users can update own leaderboard entry"
    ON public.leaderboard FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- VIP Revenue Log
-- =====================================================
CREATE TABLE IF NOT EXISTS public.vip_revenue_log (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    user_name TEXT,
    user_email TEXT,
    vip_type TEXT NOT NULL,
    amount INTEGER NOT NULL,
    granted_by UUID REFERENCES public.user_profiles(id),
    granted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE,
    note TEXT
);

ALTER TABLE public.vip_revenue_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view revenue log" ON public.vip_revenue_log;

CREATE POLICY "Admins can view revenue log"
    ON public.vip_revenue_log FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- Admin Settings
-- =====================================================
CREATE TABLE IF NOT EXISTS public.admin_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    apify_token TEXT DEFAULT '',
    ai_provider TEXT DEFAULT 'gemini',
    ai_api_key TEXT DEFAULT '',
    ai_model TEXT DEFAULT '',
    story_prompt JSONB DEFAULT '{}',
    maintenance_mode BOOLEAN DEFAULT FALSE,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default settings
INSERT INTO public.admin_settings (id) VALUES ('global') ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage settings" ON public.admin_settings;

CREATE POLICY "Admins can manage settings"
    ON public.admin_settings FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- Community Posts
-- =====================================================
CREATE TABLE IF NOT EXISTS public.community_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    type TEXT DEFAULT 'discussion', -- 'discussion', 'question', 'share'
    likes INTEGER DEFAULT 0,
    views INTEGER DEFAULT 0,
    is_pinned BOOLEAN DEFAULT FALSE,
    is_locked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can create posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can update own posts" ON public.community_posts;
DROP POLICY IF EXISTS "Users can delete own posts" ON public.community_posts;

CREATE POLICY "Everyone can view posts"
    ON public.community_posts FOR SELECT
    TO PUBLIC
    USING (TRUE);

CREATE POLICY "Users can create posts"
    ON public.community_posts FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own posts"
    ON public.community_posts FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own posts"
    ON public.community_posts FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Comments
-- =====================================================
CREATE TABLE IF NOT EXISTS public.comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    post_id UUID NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    parent_id UUID REFERENCES public.comments(id) ON DELETE CASCADE,
    likes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view comments" ON public.comments;
DROP POLICY IF EXISTS "Users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments" ON public.comments;
DROP POLICY IF EXISTS "Users can delete own comments" ON public.comments;

CREATE POLICY "Everyone can view comments"
    ON public.comments FOR SELECT
    TO PUBLIC
    USING (TRUE);

CREATE POLICY "Users can create comments"
    ON public.comments FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own comments"
    ON public.comments FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own comments"
    ON public.comments FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Notifications
-- =====================================================
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    content TEXT,
    type TEXT DEFAULT 'general', -- 'general', 'vip', 'system', 'reminder'
    is_read BOOLEAN DEFAULT FALSE,
    link TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can update own notifications" ON public.notifications;
DROP POLICY IF EXISTS "Users can delete own notifications" ON public.notifications;

CREATE POLICY "Users can view own notifications"
    ON public.notifications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own notifications"
    ON public.notifications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own notifications"
    ON public.notifications FOR DELETE
    USING (auth.uid() = user_id);

-- =====================================================
-- Zalo OAuth State
-- =====================================================
CREATE TABLE IF NOT EXISTS public.zalo_oauth_state (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    state TEXT NOT NULL UNIQUE,
    code_verifier TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    expires_at TIMESTAMP WITH TIME ZONE DEFAULT (NOW() + INTERVAL '10 minutes')
);

ALTER TABLE public.zalo_oauth_state ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- Zalo Reminders
-- =====================================================
CREATE TABLE IF NOT EXISTS public.zalo_reminders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    zalo_id TEXT NOT NULL,
    reminder_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_sent_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.zalo_reminders ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own reminders" ON public.zalo_reminders;
DROP POLICY IF EXISTS "Users can manage own reminders" ON public.zalo_reminders;

CREATE POLICY "Users can view own reminders"
    ON public.zalo_reminders FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own reminders"
    ON public.zalo_reminders FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- Daily Vocab
-- =====================================================
CREATE TABLE IF NOT EXISTS public.daily_vocab (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    date DATE UNIQUE DEFAULT CURRENT_DATE,
    word_ids UUID[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.daily_vocab ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view daily vocab" ON public.daily_vocab;

CREATE POLICY "Everyone can view daily vocab"
    ON public.daily_vocab FOR SELECT
    TO PUBLIC
    USING (TRUE);

-- =====================================================
-- User Daily Vocab Progress
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_daily_vocab (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    word_ids UUID[] DEFAULT '{}',
    completed BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

ALTER TABLE public.user_daily_vocab ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own daily vocab progress" ON public.user_daily_vocab;
DROP POLICY IF EXISTS "Users can update own daily vocab progress" ON public.user_daily_vocab;

CREATE POLICY "Users can view own daily vocab progress"
    ON public.user_daily_vocab FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own daily vocab progress"
    ON public.user_daily_vocab FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- Study History
-- =====================================================
CREATE TABLE IF NOT EXISTS public.study_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    study_date DATE NOT NULL DEFAULT CURRENT_DATE,
    study_time INTEGER DEFAULT 0, -- in minutes
    vocab_count INTEGER DEFAULT 0,
    grammar_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, study_date)
);

ALTER TABLE public.study_history ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own study history" ON public.study_history;
DROP POLICY IF EXISTS "Users can update own study history" ON public.study_history;

CREATE POLICY "Users can view own study history"
    ON public.study_history FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can update own study history"
    ON public.study_history FOR ALL
    USING (auth.uid() = user_id);

-- =====================================================
-- Bug Reports
-- =====================================================
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    screenshot_url TEXT,
    status TEXT DEFAULT 'open', -- 'open', 'in_progress', 'resolved', 'closed'
    priority TEXT DEFAULT 'medium', -- 'low', 'medium', 'high', 'critical'
    assigned_to UUID REFERENCES public.user_profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Users can create bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Admins can view all bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Admins can update bug reports" ON public.bug_reports;

CREATE POLICY "Users can view own bug reports"
    ON public.bug_reports FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create bug reports"
    ON public.bug_reports FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all bug reports"
    ON public.bug_reports FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

CREATE POLICY "Admins can update bug reports"
    ON public.bug_reports FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- Feedback
-- =====================================================
CREATE TABLE IF NOT EXISTS public.feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    type TEXT NOT NULL, -- 'feature', 'bug', 'content', 'other'
    message TEXT NOT NULL,
    rating INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own feedback" ON public.feedback;
DROP POLICY IF EXISTS "Users can submit feedback" ON public.feedback;
DROP POLICY IF EXISTS "Admins can view all feedback" ON public.feedback;

CREATE POLICY "Users can view own feedback"
    ON public.feedback FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can submit feedback"
    ON public.feedback FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all feedback"
    ON public.feedback FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- Coupons
-- =====================================================
CREATE TABLE IF NOT EXISTS public.coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code TEXT UNIQUE NOT NULL,
    discount_percent INTEGER NOT NULL,
    max_uses INTEGER,
    used_count INTEGER DEFAULT 0,
    valid_from TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    valid_until TIMESTAMP WITH TIME ZONE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Everyone can view active coupons" ON public.coupons;
DROP POLICY IF EXISTS "Admins can manage coupons" ON public.coupons;

CREATE POLICY "Everyone can view active coupons"
    ON public.coupons FOR SELECT
    TO PUBLIC
    USING (is_active = TRUE);

CREATE POLICY "Admins can manage coupons"
    ON public.coupons FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles 
            WHERE id = auth.uid() AND is_admin = TRUE
        )
    );

-- =====================================================
-- User Coupons
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_coupons (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    coupon_id UUID NOT NULL REFERENCES public.coupons(id) ON DELETE CASCADE,
    used_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, coupon_id)
);

ALTER TABLE public.user_coupons ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own coupons" ON public.user_coupons;

CREATE POLICY "Users can view own coupons"
    ON public.user_coupons FOR SELECT
    USING (auth.uid() = user_id);

-- =====================================================
-- Functions & Triggers
-- =====================================================

-- Update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_user_profiles_updated_at
    BEFORE UPDATE ON public.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_study_progress_updated_at
    BEFORE UPDATE ON public.study_progress
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_community_posts_updated_at
    BEFORE UPDATE ON public.community_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_comments_updated_at
    BEFORE UPDATE ON public.comments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_zalo_reminders_updated_at
    BEFORE UPDATE ON public.zalo_reminders
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_bug_reports_updated_at
    BEFORE UPDATE ON public.bug_reports
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_admin_settings_updated_at
    BEFORE UPDATE ON public.admin_settings
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to handle new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, email)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email),
        NEW.email
    );
    
    INSERT INTO public.study_progress (user_id)
    VALUES (NEW.id);
    
    INSERT INTO public.leaderboard (user_id, display_name)
    VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger for new user signup
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- Indexes
-- =====================================================
CREATE INDEX idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX idx_user_profiles_is_vip ON public.user_profiles(is_vip);
CREATE INDEX idx_user_profiles_is_admin ON public.user_profiles(is_admin);
CREATE INDEX idx_study_progress_user_id ON public.study_progress(user_id);
CREATE INDEX idx_exam_results_user_id ON public.exam_results(user_id);
CREATE INDEX idx_exam_results_type ON public.exam_results(exam_type);
CREATE INDEX idx_leaderboard_xp ON public.leaderboard(xp DESC);
CREATE INDEX idx_community_posts_user_id ON public.community_posts(user_id);
CREATE INDEX idx_community_posts_created_at ON public.community_posts(created_at DESC);
CREATE INDEX idx_comments_post_id ON public.comments(post_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX idx_study_history_user_id ON public.study_history(user_id);
CREATE INDEX idx_daily_vocab_date ON public.daily_vocab(date);

-- =====================================================
-- Row Count Estimates (for better query planning)
-- =====================================================
ANALYZE public.user_profiles;
ANALYZE public.study_progress;
ANALYZE public.leaderboard;
