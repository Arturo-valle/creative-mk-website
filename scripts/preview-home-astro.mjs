import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const dir = path.join(root, process.argv.includes('--legacy') ? 'dist' : '.home-astro-preview');
const port = process.argv.includes('--legacy') ? 4177 : 4176;
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css','.js':'text/javascript','.json':'application/json','.svg':'image/svg+xml','.png':'image/png','.jpg':'image/jpeg','.webp':'image/webp','.avif':'image/avif','.woff2':'font/woff2','.mp4':'video/mp4','.txt':'text/plain','.xml':'application/xml','.ico':'image/x-icon'};
const csp = "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self'; media-src 'self'; connect-src 'none'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'";
http.createServer((req,res)=>{
  res.setHeader('X-Robots-Tag','noindex, nofollow, noarchive');
  res.setHeader('Content-Security-Policy', csp);
  res.setHeader('Referrer-Policy','no-referrer');
  if (!['GET','HEAD'].includes(req.method)) {res.writeHead(405);res.end('Read-only preview');return;}
  let pathname;
  try {pathname=decodeURIComponent(new URL(req.url,'http://127.0.0.1').pathname);} catch {res.writeHead(400);res.end();return;}
  if (pathname.includes('\\') || pathname.includes('\0') || /(^|\/)\./.test(pathname)) {res.writeHead(403);res.end();return;}
  let file=path.resolve(dir,'.'+pathname);
  if (!file.startsWith(dir+path.sep) && file!==dir) {res.writeHead(403);res.end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)&&fs.existsSync(file+'.html'))file+='.html';
  if(!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end('Not found');return;}
  if(path.extname(file)==='.mp4'){
    const size=fs.statSync(file).size;
    res.setHeader('Content-Type','video/mp4');res.setHeader('Accept-Ranges','bytes');
    if(req.headers.range){
      const match=/^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      const start=match?(match[1]?Number(match[1]):Math.max(0,size-Number(match[2]))):NaN;
      const end=match?Math.min(match[1]&&match[2]?Number(match[2]):size-1,size-1):NaN;
      if(!Number.isSafeInteger(start)||!Number.isSafeInteger(end)||start>end||start>=size){res.writeHead(416,{'Content-Range':`bytes */${size}`});res.end();return;}
      res.writeHead(206,{'Content-Range':`bytes ${start}-${end}/${size}`,'Content-Length':end-start+1});
      if(req.method==='HEAD')res.end();else fs.createReadStream(file,{start,end}).pipe(res);return;
    }
    res.writeHead(200,{'Content-Length':size});if(req.method==='HEAD')res.end();else fs.createReadStream(file).pipe(res);return;
  }
  let body=fs.readFileSync(file);
  const type=path.extname(file)==='.vtt'?'text/vtt; charset=utf-8':mime[path.extname(file)]||'application/octet-stream';
  res.setHeader('Content-Type',type);
  res.setHeader('Cache-Control','no-store');
  if(/text|javascript|json|svg|xml/.test(type)&&/gzip/.test(req.headers['accept-encoding']||'')) {body=gzipSync(body);res.setHeader('Content-Encoding','gzip');res.setHeader('Vary','Accept-Encoding');}
  res.setHeader('Content-Length',body.length);
  res.writeHead(200);res.end(req.method==='HEAD'?undefined:body);
}).listen(port,'127.0.0.1',()=>console.log(`Read-only preview: http://127.0.0.1:${port}/es/ (${dir})`));
