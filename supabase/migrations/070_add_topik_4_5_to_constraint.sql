-- Migration 070: Add TOPIK IV and TOPIK V to grammar_patterns.topik_level check constraint

ALTER TABLE public.grammar_patterns DROP CONSTRAINT IF EXISTS grammar_patterns_topik_level_check;

ALTER TABLE public.grammar_patterns ADD CONSTRAINT grammar_patterns_topik_level_check
CHECK (topik_level IN ('TOPIK I', 'TOPIK II', 'TOPIK III', 'TOPIK IV', 'TOPIK V', 'TOPIK VI'));
