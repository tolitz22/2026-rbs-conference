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
