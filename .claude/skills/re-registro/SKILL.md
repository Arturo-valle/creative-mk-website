---
name: re-registro
description: Re-puntúa el sitio completo con el Jurado de Ocho sobre capturas frescas y escribe el acta con dispersión en docs/taller/. Corre en las puertas (G2/G3/G4), el 20-oct, o cuando el score vigente esté caducado.
---

# /re-registro — el score honesto

1. Capturas frescas: `npm run build` si hace falta, `node scripts/shoot.mjs`.
2. Elige el SUBSET de jurado (≈12 capturas representativas del manifiesto: home EN/ES
   desktop+móvil PRM full, home motion, work, un servicio, contact, 404, lp) y los
   números públicos (score de contenido, critical path, nº páginas).
3. Lanza 8 agentes `jurado` EN PARALELO, uno por persona (tipografa, creative-dev,
   ux-auditor, motion, brand, editora, cansado, impresor), cada uno con el mismo subset
   + números. Cada uno devuelve su JSON.
4. **Agrega en código, no en un agente**: por criterio, media recortada (descarta la
   nota más alta y la más baja de las 8). Total = Design×0,4 + Usability×0,3 +
   Creativity×0,2 + Content×0,1. Calcula dispersión por criterio.
5. Escribe docs/taller/registro-YYYY-MM-DD.md: tabla de las 8 personas × 4 criterios,
   agregado recortado, total ponderado, criterios con desacuerdo > 2 puntos (señalados
   para lectura del dueño), y los comentarios de jurado.
6. Actualiza la línea «Registro» del contexto del taller (cola.md si procede).

Reglas: nunca compares contra el 5,3 viejo como si siguiera vivo — este acta lo
reemplaza. Nunca ajustes personas o pesos para subir el número.
