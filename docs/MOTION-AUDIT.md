# Onirc — Auditoría de movimiento

Fecha: 13 de agosto de 2026
Estado: Release Candidate «Archivo de luz»

## Veredicto

El movimiento se conserva sólo cuando mantiene contexto, dirige la atención o confirma una consecuencia. La superficie visual se redujo: el calendario ya no utiliza tarjetas animadas por día y la atmósfera usa sólo dos desplazamientos lentos, basados en `transform`.

| Interacción | Principio | Propiedades | Token | Fallback | Veredicto |
| --- | --- | --- | --- | --- | --- |
| Atmósfera | Profundidad | `transform`, opacidad | 64–72 s efectivos | Inmóvil con reduced motion | Conservar, apenas perceptible |
| Navegación/material | Feedback | `transform`, color, sombra breve | fast | Estado de foco visible | Conservar |
| Nube-cortina | Transformación | pequeña traslación de luz | expressive | Etiqueta siempre visible y toque directo | Conservar |
| Cambio de mes | Continuidad | URL y estado; sin recorrido espacial | standard | Inmediato con reduced motion | Conservar |
| Perla | Foco | `scale`, opacidad | spring contenido | Foco visible y activación por teclado | Conservar |
| Perla → Memoria | Continuidad, foco, transformación | `layoutId`, `transform`, opacidad | dream | Crossfade breve | Prioridad máxima |
| Composer | Profundidad, transformación | opacidad, traslación corta | expressive | Sin traslación amplia | Conservar |
| Guardar / deshacer | Feedback | opacidad, `translateY` corto | standard | Anuncio de estado | Conservar |

## Hallazgos y correcciones

- **Movimiento ambiental:** la implementación anterior tenía tres masas y recorridos demasiado reconocibles. Ahora hay dos capas con composición de 64–72 segundos y baja opacidad.
- **Calendario:** cada fecha tenía una superficie propia; eso convertía un paisaje temporal en un conjunto de controles. Las fechas son ahora una trama de líneas silenciosas; la perla es la única presencia física.
- **Material:** Frost se reserva para navegación, controles y feedback. Ópalo aparece sólo al enfocar una memoria o al escribir. Perla sirve a la acción primaria.
- **Transición:** el detalle sigue en `/calendar?month=…&dream=…`. El origen se preserva, el fondo recede y el foco vuelve a la perla al cerrar.

## Riesgos revisados

- No hay partículas, video, WebGL, canvas, animación por scroll ni actualizaciones continuas de React.
- No se anima `filter`, `blur`, tamaño de layout ni sombras grandes de forma continua.
- `backdrop-filter` se limita a superficies pequeñas; el calendario funciona sobre el lienzo sin blur.
- El detalle no es una ruta dinámica ni depende de View Transition API; funciona en la exportación estática.
- La validación funcional manual confirmó crear → abrir → volver y restauración del foco de origen.
