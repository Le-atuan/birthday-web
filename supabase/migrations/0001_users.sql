create table users (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  dob date not null,
  email text not null,
  phone text not null,
  wish text,
  reminder_7d_sent_at timestamptz,
  reminder_1d_sent_at timestamptz,
  reminder_0d_sent_at timestamptz,
  created_at timestamptz not null default now()
);
