// Imita os endereços do Neon num lugar só (localhost:54321), com CORS e cookies como no Neon
import http from 'node:http'

const routes = [
  { prefix: '/neondb/auth', port: 4000, strip: false },
  { prefix: '/neondb/rest/v1', port: 3001, strip: true },
]

export function startProxy(port = 54321) {
  http.createServer((req, res) => {
    res.setHeader('Access-Control-Allow-Origin', req.headers.origin || '*')
    res.setHeader('Access-Control-Allow-Credentials', 'true')
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,PATCH,DELETE,OPTIONS,HEAD')
    res.setHeader('Access-Control-Allow-Headers', req.headers['access-control-request-headers'] || '*')
    res.setHeader('Access-Control-Expose-Headers', 'Content-Range, Range, set-auth-jwt')
    res.setHeader('Vary', 'Origin')
    if (req.method === 'OPTIONS') { res.writeHead(204); return res.end() }
    if (req.url === '/health') { res.writeHead(200); return res.end('ok') }

    const route = routes.find((item) => req.url.startsWith(item.prefix))
    if (!route) { res.writeHead(404); return res.end('not found') }
    const upstream = http.request(
      { host: '127.0.0.1', port: route.port, method: req.method, path: route.strip ? req.url.slice(route.prefix.length) || '/' : req.url, headers: { ...req.headers, host: `127.0.0.1:${route.port}` } },
      (up) => {
        const headers = { ...up.headers }
        delete headers['access-control-allow-origin']
        delete headers['access-control-allow-credentials']
        res.writeHead(up.statusCode, headers)
        up.pipe(res)
      },
    )
    upstream.on('error', (error) => { res.writeHead(502); res.end(String(error)) })
    req.pipe(upstream)
  }).listen(port, '127.0.0.1')
}
