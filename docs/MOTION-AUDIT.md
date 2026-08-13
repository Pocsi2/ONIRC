# Onirc — Auditoría de movimiento

Fecha: 13 de agosto de 2026
Veredicto global: conservar. El movimiento se redujo para servir contexto, no ornamento.

| Interacción | Función | Propiedades | Token | Input / fallback | Veredicto |
| --- | --- | --- | --- | --- | --- |
| Atmósfera | Profundidad | `transform`, opacidad | ambiental 24–49 s | Pasiva; se inmoviliza con reduced motion | Conservar, baja densidad |
| Botón material | Feedback | `transform`, fondo, sombra breve | fast | Ratón, toque y teclado; estado inmediato reducido | Conservar |
| Nube-cortina | Transformación | `transform` de luz | expressive | Botón de 44 px; etiqueta visible en móvil; opacidad reducida | Conservar |
| Cambio de mes | Continuidad | estado/URL, opacidad | standard | Botones etiquetados; sin movimiento amplio reducido | Conservar |
| Perla hover/foco | Foco | `scale`, opacidad | spring contenido / fast | Toque abre directamente; foco visible | Conservar |
| Perla → Memoria | Continuidad, foco, transformación | `layoutId`, `transform`, opacidad | dream | Botón/teclado; crossfade corto reducido | Prioridad máxima |
| Composición | Profundidad, feedback | opacidad, `transform` corto | expressive | Diálogo con foco atrapado; instantáneo reducido | Conservar |
| Guardar / deshacer | Feedback | opacidad, `translateY` corto | standard | `role=status`; contenido disponible sin animación | Conservar |

## Riesgos revisados

- No quedan partículas ni fondos de video.
- Las grandes áreas con blur son estáticas; la deriva sólo aplica `transform` a formas ambientales.
- La transición no depende de View Transition API ni de rutas dinámicas.
- Se validó reduced motion en E2E desktop y móvil.
