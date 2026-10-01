# Revisión audiovisual — 27 de septiembre de 2026

El usuario solicita muchos videos y autoriza implementar la propuesta. Esta revisión sustituye la decisión anterior de excluir el reel. Se mantienen Astro, EN/ES, negro/dorado, interiores y aislamiento de producción.

Seis piezas: apertura de 8 segundos a partir de una escena fotográfica del reel; reel editado conservando el archivo original; grabación real del campo de contornos; demostración de la interfaz real del agente con respuestas locales ficticias; dos animaciones de mockups de identidad. No se presentan los mockups animados como rodajes reales. No se genera nuevo material de ciencia ficción.

Composición: apertura de ancho completo con botón de reproducción; reel protagonista inmediatamente después; cada proyecto integra un reproductor; las dos aplicaciones de identidad tienen movimiento. Las fotos editoriales de apoyo permanecen. Tipografía, paleta y retícula existentes se conservan.

Autocrítica: llenar la página con el mismo reel repetido sería redundante. Solo la apertura extrae una escena del reel; los demás clips tienen contenido y función distintos. Se omiten en el reel editado las dos escenas con +38% sin respaldo. El original no se modifica y sigue enlazado como archivo.

Controles nativos visibles, reproducción voluntaria, audio inicialmente silenciado, pausa al salir de pantalla, una sola pieza reproduciéndose a la vez, sin reinicios automáticos al volver. No se descarga ningún video hasta activar reproducción (`preload=none`). Se respeta movimiento reducido; sin JS los reproductores nativos y enlaces al archivo siguen funcionando. Las descripciones textuales dan una alternativa a la información visual.

La creación usa FFmpeg para edición/codificación y Playwright para grabar interfaces locales existentes. No requiere Remotion, un nuevo framework, un servicio de video ni despliegue. Las grabaciones bloquean conexiones externas; la demo del agente intercepta las solicitudes y responde con fixtures locales.
