# Reproducción automática

Cambio solicitado por el usuario el 29 de septiembre de 2026, aplicado a las dos portadas de revisión

- Cada video comienza sin sonido cuando al menos el 20 % del reproductor entra en pantalla
- Los videos fuera de pantalla y los de una pestaña oculta se pausan
- La pausa manual se conserva aunque el visitante se desplace y vuelva al video
- Con movimiento reducido o ahorro de datos, la reproducción es manual
- Sin JavaScript o si el navegador bloquea autoplay, permanecen la carátula y los controles nativos
- Los dos mockups pueden reproducirse simultáneamente sin sonido cuando están visibles; la reproducción manual o activar sonido pausa los otros videos
- Se mantienen los bucles previamente definidos, sin repetir automáticamente los casos ni el reel al terminar

La reproducción automática requiere transferir el video visible. El objetivo anterior de carga inicial de 1,5 MB describía la versión manual: ya no debe presentarse como resultado de la experiencia automática. La apertura añade aproximadamente 2,28 MiB al iniciar; el resto de videos conserva preload=none y comienza a descargar al entrar en pantalla. No se redujo su resolución para compensar esa transferencia.

Pruebas: `scripts/test-home-autoplay.mjs` comprueba ES/EN, reproducción de los seis videos al entrar, silencio, pausa manual persistente, pausa fuera de pantalla, movimiento reducido, ahorro de datos simulado y rechazo de autoplay por el navegador simulado. Las pruebas existentes de controles y reproducción manual siguen aplicándose con movimiento reducido.

[Referencia de políticas de autoplay](https://developer.mozilla.org/en-US/docs/Web/Media/Guides/Autoplay)
