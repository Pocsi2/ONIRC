# Onirc — Matriz de cumplimiento del briefing

Fecha: 14 de agosto de 2026
Fuente: briefing original de 198 criterios y versión 3.3 del checklist operativo.

## Regla de lectura

- **PASS:** implementado y con evidencia de código o prueba local.
- **PREPARADO:** código y controles existen, pero dependen de configuración o validación externa antes de declararse activos.
- **DEFERRED:** fuera de alcance de esta release.
- **REVIEW:** requiere revisión humana, producción o investigación con personas.

No se marca como PASS un servicio cuya configuración externa no se ha verificado.

| Sección | Criterios | Estado dominante | Evidencia / excepción |
| --- | ---: | --- | --- |
| A. Concepto e identidad | 9 | PASS / REVIEW | Marca Onirc, español, Perla, materiales y dirección anti-SaaS. Reconocimiento sin marca requiere prueba externa. |
| B. Portada y acceso | 9 | PASS / PREPARADO | Portada, propósito y mensaje de privacidad pasan. Google y correo/contraseña están integrados; falta recorrido de producción del dominio publicado. |
| C. Calendario | 16 | PASS / REVIEW | Mes, hoy, Perlas, foco y múltiples memorias pasan. Revisión visual publicada queda pendiente. |
| D. Nube-cortina | 6 | PASS | Botón de 44 px, etiqueta móvil, foco, toque y fallback reducido. |
| E. Registro y edición | 19 | PASS / PREPARADO | Fecha, título, relato, borrador, edición, borrado y deshacer pasan. Publicar requiere activar el Worker. |
| F. Ajustes y datos | 10 | PASS / DEFERRED | Sistema/Día/Noche cálida y reinicio local pasan. Exportación queda diferida. |
| G. Sistema visual | 14 | PASS | Tokens, materiales, contraste, capas y controles semánticos. |
| H. Responsive e interacción | 10 | PASS / REVIEW | E2E en escritorio y móvil; seis viewports publicados requieren inspección humana. |
| I. Accesibilidad | 11 | PASS / REVIEW | axe, teclado, foco, diálogo y reduced motion pasan; lector de pantalla humano queda pendiente. |
| J. Rendimiento y calidad | 11 | PASS / REVIEW | Build estático, lint, tipos, pruebas y Lighthouse de regresión. Rendimiento del Worker real queda pendiente. |
| K. Contenido y extremos | 10 | PASS / PREPARADO | Vacío, persistencia, borrador, guardado y deshacer pasan; error de red del Worker existe pero exige prueba real. |
| L. Primera experiencia | 7 | PASS | Calendario vacío, invitación discreta y primera Perla; sin gamificación. |
| M. Perla → Memoria | 9 | PASS | URL, layoutId, foco de retorno y fallback reduced motion. |
| N. Tokens y arquitectura | 9 | PASS / REVIEW | Tokens y primitivas centralizados; control recurrente de valores crudos. |
| O. Motion System | 9 | PASS | Auditoría, sistema y E2E reduced motion; sin partículas ni movimiento ornamental. |
| P. Alcance, datos y arquitectura | 16 | PASS / PREPARADO | localStorage versionado, Firebase Auth y sincronización privada. Worker y reglas preparados, activación pendiente. |
| Q. Pruebas de autoría | 9 | PASS / REVIEW | No replica calendario de productividad; prueba de comprensión externa pendiente. |
| R. Visibilidad y calendario público | 14 | PREPARADO / REVIEW | Proyección v2, seudónimo, reporte y feed filtrado por Worker están implementados; requieren secretos, retiro heredado y prueba de producción. |

## Puertas de esta edición

| Puerta | Estado |
| --- | --- |
| Exportación estática de Next.js | PASS |
| Creación, edición, borrado y deshacer locales | PASS |
| Persistencia y migración local | PASS |
| Firebase Auth y sincronización privada | PREPARADO; falta sesión real en Pages |
| Firestore privado y navegador sin acceso público directo | PASS localmente; 4 pruebas de emulador |
| Worker para publicación seudónima | PREPARADO; falta configuración Cloudflare |
| Retiro heredado y publicación real | PREPARADO; no ejecutar hasta desplegar Worker |
| Lint, TypeScript, build, unitarias, reglas y E2E | PASS localmente al cierre de esta rama |
| Accessibility scan axe | PASS en regresión |
| Exportación de datos, perfiles, seguidores y analítica | DEFERRED |

Esta matriz no declara aún a Onirc listo para una candidatura integral: exige el despliegue seguro, revisión visual de producción y validación externa antes de promover la zona pública.
