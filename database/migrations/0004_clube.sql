-- =============================================================================
-- Clube de assinatura
--
-- Cada assinatura vira uma "preapproval" no Mercado Pago, que cobra o cartão
-- a cada período (1, 3 ou 6 meses). O valor é calculado aqui, a partir dos
-- planos e períodos do banco. Assim como nos pedidos, as funções de dinheiro
-- só rodam com a connection string do servidor.
-- =============================================================================

create table public.subscriptions (
  id                 bigint generated always as identity primary key,
  user_id            text not null references public.profiles (id),
  plan_id            text not null references public.club_plans (id),
  period_id          text not null references public.club_periods (id),
  plan               jsonb not null,      -- { name, bars } no momento da assinatura
  period             jsonb not null,      -- { label, months, discount }
  amount             numeric(10, 2) not null,  -- cobrado a cada período
  monthly            numeric(10, 2) not null,  -- equivalente por mês (para exibir)
  status             text not null default 'pending'
                     check (status in ('pending', 'active', 'paused', 'canceled')),
  mp_preapproval_id  text unique,
  mp_status          text,
  next_payment_date  timestamptz,
  ends_at            timestamptz,         -- cancelada: recebe caixas até esta data
  card_last_four     text,
  shipping_address   jsonb not null,
  customer           jsonb not null,      -- { name, email, phone, cpf }
  notes              text,                -- restrições alimentares, recado
  started_at         timestamptz,
  paused_at          timestamptz,
  canceled_at        timestamptz,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now()
);

-- Uma assinatura em andamento por cliente
create unique index subscriptions_one_open on public.subscriptions (user_id) where status <> 'canceled';
create index subscriptions_status_idx on public.subscriptions (status, created_at desc);

create trigger subscriptions_updated_at
  before update on public.subscriptions
  for each row execute function public.set_updated_at();

create table public.subscription_payments (
  id               bigint generated always as identity primary key,
  subscription_id  bigint not null references public.subscriptions (id) on delete cascade,
  mp_payment_id    text not null unique,   -- id do "authorized payment" no Mercado Pago
  amount           numeric(10, 2) not null,
  status           text not null,          -- approved, rejected, pending…
  status_detail    text,
  paid_at          timestamptz,
  created_at       timestamptz not null default now()
);

create index subscription_payments_sub_idx on public.subscription_payments (subscription_id, created_at desc);

-- -----------------------------------------------------------------------------
-- Valor da assinatura: preço do plano com o desconto do período, por mês e por cobrança
-- -----------------------------------------------------------------------------
create or replace function public.club_quote(p_plan text, p_period text)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_plan    public.club_plans;
  v_period  public.club_periods;
  v_monthly numeric;
begin
  select * into v_plan from public.club_plans where id = p_plan and active;
  if v_plan.id is null then raise exception 'Este plano não está mais disponível.' using errcode = 'P0001'; end if;
  select * into v_period from public.club_periods where id = p_period and active;
  if v_period.id is null then raise exception 'Este período não está mais disponível.' using errcode = 'P0001'; end if;

  v_monthly := round(v_plan.price * (1 - v_period.discount), 2);
  return jsonb_build_object(
    'plan', jsonb_build_object('id', v_plan.id, 'name', v_plan.name, 'bars', v_plan.bars, 'price', v_plan.price),
    'period', jsonb_build_object('id', v_period.id, 'label', v_period.label, 'months', v_period.months, 'discount', v_period.discount),
    'monthly', v_monthly,
    'amount', v_monthly * v_period.months
  );
end;
$$;

-- Cria a assinatura (pendente até o Mercado Pago autorizar o cartão)
create or replace function public.start_subscription(p_user text, p_plan text, p_period text, p_address_id bigint, p_cpf text, p_notes text)
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_profile public.profiles;
  v_address public.addresses;
  v_quote   jsonb;
  v_sub     public.subscriptions;
begin
  select * into v_profile from public.profiles where id = p_user;
  if v_profile.id is null then raise exception 'Conta não encontrada.' using errcode = 'P0001'; end if;
  select * into v_address from public.addresses where id = p_address_id and user_id = p_user;
  if v_address.id is null then raise exception 'Escolha o endereço de entrega das caixas.' using errcode = 'P0001'; end if;
  if p_cpf !~ '^\d{11}$' then raise exception 'Informe um CPF válido.' using errcode = 'P0001'; end if;
  if not exists (select 1 from public.shipping_zones where active and v_address.state = any (states)) then
    raise exception 'Ainda não entregamos o clube nesse estado.' using errcode = 'P0001';
  end if;

  -- Tentativa anterior que não chegou a ser autorizada: descarta
  delete from public.subscriptions where user_id = p_user and status = 'pending' and mp_preapproval_id is null;
  if exists (select 1 from public.subscriptions where user_id = p_user and status <> 'canceled') then
    raise exception 'Você já tem uma assinatura do clube. Gerencie em Minha conta.' using errcode = 'P0001';
  end if;

  v_quote := public.club_quote(p_plan, p_period);

  insert into public.subscriptions (user_id, plan_id, period_id, plan, period, amount, monthly, shipping_address, customer, notes)
  values (
    p_user, p_plan, p_period,
    v_quote -> 'plan', v_quote -> 'period',
    (v_quote ->> 'amount')::numeric, (v_quote ->> 'monthly')::numeric,
    jsonb_build_object('recipient', v_address.recipient, 'cep', v_address.cep, 'street', v_address.street, 'number', v_address.number,
                       'complement', v_address.complement, 'district', v_address.district, 'city', v_address.city, 'state', v_address.state),
    jsonb_build_object('name', coalesce(v_profile.full_name, v_address.recipient), 'email', v_profile.email, 'phone', v_profile.phone, 'cpf', p_cpf),
    left(nullif(trim(p_notes), ''), 500)
  )
  returning * into v_sub;
  return v_sub;
end;
$$;

-- Grava o estado da preapproval do Mercado Pago na assinatura
create or replace function public.apply_subscription(p_id bigint, p_data jsonb)
returns public.subscriptions
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sub    public.subscriptions;
  v_mp     text := p_data ->> 'status';
  v_status text;
begin
  v_status := case v_mp
    when 'authorized' then 'active'
    when 'paused' then 'paused'
    when 'cancelled' then 'canceled'
    when 'canceled' then 'canceled'
    when 'failed' then 'canceled'
    else null
  end;

  update public.subscriptions set
    mp_preapproval_id = coalesce(p_data ->> 'mp_preapproval_id', mp_preapproval_id),
    mp_status         = coalesce(v_mp, mp_status),
    next_payment_date = coalesce((p_data ->> 'next_payment_date')::timestamptz, next_payment_date),
    card_last_four    = coalesce(p_data ->> 'last_four', card_last_four),
    status            = coalesce(v_status, status),
    started_at        = case when v_status = 'active' then coalesce(started_at, now()) else started_at end,
    paused_at         = case when v_status = 'paused' then coalesce(paused_at, now()) when v_status = 'active' then null else paused_at end,
    canceled_at       = case when v_status = 'canceled' then coalesce(canceled_at, now()) else canceled_at end,
    -- Ao cancelar, as caixas seguem até o fim do período já pago
    ends_at           = case when v_status = 'canceled' and status <> 'canceled' then case when started_at is null then now() else coalesce(next_payment_date, now()) end else ends_at end
  where id = p_id
  returning * into v_sub;

  if v_sub.id is null then raise exception 'Assinatura não encontrada.' using errcode = 'P0001'; end if;
  return v_sub;
end;
$$;

-- Registra uma cobrança da assinatura (aviso do Mercado Pago)
create or replace function public.record_subscription_payment(p_preapproval_id text, p_data jsonb)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_sub_id bigint;
begin
  select id into v_sub_id from public.subscriptions where mp_preapproval_id = p_preapproval_id;
  if v_sub_id is null then return; end if;

  insert into public.subscription_payments (subscription_id, mp_payment_id, amount, status, status_detail, paid_at)
  values (v_sub_id, p_data ->> 'id', (p_data ->> 'amount')::numeric, p_data ->> 'status', p_data ->> 'status_detail',
          case when p_data ->> 'status' = 'approved' then coalesce((p_data ->> 'date')::timestamptz, now()) end)
  on conflict (mp_payment_id) do update set
    status = excluded.status,
    status_detail = excluded.status_detail,
    paid_at = coalesce(public.subscription_payments.paid_at, excluded.paid_at);
end;
$$;

-- -----------------------------------------------------------------------------
-- Segurança: assinante lê a sua, admin lê todas. Gravação só pelas funções.
-- -----------------------------------------------------------------------------
alter table public.subscriptions         enable row level security;
alter table public.subscription_payments enable row level security;
revoke all on public.subscriptions, public.subscription_payments from anonymous, authenticated;

grant select on public.subscriptions, public.subscription_payments to authenticated;
create policy "assinatura: dona ou admin" on public.subscriptions
  for select to authenticated using (user_id = auth.user_id() or public.is_admin());
create policy "cobranças: dona da assinatura ou admin" on public.subscription_payments
  for select to authenticated using (exists (select 1 from public.subscriptions s where s.id = subscription_id and (s.user_id = auth.user_id() or public.is_admin())));

revoke execute on function public.club_quote(text, text) from public, anonymous, authenticated;
revoke execute on function public.start_subscription(text, text, text, bigint, text, text) from public, anonymous, authenticated;
revoke execute on function public.apply_subscription(bigint, jsonb) from public, anonymous, authenticated;
revoke execute on function public.record_subscription_payment(text, jsonb) from public, anonymous, authenticated;
