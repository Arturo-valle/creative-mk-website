# Investigación: Buenas prácticas técnicas y de CRO para landing pages de inicio de funnel

Fecha de investigación: 2026-08-09. Fuentes al final de cada sección.

---

## 1. Rendimiento: Core Web Vitals y su impacto en conversión

### Umbrales objetivo (Google)

| Métrica | Qué mide | Umbral "bueno" |
|---|---|---|
| LCP (Largest Contentful Paint) | Velocidad de carga del elemento principal | < 2.5 s (en 2026 Google endureció el objetivo hacia ~2.0 s) |
| INP (Interaction to Next Paint) | Capacidad de respuesta a interacciones | < 200 ms (ahora señal de ranking primaria) |
| CLS (Cumulative Layout Shift) | Estabilidad visual (saltos de layout) | < 0.1 |

- LCP es la métrica que más falla en la industria: solo pasa en ~62% de sitios móviles, frente a 77% (INP) y 81% (CLS). Solo el 48% de orígenes móviles y 56% de escritorio cumplen las tres a la vez (HTTP Archive, 2025).
- LCP es la métrica con la conexión más fuerte con la tasa de conversión, y falla sobre todo en móvil.

### Evidencia del impacto de velocidad en conversión

- **Rakuten 24 (2022)**: test A/B 50/50 de un mes con landing optimizada para Core Web Vitals vs. la original → **+53.4% de ingresos por visitante y +33.1% de tasa de conversión**.
- **Renault (Google, 2021)**: mejora de LCP en 10 millones de visitas → **bounce rate −14 puntos, conversiones +13%**.
- **Deloitte + Google ("Milliseconds Make Millions")**: una mejora de **0.1 s** en velocidad móvil produjo **+8.4% de conversiones retail y +9.2% de valor medio de pedido**.
- Test A/B controlado: una mejora del 31% en LCP produjo +8% de ventas totales, +15% de leads/visita y +11% de carritos/visita.

### Mobile-first

- El móvil representa ~60% del tráfico web global; una landing no optimizada para móvil pierde potencialmente más de la mitad de la audiencia.
- En móvil los CTA suelen quedar enterrados por mal layout, contraste pobre o tamaño insuficiente; el copy denso y difícil de escanear es el error de contenido más común.

Fuentes:
- https://cazyweb.com/research/website-performance-and-conversion-evidence/
- https://www.corewebvitals.io/core-web-vitals
- https://ideafueled.com/blog/core-web-vitals-2026-explained/
- https://launchcodex.com/blog/web-digital-infrastructure/core-web-vitals-guide/
- https://leadenforce.com/blog/why-your-mobile-landing-page-is-killing-conversions-and-how-to-fix-it

---

## 2. Formularios y captura de leads

### Número de campos vs. conversión

- Formularios de **1 campo convierten ~18.2%** (el máximo observado); caen a **13.0% con 2 campos** y **11.5% con 3 campos** (datos agregados tipo HubSpot/Neil Patel).
- Landings con **≤5 campos convierten ~120% mejor**; cada campo adicional a partir del quinto supone una **penalización del 20–30%** en conversión.
- **81% de los usuarios abandona un formulario a mitad** de completarlo — cada fricción cuenta.

### Formularios multi-paso (progressive disclosure)

- Los formularios multi-paso superan a sus equivalentes de una sola página en **~86%** de media, aun pidiendo más campos en total.
- Tasa de conversión media: **13.85% multi-paso vs. 4.53% de una sola página** (datos de Orbit/Instapage).
- Casos: **+35% BrokerNotes, +59% Vendio, +214%** (empresa de césped artificial) al pasar a multi-paso.
- Por qué funciona: el usuario no ve de golpe todo lo que se le va a pedir (menos intimidante), y el compromiso progresivo empuja a terminar. Regla práctica: empezar por las preguntas fáciles y de bajo compromiso; pedir email/teléfono al final.

### Reducción de fricción (checklist)

- Pedir solo lo imprescindible para el primer contacto (nombre + email, o incluso solo email).
- Etiquetas visibles (no solo placeholders), validación en línea, `autocomplete` e `inputmode` correctos en móvil.
- CTA con texto de valor ("Recibir mi propuesta") en vez de genérico ("Enviar").
- Indicador de progreso en multi-paso; guardar estado entre pasos.

Fuentes:
- https://ventureharbour.com/how-form-length-impacts-conversion-rates/
- https://neilpatel.com/marketing-stats/conversion-rate-by-form-fields/
- https://instapage.com/blog/multi-step-form-part-2
- https://orbitforms.ai/blog/multi-step-forms-conversion-rate
- https://www.klientboost.com/landing-pages/landing-page-forms/

---

## 3. A/B testing: fundamentos y herramientas asequibles

### Herramientas open-source / asequibles

- **GrowthBook** (open source): feature flags + experimentación, *warehouse-native* (analiza sobre tu propio warehouse: BigQuery, Snowflake, etc.). Buena opción si ya tienes analítica propia; se puede self-hostear gratis.
- **PostHog** (open source + cloud con capa gratuita generosa): analítica de producto + experimentos + session replays + feature flags en una sola plataforma. Ideal para equipos pequeños que quieren analítica y testing juntos sin coste inicial.
- Ambas permiten empezar sin licencias tipo Optimizely/VWO; PostHog Cloud suele ser el camino más rápido para un sitio pequeño, GrowthBook el más flexible si controlas tus datos.

### Buenas prácticas básicas

1. **Ejecutar primero un test A/A** para validar que el reparto de tráfico y la estadística funcionan correctamente.
2. **Una hipótesis clara por test** ("si cambiamos X, esperamos Y porque Z"), no cambios a ciegas.
3. Testear **cambios pequeños con frecuencia** para acumular aprendizaje, pero priorizar por impacto potencial.
4. Definir la métrica primaria antes de lanzar; no parar el test al primer resultado "significativo" (peeking).
5. Con poco tráfico: testear cambios grandes (rediseños de hero, oferta) porque las variaciones sutiles no alcanzarán significancia.

### Qué testear primero (orden típico de impacto)

1. **Titular / propuesta de valor** del hero (lo que más mueve la aguja).
2. **Oferta y CTA** (texto, valor percibido, un solo CTA vs. varios).
3. **Formulario** (número de campos, single vs. multi-paso).
4. **Prueba social** (presencia y ubicación de testimonios/logos).
5. Layout/imágenes del hero, longitud de página.

Fuentes:
- https://blog.growthbook.io/the-best-a-b-testing-platforms-of-2025/
- https://docs.growthbook.io/using/experimentation-best-practices
- https://posthog.com/docs/experiments/best-practices
- https://vwo.com/blog/open-source-ab-testing-tools/

---

## 4. Benchmarks de conversión por industria y errores comunes

### Benchmarks (2025–2026)

- **Mediana global: ~2.35–6.6%** según la fuente. WordStream: mediana 2.35%; top 25% ≥ 5.31%; **top 10% ≥ 11.45%**. Unbounce (674M visitas, 48k landings): media ~6.5%; mediana ~6.6%.
- Por industria (medianas orientativas):
  - Eventos y entretenimiento: **12.3%** (la más alta)
  - Servicios financieros: objetivo ≥ **8.4%**
  - Registro a webinars: **20–40%**
  - SaaS (free trial): **3–5%** (mediana de industria ~3.8%, la más baja)
  - E-commerce (página de producto): **2.5–3.5%**
- Referencia práctica: **≥10% se considera una landing muy buena** en casi cualquier industria; los top performers llegan a 15–20%.

### Errores comunes que matan la conversión

1. **Falta de message match**: el anuncio promete una cosa y la landing muestra otra → bounce alto, peor Quality Score, CPC más caro.
2. **Varios CTAs compitiendo** / navegación completa que fuga tráfico → un solo objetivo por landing.
3. **Above the fold sobrecargado**: debe tener un solo trabajo — titular claro + subtítulo de apoyo + 1 CTA + opcionalmente 1 señal de confianza.
4. **CTA enterrado o invisible en móvil** (poco contraste, tamaño pequeño, muy abajo). Colocarlo above the fold y repetirlo a lo largo de la página.
5. **Página lenta** (ver sección 1) y copy denso imposible de escanear en móvil.
6. **Pedir demasiados datos demasiado pronto** (ver sección 2).
7. **No testear nada**: decisiones por opinión en vez de por datos.

Fuentes:
- https://unbounce.com/conversion-benchmark-report/
- https://landerlab.io/blog/landing-page-conversion-rate
- https://backlinko.com/landing-page-stats
- https://www.seedprod.com/landing-page-conversion-rates/
- https://www.spaceads.agency/blog/landing-page-mistakes-that-kill-conversions
- https://whynotconverting.com/landing-page-not-converting

---

## 5. Señales de confianza (trust signals)

### Datos clave

- Los **testimonios de clientes aumentan la conversión ~34%**, pero solo el **23.2% de los marketers** los incluye en sus landings.
- **92% de los consumidores lee testimonios** antes de comprar; **85% confía en reseñas online tanto como en recomendaciones personales**.
- **Badges de confianza en checkout: +42%** de conversión de media (algunas implementaciones reportan lifts de hasta 400%).
- La **ubicación importa tanto como la señal**: colocar prueba social **justo debajo del botón CTA** ha producido incrementos de conversión de hasta **68%**. La misma señal puede subir la conversión en una página y bajarla en otra → testear ubicación.

### Checklist de confianza para una landing

- **HTTPS/SSL obligatorio** (candado visible; sin él, los navegadores marcan "no seguro" y la captura de leads muere).
- **Testimonios con nombre, foto y empresa** (los anónimos restan credibilidad); combinar valoraciones numéricas (rápidas de leer) con testimonios detallados (responden objeciones).
- **Logos de clientes / medios / certificaciones** cerca del hero o del CTA.
- **Política de privacidad enlazada junto al formulario** + microcopy tipo "No compartimos tu email" al lado del botón.
- Datos de contacto reales (dirección, teléfono) — señal de negocio legítimo.

### Accesibilidad básica (también es CRO)

- Contraste de color suficiente (WCAG AA: 4.5:1 en texto normal) — un CTA con poco contraste convierte menos y excluye usuarios.
- Etiquetas `<label>` reales en formularios, foco visible, navegable por teclado.
- Targets táctiles ≥ 44–48 px en móvil.
- Texto alternativo en imágenes y jerarquía de encabezados correcta (además ayuda al SEO).

Fuentes:
- https://www.flint.com/articles/landing-page-trust-signal-conversion-statistics
- https://www.digitalapplied.com/blog/social-proof-trust-signals-2026-conversion-placement-framework
- https://lineardesign.com/blog/trust-signals/
- https://www.saashero.net/design/landing-page-design-trust-signals/

---

## Resumen ejecutivo (aplicable a CreativeMk)

1. **Velocidad primero**: LCP < 2.5 s (ideal < 2.0 s), INP < 200 ms, CLS < 0.1, medido en móvil real. La evidencia (Rakuten +33% conversión, Deloitte +8.4% por 0.1 s) justifica invertir aquí antes que en cualquier rediseño.
2. **Formulario mínimo**: empezar con 1–3 campos; si se necesita cualificar leads, usar multi-paso (convierte ~86% mejor que el equivalente de una página) con las preguntas fáciles primero y el email al final.
3. **Un objetivo por landing**: message match con el anuncio/origen, un solo CTA repetido, above the fold con titular + subtítulo + CTA + 1 señal de confianza.
4. **Prueba social junto al CTA**: testimonios con nombre/foto y logos; enlazar privacidad junto al formulario.
5. **Medir y testear**: instalar PostHog (gratis para volúmenes bajos) o GrowthBook; validar con un test A/A y empezar testeando titular → oferta/CTA → formulario. Benchmark de éxito: superar el ~6.5% de mediana; ≥10% es excelente.
