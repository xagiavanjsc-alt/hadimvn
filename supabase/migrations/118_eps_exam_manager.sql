-- Migration: EPS Exam Manager — Full CRUD tables + storage + RLS
-- Purpose: Let admin create/edit EPS exams, questions, upload audio/images.
-- Date: 2026-05-28

-- ── 1. Exams ─────────────────────────────────────────────────────────
create table if not exists public.eps_exams (
  id            uuid primary key default gen_random_uuid(),
  slug          text not null unique,
  title         text not null,
  year          int  not null,           -- e.g. 2025
  exam_no       int  not null,           -- e.g. 1, 2, 3
  description   text,
  total_questions int default 40,
  time_minutes  int default 40,           -- EPS listening + reading 40 min
  is_published  boolean default false,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

comment on table public.eps_exams is 'EPS-TOPIK real/mock exam papers';

-- ── 2. Questions ────────────────────────────────────────────────────
create table if not exists public.eps_questions (
  id              uuid primary key default gen_random_uuid(),
  exam_id         uuid not null references public.eps_exams(id) on delete cascade,
  order_no        int  not null,         -- 1..40
  question_type   text not null check (question_type in ('listening','reading','image')),
  question_text   text not null,
  question_vi     text,                  -- Vietnamese translation
  options         jsonb not null,        -- ["A. ...", "B. ...", "C. ...", "D. ..."]
  correct_answer  int  not null check (correct_answer between 1 and 4), -- 1=A, 2=B...
  audio_url       text,                  -- path in storage: eps-exams/audio/...
  image_url       text,                  -- path in storage: eps-exams/images/...
  image_alt       text,
  image_caption   text,
  difficulty      text default 'medium' check (difficulty in ('easy','medium','hard')),
  topic           text,                  -- e.g. 'greeting', 'transport', 'weather'
  created_at      timestamptz default now()
);

comment on table public.eps_questions is 'Individual questions inside an EPS exam';

-- Unique: one question number per exam
create unique index if not exists idx_eps_questions_exam_order
  on public.eps_questions(exam_id, order_no);

-- ── 3. Indexes ────────────────────────────────────────────────────
create index if not exists idx_eps_exams_year_no on public.eps_exams(year, exam_no);
create index if not exists idx_eps_questions_exam on public.eps_questions(exam_id);

-- ── 4. RLS ────────────────────────────────────────────────────────
alter table public.eps_exams    enable row level security;
alter table public.eps_questions enable row level security;

-- Everyone can view published exams + their questions
-- (Unpublished exams are hidden from normal users)
create policy "Published exams visible to public"
  on public.eps_exams
  for select to anon, authenticated
  using (is_published = true);

create policy "Exam questions visible to public"
  on public.eps_questions
  for select to anon, authenticated
  using (
    exists (
      select 1 from public.eps_exams e
      where e.id = eps_questions.exam_id and e.is_published = true
    )
  );

-- Admins can CRUD everything
create policy "Admin full access on exams"
  on public.eps_exams
  for all to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

create policy "Admin full access on questions"
  on public.eps_questions
  for all to authenticated
  using (public.is_admin_user(auth.uid()))
  with check (public.is_admin_user(auth.uid()));

-- ── 5. Updated_at trigger ─────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger trg_eps_exams_updated_at
  before update on public.eps_exams
  for each row execute function public.set_updated_at();

-- ── 6. Storage bucket for exam media ──────────────────────────────
insert into storage.buckets (id, name, public)
values ('eps-exams', 'eps-exams', true)
on conflict (id) do nothing;

-- RLS: anyone can read public media
create policy "Public read eps-exams"
  on storage.objects for select to anon, authenticated
  using (bucket_id = 'eps-exams');

-- Admin can insert (with check ensures new row satisfies condition)
create policy "Admin insert eps-exams"
  on storage.objects for insert to authenticated
  with check (bucket_id = 'eps-exams' and public.is_admin_user(auth.uid()));

-- Admin can update (using checks existing row, with check ensures new row)
create policy "Admin update eps-exams"
  on storage.objects for update to authenticated
  using (bucket_id = 'eps-exams' and public.is_admin_user(auth.uid()))
  with check (bucket_id = 'eps-exams' and public.is_admin_user(auth.uid()));

-- Admin can delete
create policy "Admin delete eps-exams"
  on storage.objects for delete to authenticated
  using (bucket_id = 'eps-exams' and public.is_admin_user(auth.uid()));
