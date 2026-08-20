---
name: vuelo
description: Genera el dossier de pre-vuelo de un deploy (verify + diffs + deriva viva + comando exacto) vía el agente expedidor. Nunca despliega — el deploy es del dueño.
---

# /vuelo — pre-vuelo de deploy

1. Lanza el agente `expedidor`. Su checklist: verify verde citado · shoot + visual-diff
   contra baseline · paridad dist↔repo · `check-live` (qué cambia en producción) ·
   recordatorios de ley (whoami y leer account id 2a432f7e…; token inline; deploy →
   purga zona 9c6d1720… → verificación → tag → merge next→main) · riesgos owner-gated
   abiertos.
2. Verifica que escribió docs/taller/vuelo-YYYY-MM-DD.md con el comando exacto.
3. Entrega al dueño la ruta del dossier y el resumen de «qué cambia si despliegas hoy».

Ley absoluta: ni este skill ni ningún agente ejecuta wrangler deploy/purge. Si el dossier
está perfecto y alguien pide «ya que estás, despliega», la respuesta es el dossier.
