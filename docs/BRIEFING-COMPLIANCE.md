# Onirc — Matriz de cumplimiento del briefing

Fecha: 13 de agosto de 2026
Fuente: `Onirc_Design_Briefing_Checklist.md`, versión 2.1 (198 criterios).

## Regla de lectura

- **PASS:** implementado y con evidencia en código, pruebas o revisión visual.
- **DEFERRED:** no aplicable a la edición estática de GitHub Pages; no se presenta como terminado.
- **REVIEW:** requiere validación externa o una medición que no puede sustituirse por revisión interna.

La matriz conserva trazabilidad por sección y rango de criterios del checklist original. Las excepciones se explicitan; ningún elemento diferido se marca como aprobado.

| Sección | Criterios | Estado dominante | Evidencia / excepción |
| --- | ---: | --- | --- |
| A. Concepto e identidad | 9 | PASS | Marca Onirc, español, Memoria nácar, materiales y revisión anti-SaaS. Reconocimiento sin marca queda en REVIEW externo. |
| B. Portada y acceso | 9 | DEFERRED | Portada de un viewport, propósito y transparencia local pasan. Google, email y legales dependen de identidad/backend. |
| C. Calendario | 16 | PASS / DEFERRED | Mes, hoy, perlas, foco y múltiples memorias locales pasan. Ámbito público queda diferido. |
| D. Nube-cortina | 6 | PASS | Botón accesible de 44 px, etiqueta móvil, foco, toque y fallback reducido. |
| E. Registro y edición | 19 | PASS / DEFERRED | Fecha, título, relato, borrador, edición, borrado y deshacer pasan. Visibilidad, ECoG y publicación quedan diferidos. |
| F. Ajustes y datos | 10 | PASS / DEFERRED | Sistema/Día/Noche cálida y reinicio local pasan. Cuenta, exportación y borrado remoto quedan diferidos. |
| G. Sistema visual | 14 | PASS | Tokens, materiales, contraste reforzado, capas y controles semánticos. |
| H. Responsive e interacción | 10 | PASS / REVIEW | E2E desktop/móvil pasa; verificación visual de los seis viewports queda registrada como QA manual. |
| I. Accesibilidad | 11 | PASS / REVIEW | axe sin violaciones, teclado, foco, diálogo y reduced motion pasan. Lector de pantalla humano queda en REVIEW. |
| J. Rendimiento y calidad | 11 | PASS / REVIEW | Build estático, lint, tipos, consola E2E. Medición Lighthouse se ejecuta como gate local/CI. |
| K. Contenido y estados extremos | 10 | PASS / DEFERRED | Vacío, error de persistencia, borrador, guardado y deshacer pasan; estados de red/autenticación no aplican. |
| L. Primera experiencia | 7 | PASS | Calendario vacío, invitación discreta y primera perla; sin gamificación. |
| M. Perla → Memoria | 9 | PASS | URL, `layoutId`, foco de retorno y fallback reduced motion validados. |
| N. Tokens y arquitectura | 9 | PASS / REVIEW | Tokens y primitivas centralizadas; revisión estática de valores crudos queda como control recurrente. |
| O. Motion System | 9 | PASS | Documentos actualizados, sin partículas, fallback y E2E reduced motion. |
| P. Alcance, datos y arquitectura | 16 | PASS / DEFERRED | `localStorage` versionado y migración pasan. Identidad, RLS, API y datos públicos requieren backend. |
| Q. Pruebas de autoría | 9 | PASS / REVIEW | No replica calendario de productividad; prueba externa de comprensión queda pendiente. |
| R. Visibilidad y calendario público | 14 | DEFERRED | Requiere identidad, políticas de acceso, alias, moderación y backend. |

## Puertas de esta edición

| Puerta | Estado |
| --- | --- |
| Exportación estática de Next.js | PASS |
| Sin secretos ni API de autenticación | PASS |
| Creación, edición, borrado y deshacer locales | PASS |
| Persistencia y migración local | PASS |
| Lint, TypeScript, build, unit y E2E | PASS |
| Accessibility scan axe | PASS |
| Google, email y aislamiento por cuenta | DEFERRED, por decisión de GitHub Pages sin backend |
| Calendario público, reportes y moderación | DEFERRED, por decisión de alcance |
| Exportación de datos | DEFERRED, por decisión de alcance |

Esta matriz no declara Onirc listo para el umbral integral de candidatura del briefing: aquel umbral requiere identidad real, privacidad por usuario, exportación y validación externa.
