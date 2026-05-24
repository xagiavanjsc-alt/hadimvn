-- =============================================================================
-- BACKUP SCRIPT: Dump orphan Supabase data → SQL migration files
-- Created: 2026-05-25
-- Purpose: Data of Seoul 1A, 1B (and possibly Hanja, others) was added directly
--          via Supabase Dashboard UI, NOT through migrations. This script
--          recovers that data into versionable SQL files.
-- =============================================================================
--
-- ⚠️  CHẠY SCRIPT NÀY NGAY (15 phút). NẾU SUPABASE PROJECT BỊ XÓA/PAUSE,
--    DATA SẼ MẤT VĨNH VIỄN.
--
-- =============================================================================
-- HƯỚNG DẪN CHẠY
-- =============================================================================
--
-- CÁCH 1 (DỄ NHẤT) — Dùng Supabase Dashboard:
--
--   1. Mở https://supabase.com/dashboard/project/_/sql/new
--   2. Copy từng query Phần A bên dưới → paste → Run
--   3. Click "Download CSV" cho mỗi result
--   4. Lưu vào folder: C:\Users\hi\Desktop\code\han\backup\2026-05-25\
--
-- CÁCH 2 (CHUẨN HƠN) — Dùng pg_dump:
--
--   1. Vào Supabase → Project Settings → Database → Connection string
--   2. Copy connection string (loại: Session pooler hoặc Direct connection)
--   3. Chạy trong PowerShell/Git Bash:
--
--      pg_dump "postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:5432/postgres" \
--        --data-only \
--        --schema=public \
--        --inserts \
--        --no-owner --no-privileges \
--        > backup-2026-05-25-full.sql
--
--   4. File backup-2026-05-25-full.sql chứa toàn bộ data → push GitHub
--
-- CÁCH 3 (NẾU CÓ Supabase CLI):
--
--      supabase db dump --data-only -f backup/2026-05-25-data.sql
--
-- =============================================================================
-- PHẦN A: LIỆT KÊ TABLES + ROW COUNT (chạy trước để biết có gì)
-- =============================================================================

-- A.1. Liệt kê tất cả table trong schema public + số row
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname || '.' || tablename)) AS size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname || '.' || tablename) DESC;

-- A.2. Đếm row của từng table có dấu hiệu là content
-- Chạy lần lượt, ghi nhớ table nào CÓ row > 0
SELECT 'seoul_lessons' AS tbl, COUNT(*) FROM seoul_lessons;
SELECT 'seoul_vocab' AS tbl, COUNT(*) FROM seoul_vocab;
SELECT 'seoul_grammar' AS tbl, COUNT(*) FROM seoul_grammar;
SELECT 'eps_lessons' AS tbl, COUNT(*) FROM eps_lessons;
SELECT 'eps_vocab' AS tbl, COUNT(*) FROM eps_vocab;
SELECT 'eps_exams' AS tbl, COUNT(*) FROM eps_exams;
SELECT 'eps_exam_questions' AS tbl, COUNT(*) FROM eps_exam_questions;
SELECT 'hanja_entries' AS tbl, COUNT(*) FROM hanja_entries;
SELECT 'hanja_vocab' AS tbl, COUNT(*) FROM hanja_vocab;
SELECT 'hanja_stories' AS tbl, COUNT(*) FROM hanja_stories;
SELECT 'hanja_pro' AS tbl, COUNT(*) FROM hanja_pro;
SELECT 'grammar_patterns' AS tbl, COUNT(*) FROM grammar_patterns;
SELECT 'topik_grammar' AS tbl, COUNT(*) FROM topik_grammar;
SELECT 'topik_vocab' AS tbl, COUNT(*) FROM topik_vocab;
SELECT 'topik_exam_questions' AS tbl, COUNT(*) FROM topik_exam_questions;
SELECT 'melon_songs' AS tbl, COUNT(*) FROM melon_songs;
SELECT 'naver_kin_articles' AS tbl, COUNT(*) FROM naver_kin_articles;

-- ⚠️ Nếu query nào báo "relation does not exist" → bỏ qua, table không tồn tại.
-- Note: Table names trên là dự đoán. Check tên thật bằng A.1.

-- =============================================================================
-- PHẦN B: EXPORT từng table thành INSERT statement
-- =============================================================================
-- Với mỗi table có row > 0, chạy query bên dưới → copy result → save vào file
-- Format: supabase/migrations/120_seed_{table}_2026_05_25.sql

-- B.1. Seoul lessons (nếu có)
-- Đổi <TABLE_NAME> thành tên thật
SELECT 'INSERT INTO seoul_lessons VALUES (' ||
  quote_nullable(id) || ', ' ||
  quote_nullable(book) || ', ' ||
  quote_nullable(lesson_number) || ', ' ||
  quote_nullable(title) || ', ' ||
  quote_nullable(content) ||
  ');' AS sql_statement
FROM seoul_lessons
ORDER BY book, lesson_number;

-- B.2. Cách generic hơn — dùng pg_dump là tốt nhất
-- Trong SQL Editor không export trực tiếp được, nên DÙNG CÁCH 2 (pg_dump) cho data lớn.

-- =============================================================================
-- PHẦN C: TEMPLATE migration file cho data orphan
-- =============================================================================
-- Sau khi có data, tạo file: supabase/migrations/120_seed_seoul_1a_1b.sql
-- với format:
--
-- -- Migration 120: Seed Seoul 1A + 1B lessons
-- -- Source: data was added via Supabase Dashboard before 2026-05-25
-- -- This migration backs it up for version control
--
-- INSERT INTO seoul_lessons (id, book, lesson_number, ...) VALUES
--   (1, '1A', 1, ...),
--   (2, '1A', 2, ...),
--   ...
-- ON CONFLICT (id) DO NOTHING;
--
-- Mỗi loại data 1 file riêng:
--   120_seed_seoul_1a_1b_lessons.sql
--   121_seed_seoul_1a_1b_vocab.sql
--   122_seed_hanja_phan1_2_3.sql
--   123_seed_eps_de1_2025.sql
--   124_seed_eps_de2_2025.sql
--   ...

-- =============================================================================
-- PHẦN D: VERIFY backup
-- =============================================================================
-- Sau khi tạo migration files, verify bằng cách:
--
-- 1. So sánh row count: chạy lại A.2, ghi số → so với INSERT count trong .sql
-- 2. Spot-check: chọn 5 row ngẫu nhiên, đối chiếu với migration
-- 3. (Optional) Restore vào DB staging — verify INSERT chạy được

-- =============================================================================
-- PHẦN E: COMMIT lên GitHub (data tài sản, không được mất)
-- =============================================================================
-- Sau khi có migration files trong supabase/migrations/120_*.sql:
--
--   cd "C:\Users\hi\Desktop\code\han"
--   git add supabase/migrations/120_*.sql supabase/migrations/121_*.sql ...
--   git add scripts/01-backup-supabase-orphan-data.sql
--   git commit -m "db: backup orphan Supabase data (Seoul 1A-1B, Hanja, etc.) to migrations"
--   git push
--
-- Bây giờ data có 3 nơi an toàn: Supabase + máy local + GitHub.
