import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base=process.env.HOME_TEST_ORIGIN||'http://127.0.0.1:4176';
const browser=await chromium.launch();
const report={checked:new Date().toISOString(),base,runs:[]};
try{
 for(const lang of ['es','en']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'no-preference'});
  const page=await context.newPage();const requests=[];
  page.on('request',r=>{if(r.url().includes('.mp4'))requests.push(r.url());});
  await page.goto(base+(lang==='es'?'/es/':'/'));
  await page.waitForFunction(()=>{const v=document.querySelector('.hero-motion');return !v.paused&&v.currentTime>0;});
  assert.ok(requests.every(url=>/opening(?:-mobile)?\.mp4/.test(url)),'Offscreen videos must not preload');
  assert.equal(await page.locator('.hero-motion').evaluate(v=>v.muted),true);
  await page.locator('[data-hero-toggle]').click();
  await page.locator('#capabilities').scrollIntoViewIfNeeded();
  await page.locator('.hero-motion').scrollIntoViewIfNeeded();
  await page.waitForTimeout(400);
  assert.equal(await page.locator('.hero-motion').evaluate(v=>v.paused),true,'Respect manual pause after scrolling back');
  for(const video of (await page.locator('video').all()).slice(1)){
   await video.scrollIntoViewIfNeeded();
   await page.waitForFunction(src=>{const v=[...document.querySelectorAll('video')].find(v=>v.querySelector('source').getAttribute('src')===src);return !v.paused&&v.currentTime>0;},await video.locator('source').first().getAttribute('src'));
   assert.equal(await video.evaluate(v=>v.muted),true);
  }
  await page.locator('#capabilities').scrollIntoViewIfNeeded();
  await page.waitForFunction(()=>[...document.querySelectorAll('video')].every(v=>v.paused));
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.locator('.reel-section video').scrollIntoViewIfNeeded();await page.waitForTimeout(300);
  assert.equal(await page.locator('.reel-section video').evaluate(v=>v.paused),true);
  report.runs.push({lang,autoplay:true,muted:true,offscreenPaused:true,manualPausePreserved:true,reducedMotion:true});
  await context.close();
 }
 for(const preference of ['reduce','save-data','blocked']){
  const context=await browser.newContext({reducedMotion:preference==='reduce'?'reduce':'no-preference'});
  if(preference==='save-data')await context.addInitScript(()=>Object.defineProperty(navigator,'connection',{value:{saveData:true,addEventListener(){}}}));
  if(preference==='blocked')await context.addInitScript(()=>{HTMLMediaElement.prototype.play=function(){return Promise.reject(new DOMException('Blocked','NotAllowedError'));};});
  const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/es/',{waitUntil:'networkidle'});
  assert.equal(await page.locator('video').evaluateAll(vs=>vs.every(v=>v.paused&&v.controls)),true);
  assert.deepEqual(errors,[]);await context.close();
 }
 report.passed=true;
}finally{await browser.close();fs.writeFileSync('docs/home-astro/autoplay-tests.json',JSON.stringify(report,null,2));}
console.log('Autoplay passed: ES/EN, all visible videos, muted, manual pause, offscreen pause, reduced motion, save-data and browser denial.');
