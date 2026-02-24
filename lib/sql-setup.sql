create extension if not exists pgcrypto;

create table if not exists public.registrations (
  id uuid primary key default gen_random_uuid(),
  full_name text not null,
  contact_number text not null,
  email text,
  church text not null,
  role text,
  has_vehicle boolean not null default false,
  plate_number text,
  confirmed_attendance boolean not null default false,
  created_at timestamptz not null default now()
);

alter table public.registrations
add column if not exists confirmed_attendance boolean not null default false;

alter table public.registrations
add column if not exists role text;

-- Duplicate prevention: same full name + contact number
create unique index if not exists registrations_name_contact_unique
on public.registrations (lower(full_name), contact_number);

-- Stronger duplicate prevention under peak load:
-- normalizes extra spaces/case in names and strips non-digits in contact numbers
create unique index if not exists registrations_name_contact_unique_normalized
on public.registrations (
  lower(regexp_replace(trim(full_name), '\s+', ' ', 'g')),
  regexp_replace(contact_number, '\D', '', 'g')
);

create table if not exists public.registration_settings (
  id integer primary key,
  enabled boolean not null default true,
  starts_at timestamptz,
  ends_at timestamptz,
  max_capacity integer
);

insert into public.registration_settings (id, enabled, starts_at, ends_at, max_capacity)
values (1, true, null, null, null)
on conflict (id) do nothing;

create table if not exists public.admin_users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  password_hash text not null,
  created_at timestamptz not null default now()
);

create or replace function public.verify_admin_login(input_email text, input_password text)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.admin_users
    where lower(email) = lower(trim(input_email))
      and password_hash = extensions.crypt(input_password, password_hash)
  );
$$;

create or replace function public.upsert_admin_user(input_email text, input_password text)
returns void
language sql
security definer
set search_path = public
as $$
  insert into public.admin_users (email, password_hash)
  values (
    lower(trim(input_email)),
    extensions.crypt(input_password, extensions.gen_salt('bf', 12))
  )
  on conflict (email) do update
  set password_hash = excluded.password_hash;
$$;

-- Create/rotate an admin account:
-- select public.upsert_admin_user('admin@example.com', 'ReplaceWithStrongPassword');
