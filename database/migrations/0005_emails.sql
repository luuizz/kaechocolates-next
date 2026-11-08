-- =============================================================================
-- Registro dos e-mails automáticos (pedido recebido, pagamento aprovado, enviado,
-- boas-vindas ao clube). Garante que cada aviso sai uma vez só, mesmo quando o
-- pagamento é confirmado ao mesmo tempo pelo webhook e pela página do pedido.
-- Só o servidor do site usa esta tabela.
-- =============================================================================
create table public.email_log (
  id        bigint generated always as identity primary key,
  kind      text not null,   -- order_received | order_paid | order_shipped | club_welcome
  ref       text not null,   -- código do pedido ou id da assinatura
  recipient text not null,
  sent_at   timestamptz not null default now(),
  unique (kind, ref)
);

alter table public.email_log enable row level security;
revoke all on public.email_log from anonymous, authenticated;
