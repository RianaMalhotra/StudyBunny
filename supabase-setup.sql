-- Run in Supabase SQL Editor before enabling StudyBunny accounts.
create table if not exists public.bunny_progress (
 user_id uuid primary key references auth.users(id) on delete cascade,
 sessions integer not null default 0 check (sessions >= 0),
 carrots integer not null default 0 check (carrots >= 0),
 minutes integer not null default 0 check (minutes >= 0),
 updated_at timestamptz not null default now()
);
alter table public.bunny_progress enable row level security;
create policy "Users can read own progress" on public.bunny_progress for select to authenticated using ((select auth.uid()) = user_id);
create policy "Users can insert own progress" on public.bunny_progress for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "Users can update own progress" on public.bunny_progress for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
