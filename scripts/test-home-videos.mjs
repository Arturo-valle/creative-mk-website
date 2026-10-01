import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs';
const base='http://127.0.0.1:4176';
const report={date:new Date().toISOString(),runs:[]};
const browser=await chromium.launch({headless:true});
try{
 for(const lang of ['es','en']){
  const context=await browser.newContext({viewport:{width:390,height:844},reducedMotion:'reduce'});const page=await context.newPage();const requested=[];
  page.on('request',r=>{if(/\.mp4(?:\?|$)/.test(r.url()))requested.push(r.url());});
  await page.goto(base+(lang==='es'?'/es/':'/'),{waitUntil:'networkidle'});
  assert.equal(await page.locator('video').count(),6);assert.equal(requested.length,0,'No video data may download before playback');
  for(const v of await page.locator('video').all()){
   assert.equal(await v.getAttribute('preload'),'none');assert.notEqual(await v.getAttribute('controls'),null);assert.equal(await v.evaluate(v=>v.paused&&v.muted&&!v.autoplay),true);
   const src=await v.locator('source').first().getAttribute('src');const range=await fetch(base+src,{headers:{Range:'bytes=0-127'}});assert.equal(range.status,206);assert.equal((await range.arrayBuffer()).byteLength,128);assert.match(range.headers.get('content-range'),/^bytes 0-127\//);
   const caption=await v.locator('track').getAttribute('src');const captions=await fetch(base+caption);assert.equal(captions.status,200);assert.match(captions.headers.get('content-type'),/text\/vtt/);
   await v.scrollIntoViewIfNeeded();await v.evaluate(async v=>{await v.play();});await page.waitForFunction(src=>{const v=[...document.querySelectorAll('video')].find(v=>v.querySelector('source').getAttribute('src')===src);return v.currentTime>.15;},src);
   await v.evaluate(v=>new Promise((resolve,reject)=>{v.addEventListener('seeked',resolve,{once:true});v.addEventListener('error',()=>reject(new Error('Video seek failed')),{once:true});v.currentTime=Math.min(2,v.duration/2);}));assert.equal(await v.evaluate(v=>v.error===null&&v.readyState>=2),true);
   await v.evaluate(v=>v.pause());
  }
  const hero=page.locator('.hero-motion');await hero.scrollIntoViewIfNeeded();await page.locator('[data-hero-toggle]').click();await page.waitForTimeout(250);assert.equal(await hero.evaluate(v=>v.paused),false,'Opening button plays');await page.locator('[data-hero-toggle]').click();assert.equal(await hero.evaluate(v=>v.paused),true,'Opening button pauses');await hero.focus();await page.keyboard.press('Space');await page.waitForTimeout(300);assert.equal(await hero.evaluate(v=>v.paused),false,'Native keyboard play');
  await page.locator('#capabilities').scrollIntoViewIfNeeded();await page.waitForTimeout(250);assert.equal(await hero.evaluate(v=>v.paused),true,'Offscreen video pauses');
  await page.locator('.reel-section').scrollIntoViewIfNeeded();const reel=page.locator('.reel-section video');await reel.evaluate(v=>v.play());const contour=page.locator('.case video').first();await contour.evaluate(v=>v.play());assert.equal(await reel.evaluate(v=>v.paused),true,'Only one video plays');await contour.evaluate(v=>v.pause());
  await page.screenshot({path:`shots/home-astro-video/${lang}-players.png`,fullPage:true});report.runs.push({lang,videos:6,noInitialVideoDownload:true,range:true,captions:true,playback:true,seeking:true,keyboard:true,pauseOffscreen:true,oneAtATime:true});await context.close();
 }
 const bad=await fetch(base+'/home-astro/media/reel.mp4',{headers:{Range:'bytes=999999999-'}});assert.equal(bad.status,416);
 const context=await browser.newContext({javaScriptEnabled:false});const page=await context.newPage();await page.goto(base+'/es/');const video=page.locator('.reel-section video');await video.evaluate(v=>v.play());await page.waitForTimeout(350);assert.equal(await video.evaluate(v=>v.currentTime>0),true);report.noJsPlayback=true;await context.close();report.passed=true;
}catch(error){report.passed=false;report.failure=String(error);throw error;}finally{fs.writeFileSync('docs/home-astro/video-test-results.json',JSON.stringify(report,null,2));await browser.close();console.log(JSON.stringify(report,null,2));}
