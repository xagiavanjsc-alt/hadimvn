-- Migration 104: Tạo bảng hanja_tree_nodes cho trang /hanja-tree

CREATE TABLE IF NOT EXISTS public.hanja_tree_nodes (
  id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  korean           TEXT NOT NULL,
  hanja            TEXT NOT NULL,
  vietnamese       TEXT NOT NULL,
  pronunciation    TEXT,
  meaning_detail   TEXT,
  examples         JSONB  DEFAULT '[]'::jsonb,
  related_words    JSONB  DEFAULT '[]'::jsonb,
  memory_tip       TEXT,
  hanja_chars      JSONB  DEFAULT '[]'::jsonb,
  root_char        TEXT   NOT NULL,
  root_meaning     TEXT,
  level            INTEGER DEFAULT 1,
  category         TEXT    DEFAULT 'Khác',
  difficulty       INTEGER DEFAULT 2 CHECK (difficulty IN (1, 2, 3)),
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  updated_at       TIMESTAMPTZ DEFAULT NOW()
);

-- Index tìm kiếm theo gốc Hán
CREATE INDEX IF NOT EXISTS idx_hanja_tree_root_char ON public.hanja_tree_nodes(root_char);
CREATE INDEX IF NOT EXISTS idx_hanja_tree_korean    ON public.hanja_tree_nodes(korean);

-- RLS
ALTER TABLE public.hanja_tree_nodes ENABLE ROW LEVEL SECURITY;

-- Mọi người đều đọc được
DROP POLICY IF EXISTS "public_read_hanja_tree" ON public.hanja_tree_nodes;
CREATE POLICY "public_read_hanja_tree" ON public.hanja_tree_nodes
  FOR SELECT USING (true);

-- Admin CRUD
DROP POLICY IF EXISTS "admin_insert_hanja_tree" ON public.hanja_tree_nodes;
CREATE POLICY "admin_insert_hanja_tree" ON public.hanja_tree_nodes
  FOR INSERT TO authenticated
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_update_hanja_tree" ON public.hanja_tree_nodes;
CREATE POLICY "admin_update_hanja_tree" ON public.hanja_tree_nodes
  FOR UPDATE TO authenticated
  USING (public.is_admin_user(auth.uid()))
  WITH CHECK (public.is_admin_user(auth.uid()));

DROP POLICY IF EXISTS "admin_delete_hanja_tree" ON public.hanja_tree_nodes;
CREATE POLICY "admin_delete_hanja_tree" ON public.hanja_tree_nodes
  FOR DELETE TO authenticated
  USING (public.is_admin_user(auth.uid()));
