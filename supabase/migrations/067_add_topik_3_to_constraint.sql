-- Migration 067: Add TOPIK III to grammar_patterns.topik_level check constraint
-- Thêm TOPIK III vào constraint check của topik_level

-- Drop existing constraint
ALTER TABLE public.grammar_patterns DROP CONSTRAINT IF EXISTS grammar_patterns_topik_level_check;

-- Recreate constraint with TOPIK III included
ALTER TABLE public.grammar_patterns ADD CONSTRAINT grammar_patterns_topik_level_check
CHECK (topik_level IN ('TOPIK I', 'TOPIK II', 'TOPIK III'));

-- Update patterns #180-190 from TOPIK II to TOPIK III (these were inserted with TOPIK II in migration 066)
UPDATE public.grammar_patterns
SET topik_level = 'TOPIK III'
WHERE pattern IN (
  'N – (으)로 인해서',
  'V – 는 통에',
  'N – (으)로 말미암아',
  'N – (으)로 해서',
  'A/V – 느니만큼',
  'A/V – 느니만치',
  'A/V – (으)ㄴ/는 이상',
  'A/V – 기로서니',
  'A/V – 기에 망정이지',
  'V – (느)ㄴ 답시고',
  'A/V – (으)ㅁ으로써'
);
