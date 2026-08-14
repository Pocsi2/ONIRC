# Onirc — Sistema de movimiento

Fecha de revisión: 13 de agosto de 2026
Alcance: Release Candidate «Archivo de luz»

## Principios

| Principio | Aplicación en Onirc |
| --- | --- |
| Continuidad | Mes, foco y composer viven en la URL del calendario. Volver devuelve el foco a la perla que originó la memoria. |
| Profundidad | La atmósfera está detrás; el calendario es estable; Ópalo aparece sólo para una memoria o para escribir. |
| Foco | Seleccionar una perla baja la prioridad del paisaje sin borrar el tiempo. |
| Transformación | La perla comparte `layoutId` con la memoria enfocada y se convierte en su origen visual. |
| Feedback | Los controles tienen respuesta material contenida; guardar y deshacer se anuncian sin celebración intrusiva. |

Una animación debe servir al menos uno de estos principios. Si no comunica continuidad, profundidad, foco, transformación o feedback, no se añade.

## Tokens semánticos

| Token | Valor | Uso |
| --- | ---: | --- |
| `--motion-instant` | 100 ms | Reduced motion y cambios esenciales |
| `--motion-fast` | 180 ms | Presión, hover y foco de material |
| `--motion-standard` | 340 ms | Controles y receso del contexto |
| `--motion-expressive` | 560 ms | Lámima de escritura y revelaciones breves |
| `--motion-dream` | 820 ms | Perla → Memoria y retorno |
| `--motion-ambient-slow` | 36 s | Reserva para campos atmosféricos |
| `--motion-ambient-slower` | 52 s | Deriva; con composición total de 64–72 s |

Las curvas `soft-out`, `soft-in`, `dream` y `material`, así como los resortes contenidos, viven en `src/lib/motion/tokens.ts`. Se priorizan `transform` y `opacity`.

## Secuencia firma: Perla → Memoria

1. La perla recibe foco mediante botón, toque o teclado.
2. El paisaje temporal pierde contraste y opacidad, pero mantiene el mes y la fecha visibles.
3. La perla usa el mismo `layoutId` al entrar en la cámara de memoria.
4. El título gana la jerarquía; fecha y narrativa llegan sin demoras decorativas.
5. Al volver, se elimina `dream` de la URL y el foco retorna a la perla original.

La secuencia vive en `/calendar?month=…&dream=…`, de modo que también funciona para memorias creadas después del build estático.

## Escritura en memoria

El composer revela su orden natural: **narrar → fechar → nombrar**. No es una animación ornamental: evita clasificar antes de recordar. Guardar deposita la perla en el mes correcto y muestra una confirmación breve.

## Reduced motion

Con `prefers-reduced-motion: reduce`:

- se inmoviliza la atmósfera;
- se eliminan paralaje, derivas y transformaciones espaciales grandes;
- se conservan foco, jerarquía, visibilidad de estados, anuncios y navegación por teclado.

## Presupuesto de rendimiento

- Máximo dos gradientes ambientales animados y ambos transform-only.
- Sin partículas, video, WebGL, canvas ni animación por estado continuo de React.
- Frost usa `backdrop-filter` sólo en controles compactos, navegación y feedback.
- El calendario es una trama directa y silenciosa, no una capa de vidrio grande.
