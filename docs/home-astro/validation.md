# Validación inicial — versión fotográfica

Esta validación corresponde a la versión inicial del 26 de septiembre de 2026. La revisión con videos está documentada en `video-validation.md` y los JSON actuales. Los detalles reproducibles y resultados sin resumir están en `README.md`, `test-results.json` y `merge-verification.json`.

| Comprobación | Resultado |
|---|---|
| Astro check y construcción estática | 0 errores, 0 avisos de tipos; 2 páginas generadas |
| Eleventy y verificación existente | 0 errores, 45 avisos existentes de la base |
| Integración | 342 archivos originales restantes idénticos por SHA-256; solo se reemplazan las dos home |
| Viewports | EN/ES × 360, 390, 768, 1440, 1920; sin desborde horizontal ni texto fuera del viewport |
| Accesibilidad automática | 4 ejecuciones axe, 0 infracciones WCAG A/AA detectadas |
| Teclado | Enlace de salto, recorrido de enlaces y foco visible en ambos idiomas |
| Movimiento reducido | Animación desactivada y desplazamiento nativo instantáneo |
| Fallos de recursos | Mensaje, navegación y contacto disponibles con JS deshabilitado e imágenes bloqueadas |
| Rutas | 22 verificaciones de enlaces en ambos idiomas, HTTP 200; anclas presentes |
| Metadatos | Idioma, único h1, título/descripción, alternativos EN/ES y noindex |
| Privacidad de vista previa | Sin solicitudes externas en las home; POST 405; connect-src y form-action none; noindex en todas las respuestas |

## Rendimiento móvil de laboratorio
Mediana de tres ejecuciones por idioma, protocolo de 4 Mbps / 150 ms / CPU ×4, 390 × 844 px, DPR 2, caché desactivada. Recursos y medidas individuales en JSON.

| Idioma | Carga inicial comprimida | JS inicial | LCP | CLS |
|---|---:|---:|---:|---:|
| EN | 304.749 bytes | 0 bytes | 556 ms | 0 |
| ES | 304.914 bytes | 0 bytes | 564 ms | 0 |

Cumple los objetivos de 1,5 MB, 100 KB de JS, 2,5 s de LCP y 0,1 de CLS bajo este protocolo. No es medición de campo ni garantía de rendimiento de producción. axe tampoco sustituye una auditoría manual completa con lector de pantalla.

## Revisión visual y contenido
Se revisaron capturas de escritorio y móvil. Se corrigió el margen excesivo del archivo del logo y se eliminaron los conceptos abstractos rechazados. El recorte móvil conserva la escena de trabajo, el titular y la acción. Los casos enlazan a evidencia propia, sin nuevas cifras comerciales. Los mockups y las imágenes generadas están identificados.

Producción no fue modificada. La primera propuesta conserva sus cambios sin confirmar. Su servidor 4175 estaba detenido y se reanudó usando su script existente, sin reconstruir ni editar la propuesta.
