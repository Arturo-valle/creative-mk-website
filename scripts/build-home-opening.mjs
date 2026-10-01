import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
const source='video/creative-mk-hero-desktop-sound.mp4';
const out='apps/home-astro/public/home-astro/media';
// Preserve the user's original pixels, frame rate, soundtrack and full sequence.
for(const name of ['opening','reel']){
 fs.copyFileSync(source,`${out}/${name}.mp4`);
 const poster=spawnSync('ffmpeg',['-hide_banner','-loglevel','error','-y','-ss','1','-i',source,'-frames:v','1','-quality','94',`${out}/${name}.webp`],{stdio:'inherit'});
 if(poster.status!==0)throw Error('Poster generation failed');
 const metadata=spawnSync('ffprobe',['-v','error','-show_entries','format=duration,size:stream=codec_name,width,height','-of','json',source],{encoding:'utf8'});
 if(metadata.status!==0)throw Error('Metadata extraction failed');
 fs.writeFileSync(`${out}/${name}.json`,metadata.stdout);
 for(const [lang,text] of Object.entries({es:'Reel original de Creative MK. Música instrumental y montaje conceptual de marca y tecnología; las cifras y escenas no son resultados de clientes.',en:'Original Creative MK reel. Instrumental music and a conceptual brand and technology montage; figures and scenes are not client results.'}))fs.writeFileSync(`${out}/${name}-${lang}.vtt`,`WEBVTT\n\n00:00:00.000 --> 00:00:19.950\n${text}\n`);
}
console.log('Original reel restored without re-encoding, including audio');
