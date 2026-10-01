import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const account='2a432f7e8d56266c9dd713199ecf5b47';
const project='creative-mk-website';
// Read the known Wrangler OAuth credential in memory; never persist it in the backup.
const config=fs.readFileSync(path.join(process.env.APPDATA,'xdg.config/.wrangler/config/default.toml'),'utf8');
const token=config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
if(!token)throw Error('Run wrangler login using the Creative MK account first.');
const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}/pages/projects/${project}`,{headers:{Authorization:`Bearer ${token}`}});
const data=await response.json();
if(!data.success)throw Error(`Cannot access the expected Pages project (${response.status}).`);
const p=data.result,d=p.canonical_deployment;
if(!p.domains.includes('creativemk.net')||d.environment!=='production'||d.latest_stage.status!=='success')throw Error('Unexpected production state');
const backup=path.join(root,'.home-releases',`backup-${d.id}-${Date.now()}`);
fs.mkdirSync(path.join(backup,'public'),{recursive:true});
const record={checked:new Date().toISOString(),account,project,domains:p.domains,productionBranch:p.production_branch,deployment:{id:d.id,url:d.url,created:d.created_on,commit:d.deployment_trigger.metadata.commit_hash,dirty:d.deployment_trigger.metadata.commit_dirty},scope:'Public file snapshot from immutable production URL. Cloudflare retained deployment is the exact rollback target; this crawl does not export Workers, secrets, or private configuration.',files:[],unavailable:[]};
const list=(dir,prefix='')=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);
const queue=list(path.join(root,'dist')).filter(f=>!f.startsWith('_')&&!f.endsWith('.map')).map(f=>'/'+f);
queue.push('/sitemap.xml','/robots.txt');
const seen=new Set();
async function download(route){
  const url=new URL(route,d.url);
  url.hash='';url.search='';
  if(url.origin!==new URL(d.url).origin||seen.has(url.pathname))return;
  seen.add(url.pathname);
  const res=await fetch(url,{signal:AbortSignal.timeout(30000)});
  const type=res.headers.get('content-type')||'';
  if(!res.ok){record.unavailable.push({path:url.pathname,status:res.status});return;}
  const bytes=Buffer.from(await res.arrayBuffer());
  let name=url.pathname.slice(1);
  if(!name||name.endsWith('/'))name+='index.html';
  else if(!path.posix.extname(name)&&type.includes('text/html'))name+='/index.html';
  if(type.includes('text/html')&&/\.(css|js|png|webp|mp4|woff2|svg|json|ico)$/i.test(name)){record.unavailable.push({path:url.pathname,status:'HTML fallback'});return;}
  const file=path.resolve(backup,'public',name);
  if(!file.startsWith(path.join(backup,'public')+path.sep))throw Error('Unsafe backup path');
  fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);
  record.files.push({path:name,bytes:bytes.length,sha256:crypto.createHash('sha256').update(bytes).digest('hex')});
  if(/text\/html|text\/css|xml/.test(type)){
    const text=bytes.toString();
    const refs=[...text.matchAll(/(?:src|href|poster)=["']([^"']+)["']|url\(["']?([^"')]+)|<loc>([^<]+)<\/loc>/gi)].map(m=>m[1]||m[2]||m[3]);
    for(const ref of refs){try{const next=new URL(ref,url);if(next.hostname==='creativemk.net')next.host=url.host;if(next.origin===url.origin&&!next.pathname.startsWith('/api/')&&!next.pathname.startsWith('/cdn-cgi/'))queue.push(next.pathname);}catch{}}
  }
}
while(queue.length){if(seen.size>1500)throw Error('Unexpected crawl size');await Promise.all(queue.splice(0,6).map(download));}
record.files.sort((a,b)=>a.path.localeCompare(b.path));
fs.writeFileSync(path.join(backup,'manifest.json'),JSON.stringify(record,null,2));
fs.writeFileSync(path.join(root,'docs/home-astro/production-backup.json'),JSON.stringify({...record,files:undefined,backup,downloadedFiles:record.files.length},null,2));
console.log(JSON.stringify({backup,deployment:record.deployment,downloadedFiles:record.files.length,unavailable:record.unavailable},null,2));
