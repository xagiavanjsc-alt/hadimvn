-- Create hanja_flashcards table
CREATE TABLE IF NOT EXISTS public.hanja_flashcards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  word TEXT NOT NULL,
  hanja TEXT NOT NULL,
  reading TEXT,
  meaning TEXT NOT NULL,
  example TEXT,
  category TEXT,
  mastered BOOLEAN DEFAULT FALSE,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.hanja_flashcards ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own flashcards"
  ON public.hanja_flashcards FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own flashcards"
  ON public.hanja_flashcards FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own flashcards"
  ON public.hanja_flashcards FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own flashcards"
  ON public.hanja_flashcards FOR DELETE
  USING (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_hanja_flashcards_user_id ON public.hanja_flashcards(user_id);
CREATE INDEX IF NOT EXISTS idx_hanja_flashcards_word ON public.hanja_flashcards(word);

-- Create trigger for updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER hanja_flashcards_updated_at
  BEFORE UPDATE ON public.hanja_flashcards
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
