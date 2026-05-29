-- Migration: Extend eps_questions schema to fit real Đề 1/Đề 2 content
-- Date: 2026-05-30
--
-- Why: Đề 1, Đề 2 (static `src/data/eps_de1.ts`, `eps_de2.ts`) có các field
-- mà bảng `eps_questions` (migration 118) chưa có: content, option_images,
-- audio_script, audio_options, audio_hint, explanation, section, option_type.
-- Migration này thêm cột (idempotent, không động tới dữ liệu cũ) để có thể
-- seed Đề 1, Đề 2 vào DB mà không mất nội dung.

alter table public.eps_questions
  add column if not exists section       text,
  add column if not exists option_type   text,
  add column if not exists content       text,
  add column if not exists content_image text,
  add column if not exists option_images jsonb,
  add column if not exists audio_script  text,
  add column if not exists audio_options jsonb,
  add column if not exists audio_hint    text,
  add column if not exists explanation   text;

-- question_type ban đầu chỉ chấp nhận ('listening','reading','image').
-- Đề 1, 2 chia 2 section reading/listening, kèm option_type=text|image.
-- Giữ check cũ tương thích; section/option_type là source-of-truth cho UI mới.
-- (Không nới lỏng để tránh nhận giá trị lạ; admin form đã enum 3 giá trị.)

comment on column public.eps_questions.section       is 'reading | listening (đề EPS chia 2 phần)';
comment on column public.eps_questions.option_type   is 'text | image — đáp án là chữ hay 4 ảnh';
comment on column public.eps_questions.content       is 'Nội dung phụ tách khỏi prompt (đoạn văn, từ, hội thoại)';
comment on column public.eps_questions.content_image is 'Ảnh nội dung câu hỏi (ký hiệu, biểu đồ, vé...)';
comment on column public.eps_questions.option_images is 'jsonb 4 đường dẫn ảnh đáp án khi option_type=image';
comment on column public.eps_questions.audio_script  is 'Script tiếng Hàn để TTS đọc (fallback khi không có MP3)';
comment on column public.eps_questions.audio_options is 'jsonb 4 script TTS cho từng đáp án (định dạng 4-audio)';
comment on column public.eps_questions.audio_hint    is 'Gợi ý nội dung audio hiển thị sau khi nghe';
comment on column public.eps_questions.explanation   is 'Giải thích đáp án (hiện ở review mode)';
