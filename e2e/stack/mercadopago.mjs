// Pix com first_name "APRO" é aprovado; cartão com token "rejeitar" é recusado
import http from 'node:http'

const QR = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=='

export function startMercadoPago(port = 4300) {
  const orders = new Map()
  const preapprovals = new Map()
  const log = []
  let n = 0

  http
    .createServer((req, res) => {
      let raw = ''
      req.on('data', (chunk) => (raw += chunk))
      req.on('end', () => {
        const send = (status, body) => {
          res.writeHead(status, { 'Content-Type': 'application/json' })
          res.end(JSON.stringify(body))
        }
        const body = raw ? JSON.parse(raw) : {}
        if (req.url === '/__log') return send(200, log)
        if (!req.headers.authorization?.startsWith('Bearer ')) return send(401, { message: 'missing token' })

        if (req.method === 'POST' && req.url === '/emails') {
          log.push({ type: 'email', body })
          return send(200, { id: `email_${++n}` })
        }

        if (req.method === 'POST' && req.url === '/v1/orders') {
          log.push({ type: 'order', idempotency: req.headers['x-idempotency-key'], body })
          const payment = body.transactions.payments[0]
          const id = `ORD${++n}`
          const result =
            payment.payment_method.id === 'pix'
              ? {
                  id: `PAY${n}`,
                  status: 'action_required',
                  status_detail: 'waiting_transfer',
                  amount: payment.amount,
                  date_of_expiration: new Date(Date.now() + 30 * 60000).toISOString(),
                  payment_method: {
                    id: 'pix',
                    type: 'bank_transfer',
                    qr_code: '00020126580014br.gov.bcb.pix-E2E',
                    qr_code_base64: QR,
                    ticket_url: 'https://www.mercadopago.com.br/sandbox/payments/1/ticket',
                  },
                }
              : payment.payment_method.token === 'rejeitar'
                ? {
                    id: `PAY${n}`,
                    status: 'failed',
                    status_detail: 'rejected_insufficient_amount',
                    amount: payment.amount,
                    payment_method: { id: payment.payment_method.id, type: payment.payment_method.type },
                  }
                : {
                    id: `PAY${n}`,
                    status: 'processed',
                    status_detail: 'accredited',
                    amount: payment.amount,
                    payment_method: {
                      id: payment.payment_method.id,
                      type: payment.payment_method.type,
                      installments: payment.payment_method.installments,
                    },
                  }
          const order = {
            id,
            status: result.status,
            status_detail: result.status_detail,
            external_reference: body.external_reference,
            total_amount: body.total_amount,
            transactions: { payments: [result] },
            approveOnGet: body.payer?.first_name === 'APRO',
          }
          orders.set(id, order)
          return send(201, order)
        }
        const orderMatch = req.url.match(/^\/v1\/orders\/(\w+)$/)
        if (req.method === 'GET' && orderMatch) {
          const order = orders.get(orderMatch[1])
          if (!order) return send(404, { message: 'not found' })
          if (order.approveOnGet && order.status === 'action_required') {
            order.status = 'processed'
            order.status_detail = 'accredited'
            Object.assign(order.transactions.payments[0], { status: 'processed', status_detail: 'accredited' })
          }
          return send(200, order)
        }

        if (req.method === 'POST' && req.url === '/preapproval') {
          log.push({ type: 'preapproval', body })
          if (body.card_token_id === 'rejeitar') return send(400, { message: 'Invalid card_token_id' })
          const id = `pre${++n}`
          const pre = {
            id,
            status: 'authorized',
            external_reference: body.external_reference,
            next_payment_date: new Date(Date.now() + body.auto_recurring.frequency * 30 * 864e5).toISOString(),
            last_four_digits: '6351',
            auto_recurring: body.auto_recurring,
          }
          preapprovals.set(id, pre)
          return send(201, pre)
        }
        const preMatch = req.url.match(/^\/preapproval\/(\w+)$/)
        if (preMatch) {
          const pre = preapprovals.get(preMatch[1])
          if (!pre) return send(404, { message: 'not found' })
          if (req.method === 'PUT' && body.status) pre.status = body.status
          return send(200, pre)
        }
        return send(404, { message: 'not found' })
      })
    })
    .listen(port, '127.0.0.1')
}
