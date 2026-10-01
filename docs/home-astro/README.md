# Creative MK — portada Astro

Versión publicada: https://creativemk.net/es/ (ES) y https://creativemk.net/ (EN). Rama de código: `codex/home-astro`.

La home usa Astro; las páginas interiores existentes se conservan. La cabecera muestra logo, idiomas y contacto. El video original se reproduce silenciado con controles.

El despliegue activo al guardar esta versión es `8b80ceb9-2990-45ab-8a7c-994119b5174e`. La versión anterior al cambio de diseño permanece en `f2516360-c7ca-4713-b5ad-025f6647b945`.

La entrega de GitHub incluye un ZIP con los archivos públicos exactos del despliegue activo y su manifiesto SHA256. Es la referencia para recuperar esta versión: reconstruir las páginas interiores con el código local puede producir diferencias respecto del sitio histórico. El ZIP no incluye Workers, bases de datos ni secretos.

## Arranque reproducible
Desde este worktree, con Node 24 y npm:
```powershell
npm ci
npm --prefix apps/home-astro ci
npm run build:home-astro
npm run preview:home-astro
```
El servidor permanece en primer plano hasta Ctrl+C. Escucha solo en `127.0.0.1:4176`. Si ya está arrancado, reutilizarlo; no hace falta abrir otro. El puerto 4175 pertenece a la propuesta anterior y no se modifica.

Con el servidor activo:
```powershell
npm run test:home-astro
```
La instalación de Chromium de Playwright debe estar disponible (`npx playwright install chromium` si faltara). Resultados en `test-results.json`, capturas en `shots/home-astro/` desde la raíz. `astro check` forma parte de la construcción.

Para iterar únicamente la home sin regenerar interiores:
```powershell
npm --prefix apps/home-astro run build
node scripts/combine-home-astro.mjs
```
La primera vez hace falta construir Eleventy. Su proceso existente puede actualizar los bundles de contacto y el histórico de auditoría como efectos de compilación; no son cambios del diseño Astro. No ejecutar esos comandos desde el worktree de la propuesta anterior.

## Arquitectura y límites
- `apps/home-astro`: aplicación estática independiente. Un componente de página, datos EN/ES tipados, CSS propio y recursos locales. Astro es el único framework nuevo. Un script mínimo coordina los videos, sin hidratación de frameworks.
- `dist`: salida original de Eleventy. `.home-astro-preview`: copia combinada para revisión. La combinación reemplaza solo `index.html` y `es/index.html`; todo recurso nuevo queda bajo `/home-astro/`.
- `combine-home-astro.mjs` comprueba SHA-256 de cada archivo original restante. Resultado en `merge-verification.json`.
- `preview-home-astro.mjs` entrega únicamente archivos y acepta GET/HEAD. POST y demás métodos responden 405. CSP prohíbe conexiones, formularios, marcos y recursos externos. Todas las respuestas llevan `X-Robots-Tag: noindex`; las nuevas portadas también incluyen meta robots.
- Los enlaces mantienen las páginas existentes. Formularios y agente de esas páginas no podrán contactar servicios mientras se navegue dentro de esta vista previa.
- No hay APIs nuevas, migraciones, credenciales, CMS ni cambios en el agente de producción.

## Investigación y dirección visual
Leer `research.md`, `design-brief.md` y `image-prompts.md`. El usuario rechazó las imágenes abstractas durante la implementación. La revisión audiovisual del 27 de septiembre añade seis reproductores; consultar `video-direction.md` y `video-validation.md`. Las fotografías de apoyo son escenas hiperrealistas ilustrativas, identificadas como generadas con IA. Las pantallas de casos son capturas propias; la identidad se presenta como mockups, no como instalaciones físicas realizadas.

## Protocolo de pruebas
- Chromium de Playwright, Windows local, caché de navegador deshabilitada en las mediciones de rendimiento.
- ES y EN en 360, 390, 768, 1440 y 1920 px. Capturas completas, imágenes decodificadas, comprobación de desborde y de títulos/párrafos/navegación fuera del viewport.
- axe WCAG 2 A/AA y 2.1 AA en 390 y 1440, ambos idiomas. Complemento: recorrido de teclado, foco visible, idioma, encabezado único, enlaces y alternativos.
- Movimiento reducido emulado: no hay animación y el desplazamiento es instantáneo. Pruebas separadas con JS deshabilitado y todas las imágenes bloqueadas. Los videos tienen controles nativos y reproducción automática silenciada al entrar en pantalla, salvo movimiento reducido o ahorro de datos.
- Protocolo móvil de laboratorio: 390 × 844 CSS px, DPR 2, CPU ×4, bajada 4 Mbps, subida 1 Mbps, latencia 150 ms, tres navegaciones nuevas por idioma sin desplazamiento; se toma la mediana. LCP y CLS por PerformanceObserver; bytes comprimidos desde Resource/Navigation Timing. El presupuesto JS incluye además el gzip del script inline. Se incluyen recursos lazy que el navegador decide anticipar. La medición termina después de networkidle, fuentes listas y 600 ms adicionales.
- Estos resultados corresponden a esta máquina y protocolo, no a usuarios reales ni a garantías de producción. CLS no incluye desplazamiento/interacción posterior; la matriz visual cubre el resto de la página.
- Hashes de interiores, POST 405, CSP y ausencia de solicitudes externas de la home verificados automáticamente.

## Publicación y recuperación
La publicación de esta versión fue aprobada y completada. Cloudflare Pages usa el proyecto `creative-mk-website`, rama de producción `main`, mediante carga directa. Un push a esta rama de GitHub no publica automáticamente.

Para restaurar el diseño anterior, seleccionar el despliegue `f2516360-c7ca-4713-b5ad-025f6647b945` en Cloudflare Pages y usar Rollback to this deployment. Para restaurar los archivos de esta entrega, usar su ZIP verificado.

Los scripts de publicación requieren OAuth de Wrangler y un manifiesto local. Estos registros, credenciales y respaldos locales se excluyen del repositorio. No ejecutar una publicación sin verificar el ID activo, crear el respaldo y revisar el candidato.
