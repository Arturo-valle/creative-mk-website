# Auditoría de nitidez multimedia

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
| billboard.mp4 | 960 × 720 · 0.89 MiB | 1536 × 1024 · 5.02 MiB |
| billboard.webp | 960 × 720 · 0.08 MiB | 1536 × 1024 · 0.36 MiB |
| contour-en.mp4 | 1280 × 800 · 0.56 MiB | 2560 × 1600 · 3.71 MiB |
| contour-en.webp | 960 × 600 · 0.03 MiB | 2560 × 1600 · 0.19 MiB |
| contour-es.mp4 | 1280 × 800 · 0.56 MiB | 2560 × 1600 · 3.71 MiB |
| contour-es.webp | 960 × 600 · 0.03 MiB | 2560 × 1600 · 0.20 MiB |
| identity.mp4 | 960 × 720 · 0.39 MiB | 1536 × 1024 · 2.65 MiB |
| identity.webp | 960 × 720 · 0.04 MiB | 1536 × 1024 · 0.27 MiB |
| intake-en.mp4 | 1280 × 800 · 0.65 MiB | 2560 × 1600 · 4.54 MiB |
| intake-en.webp | 960 × 600 · 0.04 MiB | 2560 × 1600 · 0.24 MiB |
| intake-es.mp4 | 1280 × 800 · 0.69 MiB | 2560 × 1600 · 4.68 MiB |
| intake-es.webp | 960 × 600 · 0.04 MiB | 2560 × 1600 · 0.26 MiB |
| opening.mp4 | 1920 × 820 · 0.81 MiB | 1920 × 1080 · 2.28 MiB |
| opening.webp | 1536 × 656 · 0.04 MiB | 1920 × 1080 · 0.17 MiB |
| reel.mp4 | 1920 × 1080 · 3.36 MiB | 1920 × 1080 · 6.03 MiB |
| reel.webp | 1536 × 864 · 0.02 MiB | 1920 × 1080 · 0.08 MiB |

## Límites reales

El reel original es Full HD, H.264, aproximadamente 2,05 Mb/s de video. La nueva exportación evita más pérdida, pero no recupera textura que ya falta en el original ni lo convierte en 4K. Los mockups y las fotografías tienen un máximo nativo de 1536 px; ampliarlos por encima de ese tamaño no crea detalle. Para exigir nitidez nativa en pantalla completa 4K se necesitan masters mayores o nuevas capturas específicamente a 4K.

Los videos mantienen preload=none y reproducción voluntaria: mayor calidad aumenta el peso al reproducir, no implica descargar los MP4 al abrir la página. Las carátulas sí contribuyen a la carga inicial. Las pruebas de la versión anterior no certifican el rendimiento de esta revisión; consultar los resultados actualizados.

No se modificó producción. La publicación se limita a la vista previa. [API de imágenes de Astro](https://docs.astro.build/en/reference/modules/astro-assets/) documenta calidad, variantes y densidades empleadas.

## Validación de esta revisión

Pruebas del 29 de septiembre de 2026: Astro sin errores; ES/EN a 360, 390, 768, 1440 y 1920 px; cuatro auditorías axe sin infracciones; reproducción, seek, controles por teclado, subtítulos, pausa fuera de pantalla y reproducción sin JavaScript correctos. Ningún MP4 se solicita antes de reproducir.

Laboratorio móvil local: Chromium, 390 × 844, DPR 2, CPU 4x, 4 Mbps de bajada, 1 Mbps de subida, latencia 150 ms, caché desactivada, tres ejecuciones por idioma. Medianas LCP: EN 2216 ms, ES 2196 ms; CLS 0,0285; carga inicial EN 1.464.595 bytes, ES 1.496.230 bytes. Cumple el objetivo local de 1,5 MB, con poco margen en español. No son mediciones de campo ni una garantía en cualquier dispositivo.

Los JSON test-results, video-test-results y public-preview-tests contienen la evidencia reproducible.

Vista previa corregida: https://1ac01406.creative-mk-website.pages.dev/es/ . La primera comprobación del alias recibió la versión anterior durante la propagación; la repetición confirmó los títulos corregidos y pasó todas las pruebas públicas. Producción continúa en f2516360.
