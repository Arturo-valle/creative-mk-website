# Portada Astro — brief y revisión del plan

## Revisión explícita del 26 de septiembre de 2026
El usuario rechazó las tres composiciones abstractas generadas: parecían ciencia ficción. Se descartan. La dirección multimedia cambia a fotografía hiperrealista editorial de trabajo creativo: luz natural, manos, papel, herramientas y pantallas reales. Las escenas generadas se identifican como ilustrativas; no representan al equipo ni acreditan trabajos de clientes. Se mantienen Astro, alcance, logo y paleta.

## Preferencia editorial permanente

Por indicación expresa del usuario: los títulos y subtítulos de Creative MK no llevan punto final, tanto en español como en inglés. Se conservan los signos de interrogación cuando corresponden y la puntuación normal de los párrafos.

## Diseño antes de construir
Audiencia: empresas que necesitan conectar identidad, web y automatización. Trabajo de la portada: explicar la oferta, mostrar dos iniciativas propias verificables y facilitar el contacto.

Color: negro cálido #14120E, carbón #191712, marfil #EDE9E1, dorado #E8C840, oro oscuro #7A5C12. Space Grotesk para titulares, Inter para lectura y pies. Tipografía local y licencias OFL archivadas. Retícula amplia de doce columnas, márgenes fluidos 22–80 px. Separación de capítulos 80–140 px. Un titular expresivo, resto de la tipografía sobria.

Firma: un encuadre fotográfico de trabajo creativo a gran escala, seguido por dos capítulos visuales que muestran el software propio. La imagen y el trabajo ocupan más superficie que el discurso comercial. El dorado sirve para acciones y palabras clave.

Escritorio:
```
LOGO             Trabajo  Capacidades  Estudio   ES/EN   Contacto
┌──────────────── fotografía editorial ──────────────────────┐
│ Ideas que                     manos / materiales           │
│ dejan huella                                               │
│ Marca, web e IA.             Ver proyectos ↓                │
└────────────────────────────────────────────────────────────┘
Trabajo propio                     Introducción breve
┌──────────── captura real del proyecto web ──────────────────┐
└────────────────────────────────────────────────────────────┘
Nombre                 Problema + intervención      Ver caso ↗
┌──────────── captura real del agente ────────────────────────┐
└────────────────────────────────────────────────────────────┘
Identidad aplicada          [aplicación propia] [aplicación propia]
Exploración editorial       [foto ilustrativa] [foto ilustrativa]
Marca                       Web                             IA
                    Hablemos de tu proyecto ↗
```

Móvil: navegación visible compacta, logo/idioma arriba; foto y titular con contraste; capítulos verticales, imágenes sin texto incrustado esencial; contacto visible al final y en navegación. Sin carrusel ni dependencias de gestos.

```
LOGO                 ES/EN  Hablemos
Trabajo   Capacidades   Estudio
┌──────────────────────────────┐
│ Foto: manos y mesa de trabajo│
│                              │
│ Ideas que                    │
│ dejan huella.                │
│ Marca, web e IA              │
│ Explora nuestro trabajo ↓    │
└──────────────────────────────┘
Introducción al trabajo propio
[captura web a todo el ancho]
Caso / reto / intervención / ↗
[captura agente a todo el ancho]
Caso / reto / intervención / ↗
Identidad aplicada
[papelería]  (fila propia)
[valla]      (fila propia)
Exploración ilustrativa
[impresión]  (fila propia)
[digital]    (fila propia)
Marca ↗
Web ↗
IA ↗
¿Qué hacemos realidad contigo?
Iniciar un proyecto ↗
Logo / legales
```

Autocrítica: la escultura dorada inicial podría pertenecer a cualquier producto tecnológico. Se sustituye por un entorno de trabajo reconocible por petición del usuario. No se añaden contadores, premios o resultados comerciales sin evidencia. Los casos no necesitan numeración decorativa.

Movimiento: entrada breve de la imagen, nunca del contenido esencial; transiciones de enlaces y ampliación de imágenes solo al pasar el cursor. Desplazamiento nativo. Con movimiento reducido, sin animación ni scroll suave. Navegación y contenido disponibles sin JS.

## Contrato de cada sección
| Sección | Propósito / contenido | Recurso | Comportamiento |
|---|---|---|---|
| Apertura | Oferta de marca, web e IA, enlace al trabajo | Fotografía ilustrativa generada, con identificación visible | Foto estática, texto HTML, enlace ancla |
| Campo de contornos | Presentar el desarrollo visual del sitio propio | Captura del sitio propio, enlace al caso existente | Enlace normal |
| Agente de recepción | Explicar recepción y organización de consultas | Captura propia de la interfaz; sin conversaciones reales | Enlace normal; sin agente conectado |
| Identidad | Mostrar aplicaciones existentes del logo | Mockups del archivo propio, identificados como mockups | Imágenes adaptables |
| Exploración | Mostrar dirección editorial hiperrealista | Dos escenas ilustrativas generadas | Imágenes estáticas, sin atribución a clientes |
| Capacidades | Marca, sitios web, automatización IA | Texto localizado y enlaces existentes | Enlaces a páginas interiores |
| Contacto | Iniciar un proyecto | Destino de contacto existente | Vista previa impide envíos |

La primera propuesta y producción no cambian. La vista previa combinada es solo local, no indexable y sin conexiones a servicios externos. Publicación pendiente de aprobación expresa del diseño.
