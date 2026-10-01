import {chromium} from 'playwright';
import AxeBuilder from '@axe-core/playwright';
import fs from 'node:fs';
import assert from 'node:assert/strict';
import {gzipSync} from 'node:zlib';
const origin='http://127.0.0.1:4176';
const out='shots/home-astro';fs.mkdirSync(out,{recursive:true});
const report={date:new Date().toISOString(),viewports:[],accessibility:[],links:[],resilience:[],performance:[],requests:[],errors:[]};
const browser=await chromium.launch({headless:true});
try {
 for(const lang of ['en','es'])for(const width of [360,390,768,1440,1920]){
  const context=await browser.newContext({viewport:{width,height:width<700?844:1000},deviceScaleFactor:1,reducedMotion:'reduce'});
  const page=await context.newPage();
  page.on('pageerror',e=>report.errors.push(e.message));
  page.on('request',r=>{if(!r.url().startsWith(origin))report.requests.push(r.url());});
  const res=await page.goto(origin+(lang==='es'?'/es/':'/'),{waitUntil:'networkidle'});
  assert.equal(res.status(),200);
  await page.evaluate(async()=>{await document.fonts.ready;for(let y=0;y<document.body.scrollHeight;y+=600)window.scrollTo(0,y);});
  await page.locator('footer').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>Array.from(document.images).every(i=>i.complete));
  await page.evaluate(async()=>{await Promise.all([...document.images].map(i=>i.decode().catch(()=>{})));for(let y=0;y<document.body.scrollHeight;y+=500){window.scrollTo(0,y);await new Promise(r=>requestAnimationFrame(()=>requestAnimationFrame(r)));}});
  await page.evaluate(()=>window.scrollTo(0,0));
  const dom=await page.evaluate(()=>({lang:document.documentElement.lang,overflow:document.documentElement.scrollWidth>innerWidth,broken:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src),h1:document.querySelectorAll('h1').length,robots:document.querySelector('meta[name=robots]')?.content,alternates:[...document.querySelectorAll('link[rel=alternate]')].map(a=>a.hreflang),scripts:document.scripts.length,scroll:getComputedStyle(document.documentElement).scrollBehavior,animation:getComputedStyle(document.querySelector('.hero-motion')).animationName,clipped:[...document.querySelectorAll('h1,h2,h3,p,nav')].filter(el=>{const r=el.getBoundingClientRect();return r.left<-.5||r.right>innerWidth+.5;}).map(el=>el.textContent.slice(0,60))}));
  assert.equal(dom.lang,lang);assert.equal(dom.overflow,false);assert.deepEqual(dom.broken,[]);assert.deepEqual(dom.clipped,[]);assert.equal(dom.h1,1);assert.match(dom.robots,/noindex/);assert(dom.alternates.includes('en')&&dom.alternates.includes('es'));assert.equal(dom.scripts,1);assert.equal(dom.scroll,'auto');assert.equal(dom.animation,'none');
  report.viewports.push({lang,width,...dom});
  await page.screenshot({path:`${out}/${lang}-${width}.png`,fullPage:true});
  if(width===390||width===1440)await page.screenshot({path:`${out}/${lang}-${width}-hero.png`});
  if(width===390||width===1440){const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();report.accessibility.push({lang,width,violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>n.target)}))});assert.equal(axe.violations.length,0,JSON.stringify(axe.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>n.target)}))));}
  if(width===390){
   await page.keyboard.press('Tab');assert.equal(await page.locator(':focus').textContent(),lang==='es'?'Saltar al contenido':'Skip to content');
   const links=await page.locator('a[href]').evaluateAll(els=>[...new Set(els.map(a=>a.getAttribute('href')))]);
   for(const href of links){if(href.startsWith('#')){assert(await page.locator(href).count()>0);continue;}if(new URL(href,origin).origin!==origin)continue;const r=await fetch(new URL(href,origin),{method:'HEAD'});report.links.push({lang,href,status:r.status});assert.equal(r.status,200,href);}
   for(const link of await page.locator('a[href],video').all()){if(!await link.isVisible())continue;await link.focus();assert.equal(await link.evaluate(el=>getComputedStyle(el).outlineStyle),'solid');}
  }
  await context.close();
 }
 for(const lang of ['en','es']){
  const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844}});const page=await context.newPage();await page.route(/\.(webp|png|avif|jpg)(\?|$)/,route=>route.abort());await page.goto(origin+(lang==='es'?'/es/':'/'));assert(await page.locator('h1').isVisible());assert.equal(await page.locator('.contact-action').count(),1);assert.equal(await page.locator('a[href="#work"]').count(),1);assert.equal(await page.locator('html').getAttribute('lang'),lang);report.resilience.push({lang,javascript:false,images:false,essentialContent:true});await context.close();
 }
 const post=await fetch(origin+'/api/leads',{method:'POST',body:'preview-test'});assert.equal(post.status,405);
 const headers=await fetch(origin+'/contact.html',{method:'HEAD'});const csp=headers.headers.get('content-security-policy');assert(csp.includes("connect-src 'none'")&&csp.includes("form-action 'none'")&&csp.includes("frame-src 'none'"));assert.match(headers.headers.get('x-robots-tag'),/noindex/);report.preview={postStatus:post.status,csp,allPagesNoindex:true};
 for(const lang of ['en','es'])for(let run=1;run<=3;run++){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:2,isMobile:true,reducedMotion:'reduce'});const page=await context.newPage();const cdp=await context.newCDPSession(page);await cdp.send('Network.enable');await cdp.send('Network.setCacheDisabled',{cacheDisabled:true});await cdp.send('Network.emulateNetworkConditions',{offline:false,latency:150,downloadThroughput:4_000_000/8,uploadThroughput:1_000_000/8});await cdp.send('Emulation.setCPUThrottlingRate',{rate:4});
  await page.addInitScript(()=>{window.__vitals={lcp:0,cls:0};new PerformanceObserver(list=>{for(const e of list.getEntries())window.__vitals.lcp=e.startTime;}).observe({type:'largest-contentful-paint',buffered:true});new PerformanceObserver(list=>{for(const e of list.getEntries())if(!e.hadRecentInput)window.__vitals.cls+=e.value;}).observe({type:'layout-shift',buffered:true});});
  await page.goto(origin+(lang==='es'?'/es/':'/'),{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);await page.waitForTimeout(600);
  const result=await page.evaluate(()=>{const entries=[performance.getEntriesByType('navigation')[0],...performance.getEntriesByType('resource')];return {...window.__vitals,encodedBytes:entries.reduce((n,e)=>n+(e.encodedBodySize||0),0),javascriptBytes:entries.filter(e=>e.initiatorType==='script').reduce((n,e)=>n+e.encodedBodySize,0),resources:entries.map(e=>({name:e.name.split('/').pop(),bytes:e.encodedBodySize}))};});const inlineScript=await page.locator('script:not([src])').allTextContents();result.javascriptBytes+=gzipSync(Buffer.from(inlineScript.join('\n'))).length;report.performance.push({lang,run,...result});await context.close();
 }
 for(const lang of ['en','es']){const runs=report.performance.filter(r=>r.lang===lang);const median=key=>runs.map(r=>r[key]).sort((a,b)=>a-b)[1];assert(median('lcp')<=2500,`${lang} LCP ${median('lcp')}`);assert(median('cls')<=.1);assert(median('encodedBytes')<=1_500_000);assert(median('javascriptBytes')<=100_000);}
 assert.deepEqual(report.requests,[]);assert.deepEqual(report.errors,[]);
 report.passed=true;
 console.log(JSON.stringify({passed:true,viewports:report.viewports.length,axe:report.accessibility.length,performance:report.performance.map(({resources,...r})=>r)},null,2));
} catch(error){report.passed=false;report.failure=String(error);throw error;}finally{fs.writeFileSync('docs/home-astro/test-results.json',JSON.stringify(report,null,2));await browser.close();}
