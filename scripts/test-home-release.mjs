import fs from 'node:fs';
import {chromium} from 'playwright';
import assert from 'node:assert/strict';
const base=process.env.HOME_TEST_ORIGIN||'https://home-astro-review.creative-mk-website.pages.dev';
const browser=await chromium.launch({headless:true});
const report={checked:new Date().toISOString(),base,pages:[],externalRequests:[],errors:[]};
try{
for(const locale of ['/','/es/'])for(const width of [360,390,768,1440,1920]){
 const context=await browser.newContext({viewport:{width,height:900}});
 const page=await context.newPage();
 page.on('request',r=>{if(!r.url().startsWith(base)&&!r.url().startsWith('data:'))report.externalRequests.push(r.url());});
 page.on('pageerror',e=>report.errors.push(e.message));
 const response=await page.goto(base+locale,{waitUntil:'networkidle'});
 assert.equal(response.status(),200);
 const headers=response.headers();
 assert.match(headers['x-robots-tag'],/noindex/);
 assert.match(headers['content-security-policy'],/connect-src 'none'/);
 assert.match(headers['content-security-policy'],/form-action 'none'/);
 const result=await page.evaluate(()=>({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,videos:document.querySelectorAll('video').length,brokenImages:[...document.images].filter(i=>i.complete&&!i.naturalWidth).length,preview:!!document.querySelector('.preview-note')}));
 const punctuated=await page.locator('h1,h2,h3').evaluateAll(nodes=>nodes.map(n=>n.textContent.trim()).filter(t=>t.endsWith('.')));
 assert.deepEqual(punctuated,[],'Headings must not end with a period');
 assert.equal(result.overflow,false);assert.equal(result.videos,6);assert.equal(result.brokenImages,0);assert.equal(result.preview,true);
 report.pages.push({path:locale,width,...result});
 if(width===390){const v=page.locator('video').first();await v.evaluate(el=>el.play());await page.waitForTimeout(500);assert.equal(await v.evaluate(el=>el.error),null);await v.evaluate(el=>el.pause());}
 await context.close();
}
const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(base+'/es/');assert.ok(await page.locator('h1').innerText());assert.equal(await page.locator('a[href="/contact.html?lang=es"]').count()>0,true);await context.close();
for(const route of ['/contact','/es/servicios/branding/','/es/trabajo/campo-de-contornos/','/es/trabajo/agente-de-recepcion/']){
 const res=await fetch(base+route);assert.equal(res.status,200);assert.match(res.headers.get('content-security-policy'),/form-action 'none'/);
}
const video=await fetch(base+'/home-astro/media/reel.mp4',{headers:{Range:'bytes=0-127'}});
report.videoRangeStatus=video.status;
assert.ok([200,206].includes(video.status));
const videoBytes=(await video.arrayBuffer()).byteLength;
if(video.status===206)assert.equal(videoBytes,128);else assert.equal(videoBytes,fs.statSync('apps/home-astro/public/home-astro/media/reel.mp4').size);
report.videoRangeNote=video.status===200?'Pages returned the complete MP4; local server supports 206. Playback verified; partial delivery not confirmed on Pages.':'Partial MP4 delivery verified.';
assert.deepEqual(report.externalRequests,[]);assert.deepEqual(report.errors,[]);
report.passed=true;
}finally{await browser.close();fs.writeFileSync('docs/home-astro/public-preview-tests.json',JSON.stringify(report,null,2));}
console.log('Public preview passed: both languages, five widths, native video playback, no-JS, CSP, no external requests. Range response: '+report.videoRangeStatus);
