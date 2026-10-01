# Entrega audiovisual — 27 de septiembre de 2026

Vista previa: [español](http://127.0.0.1:4176/es/) · [inglés](http://127.0.0.1:4176/).

## Seis reproductores por idioma
| Pieza | Procedencia y tratamiento | Audio |
|---|---|---|
| Apertura, 8 s | Extracto fotográfico de producción del reel original, ralentizado y recortado. 1920 px de ancho, H.264 a 30 fps. | Sin audio |
| Reel, 13,3 s | Edición del archivo original: 4,2–5,8 s y 8,2–19,9 s. Se excluyen íntegramente los capítulos con +38 % sin respaldo. Full HD. El original de unos 20 s permanece intacto y enlazado. | Pista original conservada, silenciada inicialmente |
| Campo de contornos | Grabación real de la web propia y de su respuesta al cursor. Versiones ES/EN. | Sin audio |
| Agente | Grabación de la interfaz real, con conversación ficticia y respuesta interceptada localmente. Rótulo de demostración en el video. Versiones ES/EN. | Sin audio |
| Papelería | Movimiento de cámara sobre el mockup propio existente. Identificado como animación, no como rodaje. | Sin audio |
| Valla | Movimiento de cámara sobre el mockup propio existente. No afirma una instalación física real. | Sin audio |

No se descargó material de terceros ni se generaron nuevas escenas de ciencia ficción. La edición conserva el original y escribe archivos derivados en `apps/home-astro/public/home-astro/media/`. Las imágenes de apoyo permanecen en la portada.

## Comportamiento
Reproducción voluntaria con controles nativos. La apertura añade un botón grande de reproducir/pausar. Todos comienzan silenciados; el sonido del reel se activa desde sus controles. Un script pequeño pausa las otras piezas, pausa al salir de pantalla y al ocultar la pestaña, y detiene la reproducción si se activa movimiento reducido. No hay reanudación automática.

`preload=none`: cero solicitudes MP4 antes de reproducir. Las portadas estáticas y los textos se muestran inmediatamente. Sin JS siguen disponibles los controles nativos y los enlaces directos a los archivos; la coordinación entre reproductores requiere JS. Descripciones en texto y pistas WebVTT localizadas explican el contenido visual. El servidor local soporta solicitudes parciales HTTP 206 y rechaza rangos inválidos con 416.

## Validación final
- Astro: 0 errores, 0 avisos y 0 sugerencias.
- ES/EN en 360, 390, 768, 1440 y 1920 px, sin desbordamientos. Cuatro análisis axe sin infracciones detectadas.
- 36 comprobaciones de enlaces. Casos, servicios, contacto, archivos originales y derivados disponibles.
- Seis videos reproducidos y comprobados por idioma: carga voluntaria, búsqueda temporal, teclado, controles de apertura, pausa fuera de pantalla y reproducción exclusiva. También se comprobó reproducción con JS deshabilitado.
- Los 342 archivos interiores y recursos originales restantes siguen idénticos por SHA-256. Sin cambios en producción ni en la propuesta del puerto 4175.
- POST bloqueado, CSP sin conexiones a servicios y sin solicitudes externas de las portadas.

Protocolo móvil documentado en README: 390×844, DPR 2, CPU ×4, red 4 Mbps / 150 ms, caché desactivada, mediana de tres ejecuciones:

| Idioma | Carga inicial comprimida | JS comprimido (incluido inline) | LCP | CLS |
|---|---:|---:|---:|---:|
| EN | 337.244 bytes | 480 bytes | 748 ms | 0 |
| ES | 342.205 bytes | 480 bytes | 756 ms | 0 |

Los bytes de video se descargan después de la acción del visitante y no forman parte de esa carga inicial. El reel Full HD pesa aproximadamente 3,53 MB y la apertura 0,85 MB. Resultados de laboratorio, no garantías de campo. Datos completos: `test-results.json`, `video-test-results.json`, `merge-verification.json`.

## Reproducir las piezas
FFmpeg/ffprobe deben estar disponibles en PATH, además de las dependencias existentes y Chromium de Playwright. Para regenerar los registros de interfaz, servir primero la base Eleventy en otro terminal con `node scripts/preview-home-astro.mjs --legacy` (puerto 4177), y después:
```powershell
npm run record:home-videos
npm run build:home-videos
npm --prefix apps/home-astro run build
node scripts/combine-home-astro.mjs
```
Las capturas intermedias quedan en `shots/home-astro-video/` (ignoradas por Git). La grabación bloquea todo destino externo y responde las llamadas API con fixtures locales; nunca utiliza el agente de producción. La captura del agente no constituye una validación del modelo ni de sus respuestas reales.

Con el servidor 4176 activo:
```powershell
npm run test:home-videos
npm run test:home-astro
```

Las capturas de la comparación visual anterior corresponden a la propuesta fotográfica previa. Las actuales se regeneraron en `shots/home-astro/`; las pruebas específicas de reproducción guardan evidencia en `shots/home-astro-video/`.
