import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const list=(dir,prefix='')=>fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?list(path.join(dir,e.name),prefix+e.name+'/'):[prefix+e.name]);
const hash=file=>crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
const backupRecord=JSON.parse(fs.readFileSync(path.join(root,'docs/home-astro/production-backup.json'),'utf8'));
const baseline=path.join(backupRecord.backup,'public');
if(!fs.existsSync(path.join(baseline,'index.html')))throw Error('Run npm run verify first.');
const release=path.join(root,'.home-releases',new Date().toISOString().replace(/[:.]/g,'-'));
fs.mkdirSync(release,{recursive:true});
fs.cpSync(baseline,path.join(release,'legacy-production-public'),{recursive:true});
const manifest={created:new Date().toISOString(),domain:'creativemk.net',project:'creative-mk-website',account:'2a432f7e8d56266c9dd713199ecf5b47',sourceCommit:execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim(),baselineStatus:backupRecord.scope,productionDeploymentId:backupRecord.deployment.id,outputs:{}};
const previewHeaders=`/*
  X-Robots-Tag: noindex, nofollow, noarchive
  Cache-Control: no-store
  X-Content-Type-Options: nosniff
  Referrer-Policy: no-referrer
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; font-src 'self' data:; media-src 'self'; connect-src 'none'; form-action 'none'; frame-src 'none'; object-src 'none'; base-uri 'self'; frame-ancestors 'none'
`;
for(const mode of ['production','preview']){
  execFileSync(process.execPath,[path.join(root,'apps/home-astro/node_modules/astro/bin/astro.mjs'),'build'],{cwd:path.join(root,'apps/home-astro'),env:{...process.env,HOME_RELEASE:mode},stdio:'inherit'});
  const astro=path.join(root,'apps/home-astro/dist');
  for(const f of list(astro))if(!['index.html','es/index.html'].includes(f)&&!f.startsWith('home-astro/'))throw Error(`Unscoped Astro output: ${f}`);
  const target=path.join(release,mode);
  fs.cpSync(baseline,target,{recursive:true});
  fs.cpSync(astro,target,{recursive:true});
  fs.copyFileSync(path.join(root,'dist/_headers'),path.join(target,'_headers'));
  if(mode==='preview'){
    fs.writeFileSync(path.join(target,'_headers'),previewHeaders);
    fs.writeFileSync(path.join(target,'robots.txt'),'User-agent: *\nDisallow: /\n');
    if(fs.existsSync(path.join(target,'_redirects')))throw Error('Review redirects before public preview.');
  }
  const allowed=new Set(['index.html','es/index.html',...(mode==='preview'?['_headers','robots.txt']:[])]);
  const checked=list(baseline).filter(f=>!allowed.has(f));
  for(const f of checked)if(hash(path.join(baseline,f))!==hash(path.join(target,f)))throw Error(`Legacy file changed: ${f}`);
  for(const f of ['index.html','es/index.html']){
    const html=fs.readFileSync(path.join(target,f),'utf8');
    if(html.includes('class="preview-note"')!==(mode==='preview')||html.includes('noindex, nofollow, noarchive')!==(mode==='preview'))throw Error(`Incorrect release mode: ${f}`);
    if(!html.includes('https://creativemk.net'))throw Error('Wrong canonical domain');
  }
  const files=list(target).map(f=>({path:f,bytes:fs.statSync(path.join(target,f)).size,sha256:hash(path.join(target,f))}));
  if(files.length>20000||files.some(f=>f.bytes>25*1024*1024))throw Error('Pages upload limit exceeded');
  manifest.outputs[mode]={unchangedLegacyFiles:checked.length,files};
}
fs.writeFileSync(path.join(release,'manifest.json'),JSON.stringify(manifest,null,2));
fs.writeFileSync(path.join(root,'docs/home-astro/release-status.json'),JSON.stringify({release,created:manifest.created,baselineStatus:manifest.baselineStatus,productionDeploymentId:manifest.productionDeploymentId,published:false,checks:Object.fromEntries(Object.entries(manifest.outputs).map(([k,v])=>[k,{files:v.files.length,unchangedLegacyFiles:v.unchangedLegacyFiles}]))},null,2));
console.log(`Prepared and verified: ${release}\nNo deployment performed.`);
