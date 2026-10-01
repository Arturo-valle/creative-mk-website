import {chromium} from 'playwright';
const browser=await chromium.launch({headless:true});
try {
 const page=await browser.newPage({viewport:{width:1440,height:1000},deviceScaleFactor:2,reducedMotion:'reduce'});
 await page.route('**/*',route=>new URL(route.request().url()).origin==='http://127.0.0.1:4177'&&route.request().method()==='GET'?route.continue():route.abort());
 await page.goto('http://127.0.0.1:4177/es/',{waitUntil:'networkidle'});
 await page.locator('.mk-concierge__fab').click();
 await page.locator('.mk-concierge__panel').waitFor({state:'visible'});
 await page.locator('.mk-concierge__panel').screenshot({path:'apps/home-astro/src/assets/intake.png'});
 console.log('Captured existing agent interface, no conversations submitted.');
} finally {await browser.close();}
