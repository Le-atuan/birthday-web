create table public.admin_users (
  user_id uuid primary key references auth.users (id) on delete cascade,
  created_at timestamptz not null default now()
);

create table public.theme_settings (
  id text primary key default 'global' check (id = 'global'),
  active_config jsonb not null,
  draft_config jsonb not null,
  version integer not null default 1 check (version > 0),
  updated_by uuid references auth.users (id) on delete set null,
  updated_at timestamptz not null default now(),
  published_at timestamptz not null default now()
);

create index theme_settings_updated_by_idx
  on public.theme_settings (updated_by);

alter table public.admin_users enable row level security;
alter table public.theme_settings enable row level security;

grant usage on schema public to authenticated;
grant select on table public.admin_users to authenticated;
grant select, update on table public.theme_settings to authenticated;

create policy "Admins can read their own membership"
on public.admin_users
for select
to authenticated
using ((select auth.uid()) = user_id);

create policy "Admins can read theme settings"
on public.theme_settings
for select
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

create policy "Admins can update theme settings"
on public.theme_settings
for update
to authenticated
using (
  exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
)
with check (
  id = 'global'
  and updated_by = (select auth.uid())
  and exists (
    select 1
    from public.admin_users
    where admin_users.user_id = (select auth.uid())
  )
);

insert into public.theme_settings (id, active_config, draft_config)
values (
  'global',
  '{"primary":"#4F8FCB","secondary":"#A7D8F5","accent":"#D59A24","backgroundStart":"#EEF8FF","backgroundEnd":"#DCEFFC","surface":"#FFFFFF","foreground":"#183B56","mutedForeground":"#58758C","border":"#CFE8F7","danger":"#C93C52","radius":24,"shadowStrength":20,"glowStrength":32,"motion":"standard","gradientDirection":145}'::jsonb,
  '{"primary":"#4F8FCB","secondary":"#A7D8F5","accent":"#D59A24","backgroundStart":"#EEF8FF","backgroundEnd":"#DCEFFC","surface":"#FFFFFF","foreground":"#183B56","mutedForeground":"#58758C","border":"#CFE8F7","danger":"#C93C52","radius":24,"shadowStrength":20,"glowStrength":32,"motion":"standard","gradientDirection":145}'::jsonb
);
