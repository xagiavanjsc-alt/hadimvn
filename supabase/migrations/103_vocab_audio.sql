-- Migration 103: Thêm audio_url vào hanja_vocab_entries + admin CRUD policies

-- ─── Thêm cột audio_url ───────────────────────────────────────────────────────
ALTER TABLE public.hanja_vocab_entries
  ADD COLUMN IF NOT EXISTS audio_url TEXT DEFAULT NULL;

COMMENT ON COLUMN public.hanja_vocab_entries.audio_url IS 'URL file âm thanh phát âm tiếng Hàn (lưu trong Supabase Storage)';

-- ─── RLS: admin có thể INSERT/UPDATE/DELETE vocab entries ─────────────────────
ALTER TABLE public.hanja_vocab_entries ENABLE ROW LEVEL SECURITY;

-- Mọi user đã đăng nhập có thể đọc (đã có từ trước)
DROP POLICY IF EXISTS "vocab_public_read" ON public.hanja_vocab_entries;
CREATE POLICY "vocab_public_read" ON public.hanja_vocab_entries
  FOR SELECT USING (true);

-- Admin CRUD
DROP POLICY IF EXISTS "admin_insert_vocab" ON public.hanja_vocab_entries;
CREATE POLICY "admin_insert_vocab" ON public.hanja_vocab_entries
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_update_vocab" ON public.hanja_vocab_entries;
CREATE POLICY "admin_update_vocab" ON public.hanja_vocab_entries
  FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_vocab" ON public.hanja_vocab_entries;
CREATE POLICY "admin_delete_vocab" ON public.hanja_vocab_entries
  FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));
