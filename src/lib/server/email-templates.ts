import { brand } from '@/config/brand'
import { formatBRL } from '@/data/products'
import type { OrderView } from '@/lib/orders'

// Modelos dos e-mails automáticos. HTML em tabelas e estilos inline, porque é o que os
// programas de e-mail (Gmail, Outlook, Apple Mail) entendem; sempre com versão em texto.

export type Email = { subject: string; html: string; text: string }

const C = { ink: '#111111', muted: '#6b6b69', line: '#ebebeb', soft: '#f4f4f2', yellow: '#e8b630' }
const FONT = "font-family:'Helvetica Neue',Helvetica,Arial,sans-serif"

const escape = (value: string) => value.replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char]!)
const url = (path: string) => `${brand.url}${path}`
const firstName = (name: string) => name.trim().split(/\s+/)[0] || 'chocólatra'

function button(label: string, href: string) {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 8px"><tr><td style="background:${C.ink};border-radius:999px">
    <a href="${href}" style="display:inline-block;padding:14px 28px;${FONT};font-size:15px;font-weight:700;color:#ffffff;text-decoration:none">${escape(label)}</a>
  </td></tr></table>`
}

function layout({ preheader, accent = C.yellow, title, body }: { preheader: string; accent?: string; title: string; body: string }) {
  const c = brand.contact
  return `<!doctype html>
<html lang="pt-BR"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"><title>${escape(title)}</title></head>
<body style="margin:0;padding:0;background:${C.soft}">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0">${escape(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.soft}"><tr><td align="center" style="padding:32px 12px">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border-radius:24px;overflow:hidden">
      <tr><td style="padding:28px 32px 20px"><a href="${url('/')}"><img src="${url(brand.logo.email)}" width="111" height="56" alt="${escape(brand.name)}" style="display:block;border:0"></a></td></tr>
      <tr><td style="height:8px;background:${accent};font-size:0;line-height:0">&nbsp;</td></tr>
      <tr><td style="padding:32px 32px 8px;${FONT};color:${C.ink}">
        <h1 style="margin:0 0 12px;font-size:28px;line-height:1.15;font-weight:800;letter-spacing:-0.5px">${escape(title)}</h1>
        ${body}
      </td></tr>
      <tr><td style="padding:28px 32px 32px;${FONT};font-size:12px;line-height:1.6;color:${C.muted};border-top:1px solid ${C.line}">
        <strong style="color:${C.ink}">${escape(brand.name)}</strong> · ${escape(brand.tagline)}<br>
        ${escape(c.address)}<br>
        WhatsApp ${escape(c.phone)} · <a href="mailto:${c.email}" style="color:${C.muted}">${escape(c.email)}</a><br>
        Você recebeu este e-mail por causa de uma compra ou assinatura no site.
      </td></tr>
    </table>
  </td></tr></table>
</body></html>`
}

const p = (html: string) => `<p style="margin:0 0 14px;font-size:16px;line-height:1.55">${html}</p>`

function itemsTable(order: OrderView) {
  const rows = order.items.map((item) => `<tr>
    <td style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:14px;line-height:1.4">
      <strong>${escape(item.name)}</strong> <span style="color:${C.muted}">× ${item.quantity}</span>
      ${item.kit ? `<br><span style="color:${C.muted};font-size:13px">${escape(item.kit.names.join(', '))}</span>` : ''}
      ${item.kit?.message ? `<br><span style="color:${C.muted};font-size:13px;font-style:italic">Cartão: “${escape(item.kit.message)}”</span>` : ''}
    </td>
    <td align="right" style="padding:10px 0;border-bottom:1px solid ${C.line};font-size:14px;white-space:nowrap;vertical-align:top">${formatBRL(item.total)}</td>
  </tr>`).join('')
  const line = (label: string, value: string, strong = false) => `<tr><td style="padding:4px 0;font-size:${strong ? 16 : 14}px;${strong ? 'font-weight:800' : `color:${C.muted}`}">${label}</td><td align="right" style="padding:4px 0;font-size:${strong ? 18 : 14}px;${strong ? 'font-weight:800' : ''}">${value}</td></tr>`
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:20px 0 4px">${rows}
    <tr><td colspan="2" style="height:10px"></td></tr>
    ${line('Produtos', formatBRL(order.subtotal))}
    ${order.discount > 0 ? line('Desconto dos kits', `-${formatBRL(order.discount)}`) : ''}
    ${line('Frete', order.shipping === 0 ? 'Grátis' : formatBRL(order.shipping))}
    ${line('Total', formatBRL(order.total), true)}
  </table>`
}

function addressBlock(order: OrderView) {
  const a = order.shipping_address
  return `<div style="margin:20px 0 0;padding:16px 18px;background:${C.soft};border-radius:16px;font-size:14px;line-height:1.5">
    <strong>Entrega para ${escape(a.recipient)}</strong><br>
    <span style="color:${C.muted}">${escape(a.street)}, ${escape(a.number)}${a.complement ? ` · ${escape(a.complement)}` : ''}<br>${escape(a.district)} · ${escape(a.city)}/${a.state} · ${a.cep.replace(/^(\d{5})/, '$1-')}</span>
    ${order.shipping_zone ? `<br><span style="color:${C.muted}">Prazo: ${order.shipping_zone.days_min} a ${order.shipping_zone.days_max} dias úteis depois do pagamento</span>` : ''}
  </div>`
}

const itemsText = (order: OrderView) => [
  ...order.items.map((item) => `- ${item.name} × ${item.quantity}: ${formatBRL(item.total)}`),
  `Frete: ${order.shipping === 0 ? 'grátis' : formatBRL(order.shipping)}`,
  `Total: ${formatBRL(order.total)}`,
].join('\n')

// Pix gerado, aguardando pagamento
export function orderReceived(order: OrderView): Email {
  const link = url(`/pedido/${order.code}`)
  return {
    subject: `Recebemos seu pedido ${order.code}`,
    html: layout({
      preheader: `Falta só pagar o Pix de ${formatBRL(order.total)}.`,
      title: 'Pedido recebido!',
      body: p(`Oi, ${escape(firstName(order.customer.name))}! Seu pedido <strong>${order.code}</strong> está reservado. Falta só pagar o Pix: o código vale por 30 minutos.`)
        + (order.pix_qr_code ? `<div style="margin:16px 0 0;padding:14px 16px;background:${C.soft};border-radius:12px;font-family:Menlo,Consolas,monospace;font-size:12px;line-height:1.5;word-break:break-all">${escape(order.pix_qr_code)}</div><p style="margin:8px 0 0;font-size:13px;color:${C.muted}">Copie o código acima e cole no app do seu banco, em Pix copia e cola.</p>` : '')
        + button('Ver QR Code do Pix', link)
        + itemsTable(order) + addressBlock(order),
    }),
    text: `Oi, ${firstName(order.customer.name)}! Recebemos seu pedido ${order.code}. Falta só pagar o Pix (vale por 30 minutos).\n\n${order.pix_qr_code ? `Pix copia e cola:\n${order.pix_qr_code}\n\n` : ''}QR Code e andamento: ${link}\n\n${itemsText(order)}`,
  }
}

export function orderPaid(order: OrderView): Email {
  const link = url(`/pedido/${order.code}`)
  return {
    subject: `Pagamento aprovado · pedido ${order.code}`,
    html: layout({
      preheader: 'Já estamos separando suas barras.',
      accent: '#3aa55a',
      title: 'Pagamento aprovado!',
      body: p(`Oba, ${escape(firstName(order.customer.name))}! O pagamento do pedido <strong>${order.code}</strong> foi confirmado. Agora a gente separa e embala suas barras com todo o cuidado (e axé).`)
        + p('Quando o pedido sair, você recebe outro e-mail com o código de rastreio.')
        + button('Acompanhar pedido', link)
        + itemsTable(order) + addressBlock(order),
    }),
    text: `Oba, ${firstName(order.customer.name)}! O pagamento do pedido ${order.code} foi aprovado. Quando sair para entrega, mandamos o rastreio.\n\nAcompanhe: ${link}\n\n${itemsText(order)}`,
  }
}

export function orderShipped(order: OrderView): Email {
  const link = url(`/pedido/${order.code}`)
  const tracking = order.tracking_code
  const trackingUrl = tracking ? `https://rastreamento.correios.com.br/app/index.php?objeto=${encodeURIComponent(tracking)}` : link
  return {
    subject: `Seu pedido ${order.code} saiu para entrega`,
    html: layout({
      preheader: tracking ? `Código de rastreio: ${tracking}` : 'Seu chocolate está a caminho.',
      accent: '#e47a24',
      title: 'Seu chocolate está a caminho!',
      body: p(`${escape(firstName(order.customer.name))}, o pedido <strong>${order.code}</strong> foi enviado.`)
        + (tracking ? `<div style="margin:16px 0 0;padding:16px 18px;background:${C.soft};border-radius:16px"><span style="font-size:13px;color:${C.muted}">Código de rastreio</span><br><strong style="font-size:20px;letter-spacing:1px">${escape(tracking)}</strong></div>` : '')
        + button(tracking ? 'Rastrear pedido' : 'Ver pedido', trackingUrl)
        + p(`<span style="font-size:14px;color:${C.muted}">Chocolate gosta de lugar fresco: quando chegar, guarde longe do sol e do calor (entre 15 °C e 20 °C é o ideal).</span>`)
        + addressBlock(order),
    }),
    text: `${firstName(order.customer.name)}, o pedido ${order.code} foi enviado.${tracking ? `\nRastreio: ${tracking}\n${trackingUrl}` : `\n${link}`}`,
  }
}

export type WelcomeSubscription = {
  id: number | string
  plan: { name: string; bars: number }
  period: { label: string; months: number }
  amount: number
  next_payment_date: string | null
  customer: { name: string; email: string }
}

export function clubWelcome(sub: WelcomeSubscription): Email {
  const link = url('/conta?aba=clube')
  const next = sub.next_payment_date ? new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', timeZone: 'America/Sao_Paulo' }).format(new Date(sub.next_payment_date)) : null
  const charge = `${formatBRL(sub.amount)} ${sub.period.months === 1 ? 'por mês' : `a cada ${sub.period.months} meses`}`
  return {
    subject: `Boas-vindas ao Clube ${brand.shortName}!`,
    html: layout({
      preheader: `Plano ${sub.plan.name}: ${sub.plan.bars} barras por mês.`,
      accent: '#e2708e',
      title: 'Boas-vindas ao clube!',
      body: p(`${escape(firstName(sub.customer.name))}, que alegria ter você com a gente. Todo mês chega uma caixa com barras da casa e edições limitadas que não vão para a loja.`)
        + `<div style="margin:16px 0 0;padding:18px;background:${C.soft};border-radius:16px;font-size:14px;line-height:1.6">
            <strong style="font-size:18px">${escape(sub.plan.name)}</strong> · ${escape(sub.period.label)}<br>
            ${sub.plan.bars} barras por mês · frete grátis<br>
            <span style="color:${C.muted}">Cobrança: ${charge}${next ? ` · próxima em ${next}` : ''}</span>
          </div>`
        + p('<br>As caixas saem na primeira quinzena de cada mês. Em Minha conta você acompanha as cobranças e pode pausar, retomar ou cancelar quando quiser.')
        + button('Ver minha assinatura', link),
    }),
    text: `${firstName(sub.customer.name)}, boas-vindas ao Clube ${brand.shortName}!\n\nPlano ${sub.plan.name} (${sub.period.label}): ${sub.plan.bars} barras por mês, frete grátis.\nCobrança: ${charge}${next ? `, próxima em ${next}` : ''}.\n\nGerencie em: ${link}`,
  }
}

// Pedido e assinatura de exemplo, para o botão "Enviar e-mails de teste" do painel
export function sampleEmails(name: string): Email[] {
  const order = {
    id: 0, code: 'KAE-TESTE', status: 'paid', payment_method: 'pix', payment_status: null, payment_detail: null,
    pix_qr_code: '00020126580014br.gov.bcb.pix0136exemplo-de-pix-copia-e-cola-kae5204000053039865406233.105802BR5913KAE CHOCOLATES6008VARGINHA6304ABCD',
    pix_qr_base64: null, pix_ticket_url: null, pix_expires_at: null, installments: null,
    subtotal: 228.9, discount: 15.7, shipping: 19.9, total: 233.1,
    shipping_zone: { id: 'sudeste', name: 'Sudeste', days_min: 3, days_max: 6 },
    shipping_address: { recipient: name, cep: '37014230', street: 'Praça Marechal Deodoro', number: '130', complement: null, district: 'Centro', city: 'Varginha', state: 'MG' },
    customer: { name, email: '', phone: null, cpf: '12345678909' },
    tracking_code: 'AA123456789BR', paid_at: null, shipped_at: null, created_at: new Date().toISOString(),
    items: [
      { kind: 'product', product_id: null, name: 'Cupuaçu 64%', quantity: 1, unit_price: 32.7, total: 32.7, kit: null },
      { kind: 'kit', product_id: null, name: 'Kit dos premiados', quantity: 1, unit_price: 180.5, total: 180.5, kit: { box: 'm', box_name: 'Caixa M', slugs: [], names: ['Intenso', 'Cupuaçu', 'Castanha e flor de sal', 'Cumaru', 'Caipira', 'Açaí'], message: 'Feliz aniversário!', full_price: 196.2 } },
    ],
  } as OrderView
  const mark = (email: Email): Email => ({ ...email, subject: `[Teste] ${email.subject}` })
  return [
    orderReceived(order),
    orderPaid(order),
    orderShipped(order),
    clubWelcome({ id: 0, plan: { name: 'Chocólatra', bars: 4 }, period: { label: 'Trimestral', months: 3 }, amount: 313.23, next_payment_date: new Date(Date.now() + 90 * 864e5).toISOString(), customer: { name, email: '' } }),
  ].map(mark)
}
