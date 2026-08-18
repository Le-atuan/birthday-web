alter table public.users
  add column if not exists timezone text not null default 'Asia/Ho_Chi_Minh';

create table if not exists public.birthday_invites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  birthday_year integer not null check (birthday_year between 1900 and 9999),
  token uuid not null default gen_random_uuid(),
  unlock_at timestamptz not null,
  created_at timestamptz not null default now(),
  unique (user_id, birthday_year),
  unique (token)
);

create index if not exists birthday_invites_unlock_at_idx
  on public.birthday_invites (unlock_at);

create table if not exists public.birthday_reminders (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.users(id) on delete cascade,
  invite_id uuid not null references public.birthday_invites(id) on delete cascade,
  birthday_year integer not null check (birthday_year between 1900 and 9999),
  reminder_type text not null check (reminder_type in ('teaser_2d', 'birthday_0d')),
  scheduled_for timestamptz not null,
  status text not null default 'pending' check (status in ('pending', 'scheduled', 'failed')),
  resend_email_id text,
  last_error text,
  attempt_count integer not null default 0 check (attempt_count >= 0),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, birthday_year, reminder_type)
);

create index if not exists birthday_reminders_status_scheduled_for_idx
  on public.birthday_reminders (status, scheduled_for);

alter table public.users enable row level security;
alter table public.birthday_invites enable row level security;
alter table public.birthday_reminders enable row level security;

revoke all on table public.birthday_invites from anon, authenticated;
revoke all on table public.birthday_reminders from anon, authenticated;
