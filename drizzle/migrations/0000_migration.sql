create table public.skill_unlocks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid(),
  skill_id text not null,
  payer_name text not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique (user_id, skill_id)
);
grant select, insert, update on public.skill_unlocks to authenticated;
grant all on public.skill_unlocks to service_role;
alter table public.skill_unlocks enable row level security;
create policy "own or admin read" on public.skill_unlocks for select to authenticated using (auth.uid() = user_id or public.has_role(auth.uid(),'admin'));
create policy "own request" on public.skill_unlocks for insert to authenticated with check (auth.uid() = user_id and status = 'pending');
create policy "admin approves" on public.skill_unlocks for update to authenticated using (public.has_role(auth.uid(),'admin'));
create or replace function public.is_admin() returns boolean language sql stable security definer set search_path=public as $$ select public.has_role(auth.uid(),'admin') $$;