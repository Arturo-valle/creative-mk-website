# Auditoría del material original y su presentación

Revisión del 29 de septiembre de 2026 a partir de la captura que señala la pantalla del portátil

## Conclusión

La falta de detalle de la pantalla del portátil está presente en el reel original. Se confirmó extrayendo un PNG del original a 10,3167 s y otro de la apertura a 1 s. Ambos muestran el mismo desenfoque. La exportación a mayor calidad conserva ese defecto; no lo corrige. La corrección anterior solucionó reducciones y compresión adicionales, pero no cerró el problema visual de la apertura.

Además, la portada amplía el original Full HD para llenar ventanas anchas y recorta mediante object-fit:cover. A 2491 px de ventana, la apertura amplía el video de 1920 px un 30 %. No podemos inferir el DPR o zoom exactos del usuario a partir del archivo adjunto; esta es una reproducción de laboratorio a ese ancho.

## Comprobación de la publicación

Los ocho MP4 y sus ocho carátulas publicados coinciden byte a byte (SHA-256) con los archivos locales actuales. No hay evidencia de una recompresión adicional de Cloudflare en estos archivos. Los estilos calculados de todos los reproductores indican filter:none y no aplican desenfoque. La capa oscura del hero reduce luminosidad/contraste, pero no explica el desenfoque que ya existe en el original.

## Inventario y decisión

| Pieza | Fuente actual | Diagnóstico | Medida indicada |
|---|---|---|---|
| opening.mp4 | 1920 × 1080, derivado del reel | Desenfoque incorporado en la escena del portátil; ampliación adicional en pantallas grandes | Sustituir por un original nítido, preferentemente 4K nativo, con encuadre específico de móvil |
| reel.mp4 | 1920 × 1080 | Incluye la misma escena; en ventana de 2491 px se muestra a 2315 px, ampliación 21 % | Sustituir esa escena en el master o mantener el reel en una superficie menor; el resto debe evaluarse por escena |
| contour-es.mp4 / contour-en.mp4 | 2560 × 1600 desde capturas PNG | El déficit anterior de 1280 px se corrigió; a 2491 px/DPR1 se reduce, no se amplía | Mantener; para pantalla completa 4K, recapturar a esa resolución si se exige nitidez nativa |
| intake-es.mp4 / intake-en.mp4 | 2560 × 1600 desde capturas PNG | Mismo caso que contornos; interfaces legibles en la captura actual | Mantener; evitar magnificación por encima de la captura nativa |
| identity.mp4 | 1536 × 1024, animación de mockup | Resolución suficiente para su columna en los escenarios medidos; límite al ampliar a pantalla completa | Usar un master mayor si se quiere ver a pantalla completa |
| billboard.mp4 | 1536 × 1024, animación de mockup | Igual límite; texto del cartel definido a tamaño nativo, entorno con menor detalle | Master mayor para ampliaciones; no exportar a 4K esperando detalle nuevo |
| Carátulas de los ocho videos | Misma resolución que su video | Ya no se reducen a 960 px; apertura/reel heredan la falta de nitidez de sus fotogramas | Sustituir junto con la escena de origen |
| digital-editorial.png | 1536 × 1024 | Imagen ilustrativa de IA con fondo suave y elementos de interfaz no destinados a lectura; no es captura de producto | Si se necesita demostrar calidad de una interfaz, usar una captura real y legible |
| print-editorial.png | 1536 × 1024 | Foco selectivo: papel central con detalle, fondo y primer plano suaves | Mantener solo si se acepta esa intención fotográfica; sustituir si se quiere toda la escena enfocada |
| logo.webp | 640 × 103 y variantes 1x/2x/3x | La mejora de densidad anterior cubre el tamaño mostrado | Mantener; un SVG original sería preferible para escalabilidad ilimitada |

## Densidad y recorte

| Escenario | Apertura | Reel | Capturas de interfaces | Mockups |
|---|---:|---:|---:|---:|
| Ventana 2491 px, DPR1 | 1,30× | 1,21× | 0,90× | 0,74× |
| Ventana 1440 px, DPR2 | 1,59× | 1,36× | 1,02× | 0,83× |
| Ventana 390 px, DPR3, altura 978 | 2,33× | 0,54× | 0,41× | 0,68× |

Un factor mayor que 1 implica ampliar por encima de los píxeles disponibles. La apertura móvil es particularmente desfavorable porque un video horizontal debe cubrir una sección vertical alta. Los números proceden del tamaño real de la caja y de object-fit, no solo del ancho nominal del archivo.

## Lo que la resolución nominal no demuestra

El original del reel es 1920 × 1080 a 60 fps, con aproximadamente 2,05 Mb/s de video. Esa cifra describe el archivo, pero no permite atribuir todo el desenfoque exclusivamente al bitrate: el PNG extraído muestra que la pantalla ya carece de detalle en el material disponible. Sin el master previo no se puede separar con certeza enfoque, procesamiento del material y compresión histórica.

La apertura también ralentiza un fragmento de 1,7 segundos unas 4,7 veces y lo entrega a 30 fps. Eso genera fotogramas repetidos y puede restar fluidez, aunque no es la causa principal del desenfoque señalado.

## Corrección prioritaria

Reemplazar la escena de apertura y su equivalente en el reel por material nítido de origen, revisado al 100 % antes de integrarlo. Preparar una versión horizontal y otra vertical para no extraer una franja estrecha del mismo video. El resto requiere decisiones específicas; no hay evidencia de que todos los archivos estén llegando a baja resolución.

No se ha sustituido material ni publicado un nuevo despliegue en esta auditoría. La selección de una escena realmente nítida sigue pendiente; no se presenta un aumento de dimensiones o bitrate como solución al enfoque.

Evidencia: media-source-audit.json; scripts/audit-home-source.mjs; shots/media-source-audit/original.png y opening.png. Los fotogramas de diagnóstico se extrajeron sin pérdida adicional a PNG.
