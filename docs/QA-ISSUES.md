# Onirc — Issues de calidad

Fecha: 14 de agosto de 2026

## Mitigados en esta rama

| Severidad | Hallazgo | Resolución y evidencia |
| --- | --- | --- |
| P0 | Los documentos públicos heredados podían exponer `ownerId` y `sourceDreamId`. | Reglas productivas niegan documentos heredados y toda escritura pública desde navegador. El emulador confirma la frontera de lectura/escritura. |
| P0 | Pages fallaba al subir un `out/` inexistente. | Next exporta ahora a `out/`; el workflow valida rutas antes de cargar el artefacto. |
| P1 | El calendario se leía como tarjetas por fecha. | Una trama temporal reemplaza las superficies; sólo las Perlas reciben presencia y foco. |
| P1 | El composer clasificaba antes de recordar. | Flujo progresivo: narrativa → fecha → nombre. |
| P1 | La atmósfera era demasiado reconocible y costosa. | Dos capas transform-only, baja opacidad, sin partículas ni filtros grandes. |
| P1 | Firebase y Google Auth reducían el rendimiento de una visita anónima. | SDK diferido por intención o sesión recordada. Lighthouse pasó de 69 a 97 (inicio) y 95 (calendario). |

## Abiertos para cerrar la release candidate

| Severidad | Tema | Criterio de cierre |
| --- | --- | --- |
| P0 | Despliegue Pages verificable | CI produce `out/`, publica el SHA actual de `main` y aprueba smoke test de `/`, `/calendar/`, `/explorar/`. |
| P0 | Despliegue de función confiable | Aprobación explícita de Blaze, alertas revisadas, WIF sin llaves persistentes, migración ensayada y auditoría de proyección. |
| P1 | QA visual multi-breakpoint | 320, 390, 768, 1366, 1440 y 1920 px sin overflow ni pérdida de jerarquía sobre el sitio publicado. |
| P1 | Sesión Firebase real | Google y correo/contraseña validados en `pocsi2.github.io/ONIRC` con el dominio autorizado. |
| P2 | Validación externa | Cinco sesiones cualitativas, incluida una con lector de pantalla, antes de una candidatura de diseño. |
