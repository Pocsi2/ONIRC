# Onirc — Sistema de movimiento

Fecha de revisión: 13 de agosto de 2026
Alcance: diario local estático publicado con GitHub Pages.

## Principios

| Principio | Uso en Onirc |
| --- | --- |
| Continuidad | La URL del calendario conserva mes, sueño y composición. Volver devuelve el foco a la perla de origen. |
| Profundidad | La atmósfera se mueve apenas; el calendario permanece estable y una memoria aparece como plano Ópalo. |
| Foco | Al seleccionar una perla, el paisaje temporal pierde prioridad sin desaparecer. |
| Transformación | La perla comparte `layoutId` con la memoria enfocada. |
| Feedback | Nube-cortina, botones, guardado, borrado y deshacer responden sin rebote ni espera. |

## Tokens semánticos

| Token | Valor | Uso |
| --- | ---: | --- |
| `--motion-instant` | 100 ms | Reduced motion y cambios esenciales |
| `--motion-fast` | 180 ms | Presión, hover, foco de material |
| `--motion-standard` | 340 ms | Controles y opacidad de contexto |
| `--motion-expressive` | 560 ms | Lámina de registro |
| `--motion-dream` | 820 ms | Perla → Memoria y retorno |
| `--motion-ambient-slow` | 24 s | Campo atmosférico |
| `--motion-ambient-slower` | 34 s | Deriva ambiental secundaria |

Las curvas `soft-out`, `soft-in`, `dream` y `material` están centralizadas en `src/lib/motion/tokens.ts`. Se priorizan `transform` y `opacity`; no se anima tamaño, posición de layout, blur masivo ni sombras grandes de forma continua.

## Secuencias aprobadas

### Perla → Memoria

1. La perla recibe input de botón y foco accesible.
2. El calendario reduce opacidad, conservando fecha y orientación.
3. La perla se expande hacia la superficie Ópalo.
4. Fecha, título y cuerpo se leen de inmediato.
5. Volver elimina `dream` de la URL y restaura foco sobre la misma perla.

La secuencia vive dentro de `/calendar?month=…&dream=…`; esto permite continuidad con exportación estática, incluso para IDs creados después del build.

### Nube-cortina y conservación

La nube desplaza su luz unos píxeles en hover/foco. En móvil la etiqueta permanece visible y un toque abre la composición. Guardar deposita la nueva perla en el mes correcto y muestra un mensaje breve; no hay confeti, modal de éxito ni bloqueo de lectura.

## Reduced motion

Con `prefers-reduced-motion: reduce` se eliminan deriva ambiental, transformaciones grandes y recorridos espaciales. Se preservan opacidad, foco, estados seleccionados, feedback de guardado y navegación por teclado.

## Presupuesto de rendimiento

- Dos gradientes ambientales animados como máximo; formas restantes inmóviles.
- Sin partículas, video, WebGL, canvas ni animación por estado continuo de React.
- `backdrop-filter` sólo sobre superficies elevadas pequeñas.
- El calendario funciona sin View Transitions del navegador; Motion controla el fallback local.
