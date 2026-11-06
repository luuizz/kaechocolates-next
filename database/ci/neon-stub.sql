-- Simula o que o Neon Auth + Data API criam num projeto real, para que o CI
-- consiga testar as migrations num PostgreSQL comum. NÃO rode isso no Neon.
do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated') then create role authenticated nologin; end if;
  if not exists (select 1 from pg_roles where rolname = 'anonymous') then create role anonymous nologin; end if;
end;
$$;

create schema auth;
create function auth.user_id() returns text
language sql stable
as $$ select nullif(current_setting('request.jwt.claims', true)::json ->> 'sub', '') $$;

create schema neon_auth;
create table neon_auth."user" (
    id              uuid primary key default gen_random_uuid(),
    name            text not null default '',
    email           text not null unique,
    "emailVerified" boolean not null default false,
    image           text,
    "createdAt"     timestamptz not null default now(),
    "updatedAt"     timestamptz not null default now()
);

-- Privilégios padrão que a Data API configura no schema public
grant usage on schema public to authenticated, anonymous;
alter default privileges in schema public grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public grant usage, select on sequences to authenticated;
