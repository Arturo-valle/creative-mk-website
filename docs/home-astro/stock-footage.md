# Sustitución audiovisual — 29 septiembre 2026

La apertura anterior contenía desenfoque en el original. Se sustituye por un original fotográfico de Pressmaster, Pexels 3191752: https://www.pexels.com/video/a-person-working-on-a-laptop-computer-3191752/

Licencia consultada: https://www.pexels.com/license/ — uso comercial y modificación permitidos; sin atribuir respaldo ni representar a la persona como parte del equipo. El crédito visible identifica material ilustrativo.

Master: 3840 × 2160, 25 fps, 15,88 s, 20.136.166 bytes. SHA256: FDBACCB96807AE9BC46D410353F635F507296CF6F100FE68C0AED17E8C12583C

Archivo de origen: https://videos.pexels.com/video-files/3191752/3191752-uhd_3840_2160_25fps.mp4

Para reconstruir, guardar el original como .home-media-masters/pressmaster-3191752.mp4 y ejecutar node scripts/build-home-opening.mjs desde la raíz del worktree, con FFmpeg disponible.

Se usan los segundos 2–10 a velocidad real, H.264 CRF18. Escritorio conserva 3840 × 2160; móvil usa un recorte 1216 × 2160, sin ampliar píxeles. El reel conserva la banda sonora y reemplaza completamente la escena original 10–12 s por dos segundos de este material; su salida permanece Full HD, limitada a 1920 píxeles CSS de ancho. Los demás capítulos conservan su resolución original. El fondo del nuevo plano mantiene desenfoque óptico intencional; no se promete foco uniforme en toda la escena.

La vista previa conserva controles, pausa manual, reproducción automática silenciada al entrar en pantalla y respeto a movimiento reducido/ahorro de datos. Producción no se modifica.

Validación: 10 combinaciones de idioma/viewport, cuatro revisiones axe y pruebas de controles/autoplay pasan localmente. El video completo de apertura pesa 12.03 MB en escritorio y 4.88 MB en móvil; la calidad priorizada incrementa la transferencia con autoplay. El protocolo de rendimiento con movimiento reducido (video detenido) no mide esa transferencia y no demuestra el objetivo de 1.5 MB con autoplay. Las tres películas publicadas coinciden por SHA256 con los archivos locales. Publicación de revisión: 29608820; producción conserva f2516360.

## Revisión solicitada por el usuario

Se retira el plano de Pressmaster de la portada y del reel. El usuario prefiere su archivo original creative-mk-hero-desktop-sound.mp4: se publica completo, sin recodificar, 1920 × 1080, 19.95 s, 5.441.659 bytes y audio AAC. Apertura y reel publicados coinciden por SHA256 con el original. Revisión d8b570de; producción permanece intacta. Las especificaciones 4K y recorte vertical anteriores corresponden a una versión descartada.
