import {chromium} from 'playwright';
import fs from 'node:fs';
fs.mkdirSync('shots/home-astro',{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 for(const width of [390,1440]){
  const context=await browser.newContext({viewport:{width,height:width===390?844:1000},reducedMotion:'reduce'});
  const page=await context.newPage();
  await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4175'&&route.request().method()==='GET'?route.continue():route.abort());
  await page.goto('http://127.0.0.1:4175/es/',{waitUntil:'networkidle'});
  await page.evaluate(()=>document.fonts.ready);
  await page.screenshot({path:`shots/home-astro/previous-${width}-hero.png`});
  await context.close();
 }
}finally{await browser.close();}
