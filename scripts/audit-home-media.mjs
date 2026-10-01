import fs from 'node:fs';
import {spawnSync} from 'node:child_process';
import sharp from 'sharp';
const before='shots/media-quality-before',after='apps/home-astro/public/home-astro/media';
const rows=[];
for(const file of fs.readdirSync(after).filter(f=>/\.(mp4|webp)$/.test(f))){
 const row={file};
 for(const [key,dir] of [['before',before],['after',after]]){
  const p=`${dir}/${file}`;
  if(file.endsWith('.mp4')){
   const probe=spawnSync('ffprobe',['-v','error','-select_streams','v:0','-show_entries','stream=width,height,r_frame_rate:format=duration,size','-of','json',p],{encoding:'utf8'});
   if(probe.status!==0)throw Error(`Cannot inspect ${p}`);
   const data=JSON.parse(probe.stdout);row[key]={...data.streams[0],bytes:Number(data.format.size),duration:Number(data.format.duration)};
  }else{const data=await sharp(p).metadata();row[key]={width:data.width,height:data.height,bytes:fs.statSync(p).size};}
 }
 rows.push(row);
}
const format=v=>`${v.width} × ${v.height} · ${(v.bytes/1048576).toFixed(2)} MiB`;
fs.writeFileSync('docs/home-astro/media-quality-audit.json',JSON.stringify({checked:new Date().toISOString(),files:rows},null,2));
fs.writeFileSync('docs/home-astro/media-quality-audit.md',`# Auditoría de nitidez multimedia

## Causas verificadas

La captura enviada coincide con las grabaciones de pantalla. A 1920 px de ventana, el reproductor de casos mide 1744 px: una carátula de 960 px se ampliaba 1,82 veces, y el video de 1280 px, 1,36 veces. En una pantalla de alta densidad, la insuficiencia aumenta. No era un fallo del texto HTML de la página nueva.

Las grabaciones anteriores pasaban por WebM comprimido y luego H.264 CRF 24. Las carátulas se extraían de ese video y se reducían otra vez a 960 px con calidad WebP 78. La suma de ampliación y compresiones sucesivas difuminaba letras y detalles.

Los mockups originales son de 1536 × 1024 (3:2), pero se renderizaban a 960 × 720 (4:3), perdiendo resolución y alterando la proporción. La apertura recortaba el original a 1920 × 820 y después object-fit:cover lo ampliaba para cubrir una sección de 960 px de alto. Las fotografías se limitaban a variantes de 1200 px. El logo carecía de variantes 2x/3x.

## Correcciones

- Capturas reales del navegador a 2560 × 1600, desde fotogramas PNG sin pérdida, con datos ficticios y conexiones interceptadas en la demostración del agente
- Carátulas de interfaces tomadas directamente del PNG, sin pasar por el video
- H.264 CRF 17, preset slow, y WebP 94 para conservar detalles; capturas de interfaz a 15 fps, escenas y mockups a 30 fps
- Mockups a 1536 × 1024 y proporción original 3:2, con un movimiento leve
- Apertura a 1920 × 1080 sin el recorte vertical previo
- Fotografías con variantes hasta sus 1536 px originales, calidad 90; logo con variantes de densidad 1x/2x/3x y calidad 95
- Títulos de la portada ES/EN sin punto final; preferencia registrada en el brief

## Inventario antes y después

| Archivo | Antes | Después |
|---|---|---|
${rows.map(r=>`| ${r.file} | ${format(r.before)} | ${format(r.after)} |`).join('\n')}

## Límites reales

El reel original es Full HD, H.264, aproximadamente 2,05 Mb/s de video. La nueva exportación evita más pérdida, pero no recupera textura que ya falta en el original ni lo convierte en 4K. Los mockups y las fotografías tienen un máximo nativo de 1536 px; ampliarlos por encima de ese tamaño no crea detalle. Para exigir nitidez nativa en pantalla completa 4K se necesitan masters mayores o nuevas capturas específicamente a 4K.

Los videos mantienen preload=none y reproducción voluntaria: mayor calidad aumenta el peso al reproducir, no implica descargar los MP4 al abrir la página. Las carátulas sí contribuyen a la carga inicial. Las pruebas de la versión anterior no certifican el rendimiento de esta revisión; consultar los resultados actualizados.

No se modificó producción. La publicación se limita a la vista previa. [API de imágenes de Astro](https://docs.astro.build/en/reference/modules/astro-assets/) documenta calidad, variantes y densidades empleadas.
`);
console.log(rows.map(r=>`${r.file}: ${format(r.before)} -> ${format(r.after)}`).join('\n'));
