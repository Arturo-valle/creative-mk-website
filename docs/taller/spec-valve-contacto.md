# Spec del turno — `valve.contacto`: unificación + luz de taller

Origen: plan §2.3 (la isla de contacto es la válvula de septiembre) + decisión del
dueño 2026-08-20 («opción C»: terminar la unificación **y** devolverle un gesto de
luz propio). Diagnóstico medido el 20-ago sobre el build local.

## El estado que se corrige

El repaint atómico del 18-ago (`41e8f04`) migró los **colores** de la isla al set
cerrado y eliminó su resplandor dorado — `radial-gradient(circle at 94% 8%,
rgba(232,200,64,0.28), transparent 28%)` — porque el oro brillante da 1,36:1 sobre
papel. Correcto y no se revierte. Pero dejó la isla **a medio camino**:

| Medido hoy | Debe ser |
|---|---|
| `--radius: 0` declarado, pero **18 border-radius hardcodeados** (26px, 14px, 12px, 8px, 999px) | Set cerrado: `0` · `999px` solo donde el pill es el primitivo del sitio · `50%` solo puntos |
| `font-family: Inter` **sin `@font-face`** → `document.fonts` no la tiene: compone en fuente del sistema | Inter variable cargada de verdad, como el sitio principal |
| Sin gesto propio: perdió el dorado y no ganó el lenguaje nuevo | Luz de taller sobre el pliego (abajo) |

## Parte 1 — Tipografía (el bug de fondo)

- Declarar `@font-face` de Inter en la isla apuntando al MISMO woff2 que sirve el
  sitio (`css/base.css` lo declara desde `fonts/inter-latin-variable.woff2`;
  confirmar la ruta pública real en `dist/` antes de escribirla).
- `font-weight: 100 900`, `font-display: swap`, y el mismo `unicode-range` que el
  sitio — copiado literal, no reinventado.
- `<link rel="preload">` en `contact-src/index.html`, igual que el sitio.
- **Evidencia exigida:** en el build servido, `[...document.fonts].some(f=>/inter/i.test(f.family))` debe ser `true`,
  y el `font-family` computado del h1 debe resolver a Inter y no a Segoe/system-ui.

## Parte 2 — Radios al set cerrado

- Mueren: `8px`, `12px`, `14px`, `clamp(16px,2vw,26px)` → `0` (mobiliario machinado).
- Sobreviven como `999px` SOLO los que el sitio también trata como pill: chips de
  selección, botón de envío, badges/píldoras de estado. Si dudas, `0`.
- `50%` solo en puntos/círculos reales (el anillo de progreso `0%`).
- El panel de solicitud: `0`. Es una plancha, no una tarjeta.

## Parte 3 — El gesto: **luz de taller sobre el pliego**

Legal sin enmienda: `direction.md` §5.3 admite el oro «as the specular in the
relief». Entra como LUZ sobre papel, nunca como color de interfaz.

Construye, en este orden de prioridad (si el tercero no sale con calidad, se queda fuera):

1. **Wash de luz rasante**: un gradiente direccional muy sutil sobre el papel del
   panel, entrando desde arriba-derecha (donde vivía el resplandor viejo). Es luz
   cálida sobre papel — derívala de los tokens existentes (`--gold`/`--ink` con
   alfa muy baja o `color-mix`), **cero hex nuevos**. Debe leerse como una hoja
   junto a una ventana, no como un degradado de SaaS.
2. **El filete que capta la luz**: el borde superior del panel se lee más claro
   donde pega la luz y se apaga hacia la sombra. Un filete de imprenta, 1px.
3. **Opcional — blind emboss del wordmark** en el papel del panel: relieve seco
   revelado por esa misma luz (sombra en dos direcciones + specular de oro a
   opacidad mínima). **Si queda como letterpress de plantilla, NO lo embarques.**
   Criterio: un impresor debe leerlo como huella seca, no como efecto CSS.

### Restricciones duras del gesto
- **Ningún ratio de contraste baja.** El texto vive sobre las zonas donde la luz no
  altera el fondo; comprueba los pares que toques.
- **PRM**: si algo se mueve, asienta a su estado final. Preferible: sin movimiento.
- **Coste cero de runtime**: CSS puro. Ni canvas, ni JS, ni librerías.
- **Cero hex nuevos, cero easings nuevos.** El oro brillante `#E8C840` sigue prohibido
  en esta página: no tiene campo oscuro donde ser legal.

## Fuera de alcance (NO tocar en este turno)
- El fallo ALTO de validación (input invisible de 1×1 con globo en inglés) — turno propio.
- `/es/contacto/` inexistente — decisión de rutas, turno propio.
- El tamaño de fuente 15,68px de los inputs — anotar en dudas si lo ves.
