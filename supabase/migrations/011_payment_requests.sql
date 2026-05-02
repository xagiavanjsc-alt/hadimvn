-- Create vip_payment_requests table for handling payment submissions
CREATE TABLE IF NOT EXISTS public.vip_payment_requests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES public.user_profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    amount INTEGER NOT NULL,
    billing_cycle TEXT NOT NULL CHECK (billing_cycle IN ('monthly', 'yearly')),
    proof_url TEXT NOT NULL,
    note TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on user_id for faster lookups
CREATE INDEX IF NOT EXISTS idx_vip_payment_requests_user_id ON public.vip_payment_requests(user_id);

-- Create index on status for filtering pending requests
CREATE INDEX IF NOT EXISTS idx_vip_payment_requests_status ON public.vip_payment_requests(status);

-- Create index on created_at for sorting
CREATE INDEX IF NOT EXISTS idx_vip_payment_requests_created_at ON public.vip_payment_requests(created_at DESC);

-- Enable Row Level Security
ALTER TABLE public.vip_payment_requests ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own payment requests
CREATE POLICY "Users can view own payment requests"
ON public.vip_payment_requests FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own payment requests
CREATE POLICY "Users can insert own payment requests"
ON public.vip_payment_requests FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Admins can view all payment requests
CREATE POLICY "Admins can view all payment requests"
ON public.vip_payment_requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Policy: Admins can update payment requests (approve/reject)
CREATE POLICY "Admins can update payment requests"
ON public.vip_payment_requests FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM public.user_profiles
        WHERE id = auth.uid() AND is_admin = true
    )
);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_payment_requests_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to automatically update updated_at
CREATE TRIGGER payment_requests_updated_at
BEFORE UPDATE ON public.vip_payment_requests
FOR EACH ROW
EXECUTE FUNCTION public.update_payment_requests_updated_at();
