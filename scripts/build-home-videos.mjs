import {spawnSync} from 'node:child_process';
import fs from 'node:fs';
const out='apps/home-astro/public/home-astro/media';fs.mkdirSync(out,{recursive:true});
const run=args=>{const result=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y',...args],{stdio:'inherit'});if(result.status!==0)throw Error('Video encoding failed');};
const encode=['-c:v','libx264','-preset','slow','-crf','17','-pix_fmt','yuv420p','-movflags','+faststart'];
await import('./build-home-opening.mjs');
for(const name of ['identity','billboard'])run(['-loop','1','-i',`apps/home-astro/src/assets/${name}.webp`,'-vf',"zoompan=z='1+0.0002*on':x='iw/2-iw/zoom/2':y='ih/2-ih/zoom/2':d=180:s=1536x1024:fps=30",'-t','6','-an',...encode,`${out}/${name}.mp4`]);
for(const lang of ['es','en'])for(const name of ['contour','intake'])run(['-framerate','15','-i',`shots/home-astro-video/${name}-${lang}-frames/%04d.png`,'-frames:v',name==='contour'?'90':'135','-an',...encode,`${out}/${name}-${lang}.mp4`]);
for(const name of ['opening','reel','identity','billboard','contour-es','contour-en','intake-es','intake-en']){
 const screen=/^(contour|intake)-/.test(name);
 // Use the lossless capture for screen posters, never a decoded compressed video.
 const input=screen?['-i',`shots/home-astro-video/${name}-frames/${name.startsWith('intake')?'0120':'0015'}.png`]:['-ss','1','-i',`${out}/${name}.mp4`];
 run([...input,'-frames:v','1','-quality','94',`${out}/${name}.webp`]);
 const metadata=spawnSync('ffprobe',['-v','error','-show_entries','format=duration,size:stream=codec_name,width,height','-of','json',`${out}/${name}.mp4`],{encoding:'utf8'});
 fs.writeFileSync(`${out}/${name}.json`,metadata.stdout);
}
console.log('Video renditions and posters ready.');
const descriptions={
 es:{opening:'Reel original de Creative MK. Material conceptual; no son resultados de clientes.',reel:'Montaje ilustrativo: paneles visuales, identidad, producción de contenidos y sistemas digitales. No son resultados de clientes.',identity:'Movimiento de cámara sobre un mockup de papelería de Creative MK. No es una filmación.',billboard:'Movimiento de cámara sobre un mockup de una valla de Creative MK. No representa una instalación real.',contour:'Grabación del sitio propio. El campo de contornos dorados reacciona al cursor.',intake:'Demostración local con datos ficticios. Una consulta sobre una web para un estudio de arquitectura recibe una respuesta de ejemplo que pregunta por el objetivo del visitante.'},
 en:{opening:'Original Creative MK reel. Conceptual material; not client results.',reel:'Illustrative montage: visual dashboards, identity, content production and digital systems. These are not client results.',identity:'Camera movement over a Creative MK stationery mockup. This is not filmed footage.',billboard:'Camera movement over a Creative MK billboard mockup. This does not depict a real installation.',contour:'Recording of our own website. The gold contour field reacts to the cursor.',intake:'Local demonstration with fictional data. An enquiry about an architecture studio website receives an example reply asking about the visitor’s next step.'}
};
for(const name of ['opening','reel','identity','billboard','contour-es','contour-en','intake-es','intake-en'])for(const lang of ['es','en'])fs.writeFileSync(`${out}/${name}-${lang}.vtt`,`WEBVTT\n\n00:00:00.000 --> 00:00:30.000\n${descriptions[lang][name.split('-')[0]]}\n`);
