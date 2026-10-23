import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const dir = process.env.SITE_DIR || '/tmp/agritech-site';
const types = { '.js': 'text/javascript', '.css': 'text/css', '.html': 'text/html', '.svg': 'image/svg+xml' };
http.createServer((req, res) => {
  const p = new URL(req.url, 'http://x').pathname;
  let f = path.join(dir, p);
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) f = path.join(dir, 'index.html'); // SPA fallback
  res.writeHead(200, { 'content-type': types[path.extname(f)] ?? 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(Number(process.env.PORT || 4174), () => console.log('serving', dir));
