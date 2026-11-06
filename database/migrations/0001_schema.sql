-- =============================================================================
-- Kaê Chocolates — schema da loja (Neon / PostgreSQL)
-- Perfis, endereços, catálogo (barras, caixas de kit, planos do clube) e RLS.
--
-- ANTES de rodar: no Console do Neon, ative o Neon Auth e a Data API do
-- projeto. Eles criam os papéis `authenticated`/`anonymous` e a função
-- auth.user_id(), que este arquivo usa.
--
-- Aplicado pelo `yarn db:migrate` (local) e pelo deploy da main (GitHub Actions).
-- Não edite migrations já aplicadas: crie um novo arquivo (0003_...sql).
-- =============================================================================

do $$
begin
  if not exists (select 1 from pg_roles where rolname = 'authenticated')
     or not exists (select 1 from pg_roles where rolname = 'anonymous') then
    raise exception 'Ative a Data API no Console do Neon antes de rodar este arquivo (papéis authenticated/anonymous não encontrados).';
  end if;
  if to_regprocedure('auth.user_id()') is null then
    raise exception 'Ative o Neon Auth e a Data API no Console do Neon antes de rodar este arquivo (função auth.user_id() não encontrada).';
  end if;
  if to_regclass('neon_auth."user"') is null then
    raise exception 'Ative o Neon Auth no Console do Neon antes de rodar este arquivo (tabela neon_auth.user não encontrada).';
  end if;
end;
$$;

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- -----------------------------------------------------------------------------
-- Perfis (1:1 com neon_auth.user, criados no primeiro acesso)
-- -----------------------------------------------------------------------------
create table public.profiles (
  id          text primary key,  -- id do usuário no Neon Auth (claim sub do JWT)
  email       text,
  full_name   text,
  phone       text,
  role        text not null default 'customer' check (role in ('customer', 'admin')),
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute function public.set_updated_at();

-- Garante que o usuário logado tem perfil, copiando nome e e-mail do Neon Auth.
-- O site chama logo depois do login.
create or replace function public.ensure_profile()
returns public.profiles
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_user    text := auth.user_id();
  v_profile public.profiles;
begin
  if v_user is null then
    raise exception 'Faça login para continuar.' using errcode = '42501';
  end if;

  insert into public.profiles (id, email, full_name)
  select u.id::text, u.email, nullif(u.name, '')
    from neon_auth."user" u
   where u.id::text = v_user
  on conflict (id) do update
    set email = excluded.email
  returning * into v_profile;

  if v_profile.id is null then
    raise exception 'Conta não encontrada.' using errcode = 'P0001';
  end if;

  return v_profile;
end;
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.user_id() and role = 'admin'
  );
$$;

-- -----------------------------------------------------------------------------
-- Endereços de entrega do cliente
-- -----------------------------------------------------------------------------
create table public.addresses (
  id          bigint generated always as identity primary key,
  user_id     text not null default auth.user_id() references public.profiles (id) on delete cascade,
  label       text,
  recipient   text not null,
  cep         text not null check (cep ~ '^\d{8}$'),
  street      text not null,
  number      text not null,
  complement  text,
  district    text not null,
  city        text not null,
  state       text not null check (state ~ '^[A-Z]{2}$'),
  is_default  boolean not null default false,
  created_at  timestamptz not null default now()
);

create index addresses_user_idx on public.addresses (user_id);

-- Só um endereço padrão por cliente
create unique index addresses_one_default on public.addresses (user_id) where is_default;

-- -----------------------------------------------------------------------------
-- Catálogo: barras
-- -----------------------------------------------------------------------------
create table public.products (
  id                bigint generated always as identity primary key,
  slug              text not null unique check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name              text not null check (length(trim(name)) > 0),
  cacao             int not null check (cacao between 0 and 100),
  line              text not null check (line in ('intensos', 'ao-leite', 'brancos')),
  label_color       text not null default '#151515' check (label_color ~ '^#[0-9a-fA-F]{6}$'),
  tile_color        text not null default '#c9a54c' check (tile_color ~ '^#[0-9a-fA-F]{6}$'),
  label_text        text not null default 'dark' check (label_text in ('dark', 'light')),
  price             numeric(10, 2) not null check (price >= 0),
  compare_at_price  numeric(10, 2) check (compare_at_price is null or compare_at_price > price),
  weight            text not null default '70 g',
  short             text not null default '',
  description       text,
  ingredients       text,
  badge             text check (badge in ('Edição limitada', 'Zero açúcar', 'Novo')),
  sold_out          boolean not null default false,
  image             text,
  sort_order        int not null default 0,
  active            boolean not null default true,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index products_active_order_idx on public.products (active, sort_order);

create trigger products_updated_at
  before update on public.products
  for each row execute function public.set_updated_at();

-- -----------------------------------------------------------------------------
-- Catálogo: caixas do "Monte seu kit"
-- -----------------------------------------------------------------------------
create table public.kit_boxes (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  size        int not null check (size between 1 and 24),
  discount    numeric(4, 3) not null default 0 check (discount between 0 and 0.5),
  note        text,
  sort_order  int not null default 0,
  active      boolean not null default true
);

-- -----------------------------------------------------------------------------
-- Clube: planos e períodos
-- -----------------------------------------------------------------------------
create table public.club_plans (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  bars        int not null check (bars between 1 and 24),
  price       numeric(10, 2) not null check (price >= 0),
  color       text not null default '#efb72d' check (color ~ '^#[0-9a-fA-F]{6}$'),
  pitch       text not null default '',
  perks       text[] not null default '{}',
  featured    boolean not null default false,
  sort_order  int not null default 0,
  active      boolean not null default true
);

create table public.club_periods (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  label       text not null,
  months      int not null check (months between 1 and 12),
  discount    numeric(4, 3) not null default 0 check (discount between 0 and 0.5),
  note        text,
  sort_order  int not null default 0,
  active      boolean not null default true
);

-- -----------------------------------------------------------------------------
-- Segurança por linha
-- -----------------------------------------------------------------------------
alter table public.profiles     enable row level security;
alter table public.addresses    enable row level security;
alter table public.products     enable row level security;
alter table public.kit_boxes    enable row level security;
alter table public.club_plans   enable row level security;
alter table public.club_periods enable row level security;

revoke all on public.profiles, public.addresses, public.products,
              public.kit_boxes, public.club_plans, public.club_periods
  from anonymous, authenticated;

-- Perfis: cada um vê o seu (admin vê todos) e só edita nome e telefone.
-- O papel (role) só muda direto no banco (veja o README).
grant select on public.profiles to authenticated;
grant update (full_name, phone) on public.profiles to authenticated;

create policy "perfil: ler o próprio ou admin" on public.profiles
  for select to authenticated
  using (id = auth.user_id() or public.is_admin());

create policy "perfil: editar o próprio" on public.profiles
  for update to authenticated
  using (id = auth.user_id())
  with check (id = auth.user_id());

-- Endereços: só o dono
grant select, insert, update, delete on public.addresses to authenticated;

create policy "endereços: do próprio cliente" on public.addresses
  for all to authenticated
  using (user_id = auth.user_id())
  with check (user_id = auth.user_id());

-- Catálogo: todo mundo lê o que está ativo; admin lê tudo e edita
do $$
declare
  t text;
begin
  foreach t in array array['products', 'kit_boxes', 'club_plans', 'club_periods'] loop
    execute format('grant select on public.%I to anonymous, authenticated', t);
    execute format('grant insert, update, delete on public.%I to authenticated', t);
    execute format($p$create policy "leitura dos ativos" on public.%I for select to anonymous, authenticated using (active or public.is_admin())$p$, t);
    execute format($p$create policy "admin insere" on public.%I for insert to authenticated with check (public.is_admin())$p$, t);
    execute format($p$create policy "admin edita" on public.%I for update to authenticated using (public.is_admin()) with check (public.is_admin())$p$, t);
    execute format($p$create policy "admin exclui" on public.%I for delete to authenticated using (public.is_admin())$p$, t);
  end loop;
end;
$$;

grant usage, select on all sequences in schema public to authenticated;

revoke execute on function public.ensure_profile() from public, anonymous;
grant execute on function public.ensure_profile() to authenticated;
grant execute on function public.is_admin() to anonymous, authenticated;
