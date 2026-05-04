-- ─── Table for tracking reward redemption requests ─────────────────────────────
-- This table tracks all redemption requests, especially for VIP rewards that require admin approval

CREATE TABLE IF NOT EXISTS public.reward_redemptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  reward_id TEXT NOT NULL,
  reward_title TEXT NOT NULL,
  reward_type TEXT NOT NULL, -- 'vip', 'discount', 'badge', 'feature'
  xp_cost INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
  admin_note TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  processed_at TIMESTAMPTZ,
  processed_by UUID REFERENCES auth.users(id)
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_user_id ON public.reward_redemptions(user_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON public.reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_created_at ON public.reward_redemptions(created_at DESC);

-- RLS Policies
ALTER TABLE public.reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Users can see their own redemption requests
CREATE POLICY "Users can view own redemptions"
  ON public.reward_redemptions FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

-- Users can create redemption requests
CREATE POLICY "Users can create redemptions"
  ON public.reward_redemptions FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

-- Admins can view all redemptions
CREATE POLICY "Admins can view all redemptions"
  ON public.reward_redemptions FOR SELECT
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.user_role = 'super_admin' OR user_profiles.user_role = 'smod' OR user_profiles.user_role = 'moderator')
  ));

-- Admins can update redemption status
CREATE POLICY "Admins can update redemptions"
  ON public.reward_redemptions FOR UPDATE
  TO authenticated
  USING (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.user_role = 'super_admin' OR user_profiles.user_role = 'smod')
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.user_profiles
    WHERE user_profiles.id = auth.uid()
    AND (user_profiles.user_role = 'super_admin' OR user_profiles.user_role = 'smod')
  ));

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_reward_redemption_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  IF NEW.status != OLD.status THEN
    NEW.processed_at = NOW();
    NEW.processed_by = auth.uid();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_update_reward_redemption_updated_at ON public.reward_redemptions;
CREATE TRIGGER trg_update_reward_redemption_updated_at
  BEFORE UPDATE ON public.reward_redemptions
  FOR EACH ROW EXECUTE FUNCTION public.update_reward_redemption_updated_at();

COMMENT ON TABLE public.reward_redemptions IS 'Tracks reward redemption requests, especially VIP rewards requiring admin approval';
COMMENT ON COLUMN public.reward_redemptions.status IS 'pending: waiting for approval, approved: reward granted, rejected: request denied';
