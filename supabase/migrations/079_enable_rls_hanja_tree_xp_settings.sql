-- Migration 079: Enable RLS on hanja_tree_nodes and xp_settings

-- ═══════════════════════════════════════════════════════════════════════════════
-- hanja_tree_nodes
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.hanja_tree_nodes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Hanja tree nodes viewable by authenticated users" ON public.hanja_tree_nodes;
CREATE POLICY "Hanja tree nodes viewable by authenticated users"
ON public.hanja_tree_nodes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can insert hanja tree nodes" ON public.hanja_tree_nodes;
CREATE POLICY "Admins can insert hanja tree nodes"
ON public.hanja_tree_nodes FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

DROP POLICY IF EXISTS "Admins can update hanja tree nodes" ON public.hanja_tree_nodes;
CREATE POLICY "Admins can update hanja tree nodes"
ON public.hanja_tree_nodes FOR UPDATE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

DROP POLICY IF EXISTS "Admins can delete hanja tree nodes" ON public.hanja_tree_nodes;
CREATE POLICY "Admins can delete hanja tree nodes"
ON public.hanja_tree_nodes FOR DELETE
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);

-- ═══════════════════════════════════════════════════════════════════════════════
-- xp_settings
-- ═══════════════════════════════════════════════════════════════════════════════
ALTER TABLE public.xp_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "XP settings viewable by authenticated users" ON public.xp_settings;
CREATE POLICY "XP settings viewable by authenticated users"
ON public.xp_settings FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "Admins can manage xp settings" ON public.xp_settings;
CREATE POLICY "Admins can manage xp settings"
ON public.xp_settings FOR ALL
TO authenticated
USING (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
)
WITH CHECK (
  EXISTS (SELECT 1 FROM public.user_profiles WHERE id = auth.uid() AND is_admin = TRUE)
);
