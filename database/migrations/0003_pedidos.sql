-- =============================================================================
-- Pedidos, frete e estoque
--
-- As regras de dinheiro ficam aqui no banco: preço, desconto de kit, frete e
-- estoque são calculados pelas funções abaixo a partir das tabelas, nunca a
-- partir do que o navegador manda. Quem chama place_order / apply_payment é só
-- o servidor do site (rotas /api), com a connection string do banco; clientes e
-- visitantes não têm permissão de executá-las.
-- =============================================================================

-- Estoque: vazio = não controla; 0 = esgotado
alter table public.products add column stock int check (stock is null or stock >= 0);

-- -----------------------------------------------------------------------------
-- Frete por região (editável em /admin/frete)
-- -----------------------------------------------------------------------------
create table public.shipping_zones (
  id          text primary key check (id ~ '^[a-z0-9]+(-[a-z0-9]+)*$'),
  name        text not null,
  states      text[] not null check (array_length(states, 1) > 0),
  price       numeric(10, 2) not null check (price >= 0),
  days_min    int not null check (days_min > 0),
  days_max    int not null check (days_max >= days_min),
  sort_order  int not null default 0,
  active      boolean not null default true
);

insert into public.shipping_zones (id, name, states, price, days_min, days_max, sort_order) values
  ('sudeste',      'Sudeste',      array['SP','RJ','MG','ES'],                          19.90, 3, 6,  10),
  ('sul',          'Sul',          array['PR','SC','RS'],                               24.90, 4, 8,  20),
  ('centro-oeste', 'Centro-Oeste', array['DF','GO','MT','MS'],                          27.90, 5, 9,  30),
  ('nordeste',     'Nordeste',     array['BA','SE','AL','PE','PB','RN','CE','PI','MA'], 29.90, 6, 12, 40),
  ('norte',        'Norte',        array['AM','PA','AC','RO','RR','AP','TO'],           34.90, 8, 15, 50);

-- -----------------------------------------------------------------------------
-- Pedidos
-- -----------------------------------------------------------------------------
create sequence public.order_number_seq start 1001;

create table public.orders (
  id                bigint generated always as identity primary key,
  code              text not null unique default ('KAE-' || nextval('public.order_number_seq')),
  user_id           text not null references public.profiles (id),
  status            text not null default 'pending_payment'
                    check (status in ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'canceled')),
  payment_method    text not null check (payment_method in ('pix', 'card')),
  payment_status    text,          -- status do Mercado Pago (processed, action_required, failed…)
  payment_detail    text,          -- status_detail do Mercado Pago
  mp_order_id       text unique,
  pix_qr_code       text,
  pix_qr_base64     text,
  pix_ticket_url    text,
  pix_expires_at    timestamptz,
  installments      int,
  subtotal          numeric(10, 2) not null,
  discount          numeric(10, 2) not null default 0,
  shipping          numeric(10, 2) not null,
  total             numeric(10, 2) not null,
  shipping_zone     jsonb not null,   -- { id, name, days_min, days_max }
  shipping_address  jsonb not null,   -- cópia do endereço no momento da compra
  customer          jsonb not null,   -- { name, email, phone, cpf }
  tracking_code     text,
  stock_released    boolean not null default false,
  paid_at           timestamptz,
  shipped_at        timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index orders_user_idx on public.orders (user_id, created_at desc);
create index orders_status_idx on public.orders (status, created_at desc);

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.set_updated_at();

create table public.order_items (
  id          bigint generated always as identity primary key,
  order_id    bigint not null references public.orders (id) on delete cascade,
  kind        text not null check (kind in ('product', 'kit')),
  product_id  bigint references public.products (id) on delete set null,
  name        text not null,
  quantity    int not null check (quantity > 0),
  unit_price  numeric(10, 2) not null,
  total       numeric(10, 2) not null,
  kit         jsonb   -- { box, box_name, slugs, names, message, full_price }
);

create index order_items_order_idx on public.order_items (order_id);

-- -----------------------------------------------------------------------------
-- Cálculo do pedido (preços do banco). Usado na prévia do checkout e na compra.
--   p_items: [{ "kind": "product", "slug": "...", "quantity": 1 }
--             { "kind": "kit", "box": "m", "slugs": [...], "message": "...", "quantity": 1 }]
--   p_state: UF de entrega (null = sem frete ainda)
-- -----------------------------------------------------------------------------
create or replace function public.quote_order(p_items jsonb, p_state text, p_free_from numeric)
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_item      jsonb;
  v_qty       int;
  v_product   public.products;
  v_box       public.kit_boxes;
  v_lines     jsonb := '[]'::jsonb;
  v_problems  jsonb := '[]'::jsonb;
  v_subtotal  numeric := 0;   -- soma "cheia" (sem desconto de kit)
  v_discount  numeric := 0;
  v_kit_full  numeric;
  v_kit_disc  numeric;
  v_names     text[];
  v_slug      text;
  v_zone      public.shipping_zones;
  v_shipping  numeric := 0;
  v_need      jsonb := '{}'::jsonb;  -- { product_id: quantidade total pedida }
begin
  if jsonb_typeof(p_items) <> 'array' or jsonb_array_length(p_items) = 0 then
    return jsonb_build_object('problems', jsonb_build_array('Sua sacola está vazia.'));
  end if;
  if jsonb_array_length(p_items) > 50 then
    return jsonb_build_object('problems', jsonb_build_array('Pedido com itens demais.'));
  end if;

  for v_item in select * from jsonb_array_elements(p_items) loop
    v_qty := least(greatest(coalesce((v_item ->> 'quantity')::int, 1), 1), 20);

    if v_item ->> 'kind' = 'kit' then
      select * into v_box from public.kit_boxes where id = v_item ->> 'box' and active;
      if v_box.id is null then
        v_problems := v_problems || to_jsonb('Uma caixa de kit da sua sacola não está mais disponível.'::text);
        continue;
      end if;
      if jsonb_array_length(coalesce(v_item -> 'slugs', '[]')) <> v_box.size then
        v_problems := v_problems || to_jsonb(format('O kit precisa ter %s barras.', v_box.size));
        continue;
      end if;

      v_kit_full := 0;
      v_names := '{}';
      for v_slug in select jsonb_array_elements_text(v_item -> 'slugs') loop
        select * into v_product from public.products where slug = v_slug and active;
        if v_product.id is null or v_product.sold_out or v_product.stock = 0 then
          v_problems := v_problems || to_jsonb(format('Uma barra do kit (%s) está esgotada.', v_slug));
          continue;
        end if;
        v_kit_full := v_kit_full + v_product.price;
        v_names := v_names || v_product.name;
        v_need := jsonb_set(v_need, array[v_product.id::text], to_jsonb(coalesce((v_need ->> v_product.id::text)::int, 0) + v_qty));
      end loop;

      v_kit_disc := round(v_kit_full * v_box.discount, 2);
      v_subtotal := v_subtotal + v_kit_full * v_qty;
      v_discount := v_discount + v_kit_disc * v_qty;
      v_lines := v_lines || jsonb_build_object(
        'kind', 'kit',
        'name', coalesce(nullif(v_item ->> 'name', ''), 'Kit ' || v_box.name),
        'quantity', v_qty,
        'unit_price', v_kit_full - v_kit_disc,
        'total', (v_kit_full - v_kit_disc) * v_qty,
        'kit', jsonb_build_object(
          'box', v_box.id, 'box_name', v_box.name,
          'slugs', v_item -> 'slugs', 'names', to_jsonb(v_names),
          'message', left(nullif(trim(v_item ->> 'message'), ''), 200),
          'full_price', v_kit_full
        )
      );
    else
      select * into v_product from public.products where slug = v_item ->> 'slug' and active;
      if v_product.id is null then
        v_problems := v_problems || to_jsonb('Um produto da sua sacola saiu do catálogo.'::text);
        continue;
      end if;
      if v_product.sold_out or v_product.stock = 0 then
        v_problems := v_problems || to_jsonb(format('%s %s%% está esgotado.', v_product.name, v_product.cacao));
        continue;
      end if;
      v_subtotal := v_subtotal + v_product.price * v_qty;
      v_need := jsonb_set(v_need, array[v_product.id::text], to_jsonb(coalesce((v_need ->> v_product.id::text)::int, 0) + v_qty));
      v_lines := v_lines || jsonb_build_object(
        'kind', 'product',
        'product_id', v_product.id,
        'slug', v_product.slug,
        'name', format('%s %s%%', v_product.name, v_product.cacao),
        'quantity', v_qty,
        'unit_price', v_product.price,
        'total', v_product.price * v_qty
      );
    end if;
  end loop;

  -- Estoque suficiente para tudo (contando barras repetidas entre itens e kits)?
  for v_product in
    select p.* from public.products p
    where p.id in (select key::bigint from jsonb_each(v_need))
      and p.stock is not null
      and p.stock < (v_need ->> p.id::text)::int
  loop
    v_problems := v_problems || to_jsonb(format('Só temos %s unidade(s) de %s %s%%.', v_product.stock, v_product.name, v_product.cacao));
  end loop;

  if p_state is not null then
    select * into v_zone from public.shipping_zones where active and upper(p_state) = any (states) order by sort_order limit 1;
    if v_zone.id is null then
      v_problems := v_problems || to_jsonb('Ainda não entregamos nesse estado. Fale com a gente.'::text);
    elsif v_subtotal - v_discount < p_free_from then
      v_shipping := v_zone.price;
    end if;
  end if;

  return jsonb_build_object(
    'items', v_lines,
    'need', v_need,
    'subtotal', v_subtotal,
    'discount', v_discount,
    'shipping', v_shipping,
    'total', v_subtotal - v_discount + v_shipping,
    'zone', case when v_zone.id is null then null else jsonb_build_object('id', v_zone.id, 'name', v_zone.name, 'price', v_zone.price, 'days_min', v_zone.days_min, 'days_max', v_zone.days_max) end,
    'free_from', p_free_from,
    'problems', v_problems
  );
end;
$$;

-- Cria o pedido (aguardando pagamento) e reserva o estoque, tudo ou nada.
create or replace function public.place_order(p_user text, p_items jsonb, p_address_id bigint, p_method text, p_cpf text, p_free_from numeric)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_address  public.addresses;
  v_profile  public.profiles;
  v_quote    jsonb;
  v_order    public.orders;
  v_line     jsonb;
  v_need     record;
  v_updated  int;
begin
  select * into v_profile from public.profiles where id = p_user;
  if v_profile.id is null then raise exception 'Conta não encontrada.' using errcode = 'P0001'; end if;

  select * into v_address from public.addresses where id = p_address_id and user_id = p_user;
  if v_address.id is null then raise exception 'Escolha um endereço de entrega.' using errcode = 'P0001'; end if;

  if p_method not in ('pix', 'card') then raise exception 'Forma de pagamento inválida.' using errcode = 'P0001'; end if;
  if p_cpf !~ '^\d{11}$' then raise exception 'Informe um CPF válido.' using errcode = 'P0001'; end if;

  v_quote := public.quote_order(p_items, v_address.state, p_free_from);
  if jsonb_array_length(v_quote -> 'problems') > 0 then
    raise exception '%', v_quote -> 'problems' ->> 0 using errcode = 'P0001';
  end if;

  -- Reserva o estoque das barras controladas; se outra compra levou antes, desiste de tudo
  for v_need in select key::bigint as product_id, value::int as qty from jsonb_each_text(v_quote -> 'need') loop
    update public.products set stock = stock - v_need.qty
     where id = v_need.product_id and stock is not null and stock >= v_need.qty;
    get diagnostics v_updated = row_count;
    if v_updated = 0 and exists (select 1 from public.products where id = v_need.product_id and stock is not null) then
      raise exception 'Uma das barras acabou de esgotar. Atualize a sacola e tente de novo.' using errcode = 'P0001';
    end if;
  end loop;

  insert into public.orders (user_id, payment_method, subtotal, discount, shipping, total, shipping_zone, shipping_address, customer)
  values (
    p_user, p_method,
    (v_quote ->> 'subtotal')::numeric, (v_quote ->> 'discount')::numeric,
    (v_quote ->> 'shipping')::numeric, (v_quote ->> 'total')::numeric,
    v_quote -> 'zone',
    jsonb_build_object('recipient', v_address.recipient, 'cep', v_address.cep, 'street', v_address.street, 'number', v_address.number,
                       'complement', v_address.complement, 'district', v_address.district, 'city', v_address.city, 'state', v_address.state),
    jsonb_build_object('name', coalesce(v_profile.full_name, v_address.recipient), 'email', v_profile.email, 'phone', v_profile.phone, 'cpf', p_cpf)
  )
  returning * into v_order;

  for v_line in select * from jsonb_array_elements(v_quote -> 'items') loop
    insert into public.order_items (order_id, kind, product_id, name, quantity, unit_price, total, kit)
    values (v_order.id, v_line ->> 'kind', (v_line ->> 'product_id')::bigint, v_line ->> 'name', (v_line ->> 'quantity')::int,
            (v_line ->> 'unit_price')::numeric, (v_line ->> 'total')::numeric, v_line -> 'kit');
  end loop;

  return v_order;
end;
$$;

-- Devolve ao estoque o que o pedido reservou (uma vez só)
create or replace function public.release_order_stock(p_order_id bigint)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_released boolean;
begin
  update public.orders set stock_released = true where id = p_order_id and not stock_released returning true into v_released;
  if not coalesce(v_released, false) then return; end if;

  update public.products p set stock = p.stock + n.qty
    from (
      select coalesce(oi.product_id, pr.id) as product_id, sum(oi.quantity) as qty
        from public.order_items oi
        left join lateral jsonb_array_elements_text(case when oi.kind = 'kit' then oi.kit -> 'slugs' else '[]'::jsonb end) s(slug) on true
        left join public.products pr on pr.slug = s.slug
       where oi.order_id = p_order_id
       group by 1
    ) n
   where p.id = n.product_id and p.stock is not null;
end;
$$;

-- Atualiza o pedido com a resposta do Mercado Pago (criação, consulta ou webhook)
create or replace function public.apply_payment(p_code text, p_payment jsonb)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order   public.orders;
  v_status  text := p_payment ->> 'status';
begin
  update public.orders set
    mp_order_id    = coalesce(p_payment ->> 'mp_order_id', mp_order_id),
    payment_status = v_status,
    payment_detail = p_payment ->> 'status_detail',
    pix_qr_code    = coalesce(p_payment ->> 'qr_code', pix_qr_code),
    pix_qr_base64  = coalesce(p_payment ->> 'qr_code_base64', pix_qr_base64),
    pix_ticket_url = coalesce(p_payment ->> 'ticket_url', pix_ticket_url),
    pix_expires_at = coalesce((p_payment ->> 'expires_at')::timestamptz, pix_expires_at),
    installments   = coalesce((p_payment ->> 'installments')::int, installments),
    status = case
      when status <> 'pending_payment' then status
      when v_status = 'processed' then 'paid'
      when v_status in ('failed', 'canceled', 'expired', 'refunded', 'charged_back') then 'canceled'
      else status
    end,
    paid_at = case when status = 'pending_payment' and v_status = 'processed' then now() else paid_at end
  where code = p_code
  returning * into v_order;

  if v_order.id is null then raise exception 'Pedido % não encontrado.', p_code using errcode = 'P0001'; end if;
  if v_order.status = 'canceled' then perform public.release_order_stock(v_order.id); end if;
  return v_order;
end;
$$;

-- Painel: andamento do pedido e rastreio
create or replace function public.admin_update_order(p_id bigint, p_status text, p_tracking text)
returns public.orders
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_order public.orders;
begin
  if not public.is_admin() then raise exception 'Acesso restrito a administradores.' using errcode = '42501'; end if;
  if p_status not in ('pending_payment', 'paid', 'preparing', 'shipped', 'delivered', 'canceled') then
    raise exception 'Status inválido.' using errcode = 'P0001';
  end if;

  update public.orders set
    status        = p_status,
    tracking_code = nullif(trim(p_tracking), ''),
    paid_at       = case when p_status in ('paid', 'preparing', 'shipped', 'delivered') then coalesce(paid_at, now()) else paid_at end,
    shipped_at    = case when p_status in ('shipped', 'delivered') then coalesce(shipped_at, now()) else shipped_at end
  where id = p_id
  returning * into v_order;

  if v_order.id is null then raise exception 'Pedido não encontrado.' using errcode = 'P0001'; end if;
  if p_status = 'canceled' then perform public.release_order_stock(v_order.id); end if;
  return v_order;
end;
$$;

-- -----------------------------------------------------------------------------
-- Segurança
-- -----------------------------------------------------------------------------
alter table public.shipping_zones enable row level security;
alter table public.orders         enable row level security;
alter table public.order_items    enable row level security;

revoke all on public.shipping_zones, public.orders, public.order_items from anonymous, authenticated;

grant select on public.shipping_zones to anonymous, authenticated;
grant insert, update, delete on public.shipping_zones to authenticated;
create policy "leitura dos ativos" on public.shipping_zones for select to anonymous, authenticated using (active or public.is_admin());
create policy "admin insere" on public.shipping_zones for insert to authenticated with check (public.is_admin());
create policy "admin edita" on public.shipping_zones for update to authenticated using (public.is_admin()) with check (public.is_admin());
create policy "admin exclui" on public.shipping_zones for delete to authenticated using (public.is_admin());

-- Pedidos: cliente lê os seus, admin lê todos. Ninguém grava direto: só pelas funções.
grant select on public.orders, public.order_items to authenticated;
create policy "pedidos: dono ou admin" on public.orders
  for select to authenticated using (user_id = auth.user_id() or public.is_admin());
create policy "itens: dono do pedido ou admin" on public.order_items
  for select to authenticated using (exists (select 1 from public.orders o where o.id = order_id and (o.user_id = auth.user_id() or public.is_admin())));

-- Funções de dinheiro: só o servidor (dono do banco) executa
revoke execute on function public.quote_order(jsonb, text, numeric) from public, anonymous, authenticated;
revoke execute on function public.place_order(text, jsonb, bigint, text, text, numeric) from public, anonymous, authenticated;
revoke execute on function public.release_order_stock(bigint) from public, anonymous, authenticated;
revoke execute on function public.apply_payment(text, jsonb) from public, anonymous, authenticated;
revoke execute on function public.admin_update_order(bigint, text, text) from public, anonymous;
grant execute on function public.admin_update_order(bigint, text, text) to authenticated;
