#!/usr/bin/env node
/**
 * serve.mjs — servidor estático de dist/ con los MIME correctos (avif incluido).
 *
 * Existe porque `npx http-server` sirve .avif como application/octet-stream y
 * Chromium no decodifica: media vacía que NO está vacía en producción (artefacto
 * H6 del acta 2026-08-19). Un solo server para launch.json, Juez de Uso y humanos.
 *
 * Uso: node scripts/serve.mjs [--port=8137]
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const distArg = process.argv.find(a => a.startsWith('--dist='));
const DIST = distArg ? path.resolve(ROOT, distArg.split('=')[1]) : path.join(ROOT, 'dist');
const MIME = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript',
  '.mjs': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp',
  '.avif': 'image/avif', '.woff2': 'font/woff2', '.woff': 'font/woff',
  '.mp4': 'video/mp4', '.webm': 'video/webm', '.ico': 'image/x-icon', '.txt': 'text/plain',
  '.xml': 'application/xml', '.webmanifest': 'application/manifest+json', '.pdf': 'application/pdf',
};
const port = parseInt((process.argv.find(a => a.startsWith('--port=')) || '--port=8137').split('=')[1], 10);

http.createServer((req, res) => {
  const clean = decodeURIComponent((req.url || '/').split('?')[0]);
  let f = path.join(DIST, clean);
  if (clean.endsWith('/')) f = path.join(f, 'index.html');
  // Convención de Cloudflare Pages: /contact sirve contact.html (paridad con producción)
  if (!fs.existsSync(f) && fs.existsSync(f + '.html')) f = f + '.html';
  if (!fs.existsSync(f) || fs.statSync(f).isDirectory()) {
    const notFound = path.join(DIST, '404.html');
    res.writeHead(404, { 'content-type': 'text/html; charset=utf-8' });
    if (fs.existsSync(notFound)) fs.createReadStream(notFound).pipe(res); else res.end('404');
    return;
  }
  res.writeHead(200, { 'content-type': MIME[path.extname(f).toLowerCase()] || 'application/octet-stream' });
  fs.createReadStream(f).pipe(res);
}).listen(port, '127.0.0.1', () => console.log(`serve: dist/ en http://127.0.0.1:${port} (mimes correctos, avif incluido)`));
