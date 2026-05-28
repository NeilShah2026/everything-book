-- ============================================================
--  EverythingBook — Supabase schema
--  Run this once in your project's SQL Editor
--  (Supabase Dashboard → SQL Editor → New Query → Run)
-- ============================================================


-- ── tasks ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tasks (
  id               TEXT        PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title            TEXT        NOT NULL,
  category         TEXT        NOT NULL DEFAULT 'School',
  sub_category     TEXT,
  due_date         TEXT,                          -- stored as "YYYY-MM-DD"
  priority         TEXT        NOT NULL DEFAULT 'Medium',
  status           TEXT        NOT NULL DEFAULT 'Not Started',
  notes            TEXT        DEFAULT '',
  suggested_bucket TEXT        DEFAULT 'Later',
  milestones       JSONB       DEFAULT '[]'::jsonb,
  sort_order       INTEGER     DEFAULT 0,
  completed_at     TEXT,                          -- ISO timestamp string
  created_at       TEXT        NOT NULL,
  updated_at       TEXT        NOT NULL
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

-- Users can only see and modify their own tasks
CREATE POLICY "users_own_tasks" ON public.tasks
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS tasks_user_id_idx       ON public.tasks (user_id);
CREATE INDEX IF NOT EXISTS tasks_user_sort_idx     ON public.tasks (user_id, sort_order);
CREATE INDEX IF NOT EXISTS tasks_user_status_idx   ON public.tasks (user_id, status);


-- ── daily_sheets ───────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.daily_sheets (
  id               TEXT        PRIMARY KEY,
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date             TEXT        NOT NULL,          -- "YYYY-MM-DD"
  quick_notes      JSONB       DEFAULT '[]'::jsonb,
  random_thoughts  JSONB       DEFAULT '[]'::jsonb,
  reflection       TEXT        DEFAULT '',
  task_ids         JSONB       DEFAULT '[]'::jsonb,
  created_at       TEXT        NOT NULL,
  updated_at       TEXT        NOT NULL,
  UNIQUE (user_id, date)
);

ALTER TABLE public.daily_sheets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_sheets" ON public.daily_sheets
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS sheets_user_date_idx ON public.daily_sheets (user_id, date);


-- ── user_classes ───────────────────────────────────────────
-- Stores each user's list of school class names as a JSON array.
CREATE TABLE IF NOT EXISTS public.user_classes (
  user_id  UUID   PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  classes  JSONB  DEFAULT '[]'::jsonb
);

ALTER TABLE public.user_classes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_own_classes" ON public.user_classes
  FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
