// Локальный сервер для проверки: node serve.js  →  http://localhost:8097
const http = require('http'), fs = require('fs'), path = require('path');
const types = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.png': 'image/png', '.webmanifest': 'application/manifest+json' };
http.createServer((req, res) => {
  let p = decodeURIComponent(req.url.split('?')[0]);
  if (p.endsWith('/')) p += 'index.html';
  const f = path.join(__dirname, p);
  if (!f.startsWith(__dirname)) { res.writeHead(403).end(); return; }
  fs.readFile(f, (e, buf) => {
    if (e) { res.writeHead(404).end('Not found'); return; }
    res.writeHead(200, { 'Content-Type': types[path.extname(f)] || 'application/octet-stream', 'Cache-Control': 'no-cache' }).end(buf);
  });
}).listen(process.env.PORT || 8097, () => console.log('http://localhost:' + (process.env.PORT || 8097)));
