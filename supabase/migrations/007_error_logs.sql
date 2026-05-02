-- ─── 007: Error logs table for admin notifications ───────────────────────────
-- Lưu lỗi từ client-side để admin có thể xem trong quản trị

CREATE TABLE IF NOT EXISTS public.error_logs (
    id BIGSERIAL PRIMARY KEY,
    user_id UUID REFERENCES public.user_profiles(id) ON DELETE SET NULL,
    error_type TEXT NOT NULL,          -- 'api', 'auth', 'database', 'runtime', 'network'
    message TEXT NOT NULL,
    stack_trace TEXT,
    page_url TEXT,
    user_agent TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_error_logs_type ON public.error_logs(error_type, created_at DESC);
CREATE INDEX idx_error_logs_resolved ON public.error_logs(is_resolved, created_at DESC);

ALTER TABLE public.error_logs ENABLE ROW LEVEL SECURITY;

-- Ai cũng có thể báo lỗi (client-side gửi)
DROP POLICY IF EXISTS "Anyone can insert errors" ON public.error_logs;
CREATE POLICY "Anyone can insert errors"
    ON public.error_logs FOR INSERT
    WITH CHECK (TRUE);

-- Chỉ admin/smod xem được
DROP POLICY IF EXISTS "Admins can view error logs" ON public.error_logs;
CREATE POLICY "Admins can view error logs"
    ON public.error_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND (is_admin = TRUE OR user_role = 'smod')
        )
    );

-- Admin/smod có thể đánh dấu đã xử lý
DROP POLICY IF EXISTS "Admins can update error logs" ON public.error_logs;
CREATE POLICY "Admins can update error logs"
    ON public.error_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.user_profiles
            WHERE id = auth.uid() AND (is_admin = TRUE OR user_role = 'smod')
        )
    );
