const fs = require('node:fs');
const http = require('node:http');
const path = require('node:path');
const { build, inputs, root } = require('./build');

const output = path.join(root, 'dist');
const types = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.ico': 'image/x-icon',
  '.txt': 'text/plain; charset=utf-8',
  '.webmanifest': 'application/manifest+json',
};

function fingerprint() {
  const entries = [];
  function visit(file) {
    if (!fs.existsSync(file)) {
      entries.push(`${file}:missing`);
      return;
    }
    const stat = fs.statSync(file);
    entries.push(`${file}:${stat.size}:${stat.mtimeMs}`);
    if (stat.isDirectory()) {
      for (const name of fs.readdirSync(file).sort()) {
        if (!name.startsWith('.')) visit(path.join(file, name));
      }
    }
  }
  for (const input of inputs) visit(path.join(root, input));
  return entries.join('\n');
}

function refreshIfChanged(state) {
  const next = fingerprint();
  if (next === state.current) return;
  build(output);
  state.current = next;
  state.version += 1;
  console.log('Website aktualisiert.');
}

function sendError(res, status, message) {
  res.writeHead(status);
  res.end(message);
}

function decodePathname(urlPath, res) {
  try {
    return decodeURIComponent(urlPath);
  } catch (error) {
    if (!(error instanceof URIError)) throw error;
    sendError(res, 400, 'Bad Request');
    return null;
  }
}

function resolveFile(pathname, res) {
  let file = path.resolve(output, `.${pathname}`);
  const relative = path.relative(output, file);
  if (relative.startsWith('..') || path.isAbsolute(relative)) {
    sendError(res, 403, 'Forbidden');
    return null;
  }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) {
    file = path.join(file, 'index.html');
  }
  const found = fs.existsSync(file) && fs.statSync(file).isFile();
  return { file: found ? file : path.join(output, '404.html'), found };
}

function sendVersion(req, res, version) {
  res.writeHead(200, { 'Content-Type': 'text/plain; charset=utf-8' });
  res.end(req.method === 'HEAD' ? undefined : String(version));
}

function sendFile(req, res, resolved, version) {
  const { file, found } = resolved;
  const type = types[path.extname(file).toLowerCase()] || 'application/octet-stream';
  res.writeHead(found ? 200 : 404, { 'Content-Type': type });
  if (req.method === 'HEAD') {
    res.end();
    return;
  }
  if (!type.startsWith('text/html')) {
    res.end(fs.readFileSync(file));
    return;
  }
  const html = fs.readFileSync(file, 'utf8');
  const reload = `<script>setInterval(async()=>{try{const r=await fetch('/__dev/version');if(r.ok&&await r.text()!==${JSON.stringify(String(version))})location.reload()}catch(error){console.error('Live reload failed:',error)}},1000)</script>`;
  res.end(html.includes('</body>') ? html.replace('</body>', `${reload}</body>`) : html + reload);
}

function handleRequest(req, res, state) {
  try {
    refreshIfChanged(state);
    const url = new URL(req.url, 'http://localhost');
    res.setHeader('Cache-Control', 'no-store');
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' });
      res.end();
      return;
    }
    if (url.pathname === '/__dev/version') {
      sendVersion(req, res, state.version);
      return;
    }
    const pathname = decodePathname(url.pathname, res);
    if (pathname === null) return;
    const resolved = resolveFile(pathname, res);
    if (resolved === null) return;
    sendFile(req, res, resolved, state.version);
  } catch (error) {
    console.error('Entwicklungsserver:', error);
    if (!res.headersSent) res.writeHead(500, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Entwicklungsserver: Fehler beim Erstellen oder Ausliefern der Website.');
  }
}

function createServer() {
  build(output);
  const state = { current: fingerprint(), version: 0 };
  return http.createServer((req, res) => handleRequest(req, res, state));
}

if (require.main === module) {
  const port = process.env.PORT === undefined ? 8080 : Number(process.env.PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error('PORT muss eine Portnummer zwischen 1 und 65535 sein.');
  }
  createServer().listen(port, '127.0.0.1', () => {
    console.log(`Entwicklungsserver: http://localhost:${port}`);
  });
}

module.exports = { createServer };
