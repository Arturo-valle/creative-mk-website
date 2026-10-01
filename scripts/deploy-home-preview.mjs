import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const statusFile=path.join(root,'docs/home-astro/release-status.json');
const status=JSON.parse(fs.readFileSync(statusFile,'utf8'));
const manifest=JSON.parse(fs.readFileSync(path.join(status.release,'manifest.json'),'utf8'));
const target=path.join(status.release,'preview');
const branch='home-astro-review';
const config=fs.readFileSync(path.join(process.env.APPDATA,'xdg.config/.wrangler/config/default.toml'),'utf8');
const token=config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];
const api=`https://api.cloudflare.com/client/v4/accounts/${manifest.account}/pages/projects/${manifest.project}`;
async function project(){const res=await fetch(api,{headers:{Authorization:`Bearer ${token}`}});const data=await res.json();if(!data.success)throw Error('Expected account/project inaccessible');return data.result;}
const before=await project();
if(before.production_branch===branch||!before.domains.includes('creativemk.net')||before.canonical_deployment.id!==manifest.productionDeploymentId)throw Error('Production changed; refresh the backup before deploying.');
for(const f of manifest.outputs.preview.files){const bytes=fs.readFileSync(path.join(target,f.path));if(crypto.createHash('sha256').update(bytes).digest('hex')!==f.sha256)throw Error(`Release changed: ${f.path}`);}
const env={...process.env,CLOUDFLARE_ACCOUNT_ID:manifest.account};
delete env.CLOUDFLARE_API_TOKEN;
execFileSync(process.execPath,[path.join(root,'node_modules/wrangler/bin/wrangler.js'),'pages','deploy',target,`--project-name=${manifest.project}`,`--branch=${branch}`,'--commit-dirty=true'],{cwd:target,env,stdio:'inherit'});
const after=await project();
if(after.canonical_deployment.id!==before.canonical_deployment.id)throw Error('Unexpected production change. Inspect immediately.');
const url=`https://${branch}.${manifest.project}.pages.dev`;
fs.writeFileSync(statusFile,JSON.stringify({...status,previewPublished:true,previewUrl:url,productionUnchanged:true,published:false,checked:new Date().toISOString()},null,2));
console.log(`Preview: ${url}/es/\nProduction remains ${after.canonical_deployment.id}`);
