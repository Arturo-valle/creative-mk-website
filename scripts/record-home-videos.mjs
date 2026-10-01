import {chromium} from 'playwright';
import fs from 'node:fs';
const out='shots/home-astro-video';fs.mkdirSync(out,{recursive:true});
const browser=await chromium.launch({headless:true});
try {
 for(const lang of ['es','en'])for(const kind of ['contour','intake']){
  // Capture actual device pixels as PNG frames; Playwright's video recorder
  // compresses the viewport before the final export and softens small type.
  const context=await browser.newContext({viewport:{width:1280,height:800},deviceScaleFactor:2,bypassCSP:true});
  const frames=`${out}/${kind}-${lang}-frames`;fs.mkdirSync(frames,{recursive:true});
  await context.addInitScript(lang=>{localStorage.setItem('creativeMkLang',lang);localStorage.setItem('mk-consent','denied');},lang);
  let calls=0;
  await context.route('**/*',async route=>{
   const req=route.request(),url=new URL(req.url());
   if(req.resourceType()==='fetch'||req.method()!=='GET'){
    if(url.pathname.endsWith('/chat')){calls++;await new Promise(r=>setTimeout(r,650));await route.fulfill({json:{reply:lang==='es'?'Ejemplo de demostración: podemos comenzar por un sitio que explique tus servicios. ¿Qué necesitas que haga el visitante?':'Demo example: we can start with a site that explains your services. What should the visitor do next?'}});return;}
    await route.fulfill({json:{}});return;
   }
   if(url.origin==='http://127.0.0.1:4177')await route.continue();else await route.abort();
  });
  const page=await context.newPage();await page.goto(`http://127.0.0.1:4177/${lang==='es'?'es/':''}`,{waitUntil:'networkidle'});await page.evaluate(()=>document.fonts.ready);
  // A recording slate is separate from the site interface and makes the local fixture explicit.
  await page.evaluate(({lang,kind})=>{const label=document.createElement('div');label.textContent=kind==='intake'?(lang==='es'?'DEMOSTRACIÓN LOCAL · DATOS FICTICIOS':'LOCAL DEMO · FICTIONAL DATA'):(lang==='es'?'CREATIVE MK · GRABACIÓN DEL SITIO PROPIO':'CREATIVE MK · RECORDING OF OUR OWN SITE');Object.assign(label.style,{position:'fixed',top:'88px',left:'24px',zIndex:'99999',background:'#14120e',color:'#ede9e1',padding:'12px 16px',font:'12px system-ui',border:'1px solid #7a5c12'});document.body.append(label);},{lang,kind});
  if(kind==='intake'){await page.locator('.mk-concierge__fab').click();await page.waitForTimeout(400);}
  const message=lang==='es'?'Necesito una web para un estudio de arquitectura.':'I need a website for an architecture studio.';
  const count=kind==='contour'?90:135;
  for(let frame=0;frame<count;frame++){
   if(kind==='contour')await page.mouse.move(640+390*Math.sin(frame/count*Math.PI*2),420+180*Math.cos(frame/count*Math.PI*2));
   else {
    if(frame>=15&&frame<15+message.length)await page.locator('.mk-concierge__input').pressSequentially(message[frame-15]);
    if(frame===70)await page.locator('.mk-concierge__send').click();
   }
   await page.screenshot({path:`${frames}/${String(frame).padStart(4,'0')}.png`});
  }
  if(kind==='intake'&&calls!==1)throw Error(`Expected one mocked chat request, received ${calls}`);
  await page.screenshot({path:`${out}/${kind}-${lang}.png`});
  await context.close();console.log(`Captured ${count} lossless 2560×1600 frames: ${kind}-${lang}; all API calls intercepted locally.`);
 }
}finally{await browser.close();}
