# Investigación aplicada — 26 de septiembre de 2026

## Decisiones técnicas
Las cifras de popularidad y actividad son una instantánea, no un ranking de calidad. Los datos consultados están en `repository-snapshot.json`. No se copió código de las referencias ni se instalaron sus editores.

| Repositorio / fuentes | Hallazgo | Aplicación y decisión |
|---|---|---|
| [Astro](https://github.com/withastro/astro), [islas](https://docs.astro.build/en/concepts/islands/), [imágenes](https://docs.astro.build/en/guides/images/) | HTML estático, interactividad opcional, procesamiento de imágenes en construcción. MIT; la API no identifica automáticamente el archivo de licencia compuesto. Release consultada 7.3.5. | Único framework nuevo. Dos rutas estáticas, contenido tipado, imágenes WebP y fuentes locales. No hay interacción que justifique una isla hidratada. |
| [Next.js](https://github.com/vercel/next.js), [imágenes](https://nextjs.org/docs/app/getting-started/images) | Componentes y dimensiones explícitas facilitan composición consistente y estabilidad visual. MIT. Release consultada 16.3.6. | Componentes y reservas de espacio en Astro; no se instala React/Next en la nueva aplicación. |
| [Webstudio](https://github.com/webstudio-is/webstudio), [galería](https://webstudio.is/gallery) | Organización visual, estilos reutilizables y adaptación a tamaños. Núcleo AGPL-3.0; animación opcional con condiciones comerciales separadas. Release consultada 0.301.0. | Tokens CSS y reglas adaptables propias. Sin copiar componentes ni instalar editor. |
| [GrapesJS](https://github.com/GrapesJS/grapesjs), [componentes](https://grapesjs.com/docs/modules/Components.html), [licencia real del núcleo](https://github.com/GrapesJS/grapesjs/blob/dev/packages/core/LICENSE) | Separación entre estructura, contenido y presentación. El LICENSE raíz remite al núcleo BSD-3-Clause. Release consultada 0.23.6. | Casos, capacidades y traducciones en un módulo tipado separado de la plantilla. Sin constructor visual. |
| [Dyad](https://github.com/dyad-sh/dyad), [licencia](https://github.com/dyad-sh/dyad/blob/main/LICENSE) | Ciclo de vista previa y revisión local. Apache-2.0 fuera de la carpeta pro, que tiene condiciones propias. Release consultada 1.16.0. | Rama independiente, comparación de capturas, cambios verificables. Sin integrar Dyad ni usar su código. |

## Referencias publicadas
Selección desde [Astro Showcase](https://astro.build/showcase/), [Next Showcase](https://nextjs.org/showcase/) y [Webstudio Gallery](https://webstudio.is/gallery). Observaciones de páginas publicadas, no afirmaciones sobre su implementación interna actual. Los ejemplos pueden haber migrado desde su inclusión en una galería.

| Sitio | Apertura / imágenes / narrativa | Tipografía, movimiento, móvil y contacto | Decisión |
|---|---|---|---|
| [Designcember](https://designcember.web.app/) · Astro | Universo ilustrado propio, calendario como objeto principal; gran densidad de imágenes. | Logotipo caligráfico destacado. La inspección detectó muchas imágenes y poca jerarquía h1/h2; adaptación móvil requiere cuidado. No es una referencia comercial de contacto. | Adoptar una dirección visual coherente; descartar densidad ornamental y preservar semántica. |
| [Ky Decker](https://ky.fyi/) · Astro | Presentación breve, teclado interactivo y proyectos propios visibles. | Texto negro expresivo; el móvil mantiene introducción y trabajo. Contacto secundario frente al portafolio. | Trabajo verificable temprano; no copiar el teclado ni añadir interacción sin propósito. |
| [Nike](https://www.nike.com/) · Next | Campaña visual a gran escala, titular corto y acción de compra concreta. | Tipo grande, acciones claras. Selector de país y carga tardía de recursos limitaron la inspección visual; móvil permite identificar mensaje/CTA. | Superficie visual amplia y una acción primaria. Sin copiar fotografías ni introducir selección de país. |
| [Netflix Jobs](https://jobs.netflix.com/) · Next | Narrativa de cultura, equipos y localizaciones; amplio uso multimedia en el DOM. | Pantalla de carga persistió en la sesión de inspección, también al cambiar tamaño. No se pudo validar la experiencia visual final. | Limitación explícita: referencia para jerarquía editorial, no para rendimiento. El nuevo contenido nunca espera una intro. |
| [Hope Design Studio](https://hopedesign.studio/) · Webstudio | Oferta concreta, casos de sitios y testimonios visibles en la estructura. | Fondo claro y título amplio; a 390 px no se detectó desborde horizontal. Contacto orientado a trabajar juntos. | Conectar proyecto con necesidad comercial; no trasladar testimonios o resultados ajenos. |
| [Dmytro Karaulov](https://dmytrokaraulov.com/) · Webstudio | Titular profesional de gran escala y proyectos nombrados, seguidos de biografía. | Tipografía negra contundente, fotografía pequeña, contacto persistente con icono. La inspección principal fue de escritorio. | Una decisión tipográfica fuerte y enlaces claros a casos; evitar reconocimientos que Creative MK no ha documentado. |

No se consideran aprobadas las métricas o el comportamiento móvil de una referencia cuya carga no pudo completarse. Esto no sustituye las pruebas de la implementación propia.

## Clay y Fantasy
Se reutilizó la investigación local existente en `research_home_multimedia/research_report.md`, `findings_clay.md`, `findings_fantasy.md` y sus capturas. Patrón común útil: demostrar trabajo pronto, tratar cada proyecto como un capítulo y dirigir el movimiento hacia el contenido. Para esta implementación: dos proyectos propios, superficies visuales grandes, desplazamiento nativo y versión estática equivalente. No se copian recursos, marcas, cifras o premios de estos estudios.

## Evidencia comercial y decisiones de contenido
- Casos: `src/_data/cases.js`, entradas `contour-field` e `intake-agent`, ambas marcadas `kind: self`. Resúmenes de problema e intervención; sin extrapolar ventas, conversiones o ahorro no medidos.
- Identidad: recursos del archivo local de marca, etiquetados como mockups; no afirmar impresión o instalación física real.
- Se omiten el reel provisional, resultados numéricos no respaldados y tarjetas genéricas de clientes.
- Se preservan los destinos de servicios, estudio, casos, contacto y legales del sitio base. EN y ES se resuelven al construir.
- El usuario reemplazó la dirección abstracta por fotografía hiperrealista durante el trabajo. El ajuste está documentado antes de integrar los recursos en `design-brief.md`.

## Inventario de recursos
| Recurso nuevo | Procedencia | Uso y limitaciones |
|---|---|---|
| `studio-editorial.png` | Generado con imagegen en esta tarea | Hero ilustrativo. No es personal real del estudio. |
| `print-editorial.png` | Generado con imagegen en esta tarea | Exploración editorial de impresión. No es un proyecto contratado. |
| `digital-editorial.png` | Generado con imagegen en esta tarea | Exploración editorial digital. Las pantallas no son evidencia de una interfaz entregada. |
| `contour.png` | Captura propia preexistente `creative-desktop-hero.png` | Evidencia visual del sitio existente. Mantiene idioma inglés visible por tratarse de una captura. |
| `intake.png` | Captura de la interfaz del código base servida localmente, servicios bloqueados | Evidencia del agente existente, sin enviar datos ni mostrar consultas de personas. Interfaz original en español. |
| `identity.webp`, `billboard.webp` | Archivo local `cretivemk-brand/public/brand/mockup-*-v2.webp` | Aplicaciones propias aportadas en el workspace, no fotografía de instalaciones reales. El archivo utiliza azul; la UI de la nueva home mantiene negro y dorado. Procedencia externa adicional no documentada; antes de publicar, comprobar derechos de los mockups si se adquirieron a terceros. |
| `logo.webp` | `Logos/logo-dark-gold.png` del repositorio | Logo conservado, recorte del margen transparente y reducción de tamaño. |
| Space Grotesk / Inter | Paquetes Fontsource variables, fuentes originales con licencia SIL OFL 1.1 | Se incluyen licencias completas en `licenses/`. Archivos servidos localmente. |

Los tres primeros conceptos abstractos se descartaron y no forman parte de la aplicación. Los originales generados permanecen en el directorio de imagegen; solo las nuevas fotografías se copiaron a la aplicación. No se han descargado imágenes de terceros para la nueva portada.
