# Onirc — Issues de calidad

Fecha: 14 de agosto de 2026

## Mitigados en la rama

| Severidad | Hallazgo | Resolución y evidencia |
| --- | --- | --- |
| P0 | Las proyecciones heredadas podían exponer ownerId y sourceDreamId. | El navegador ya no puede leer publicDreams directamente. Firestore deniega todas las lecturas/escrituras públicas; el Worker filtra un contrato v2 cerrado y la retirada elimina legados inseguros. |
| P0 | El archivo dependía de Cloud Functions, que requiere Blaze en producción. | Se reemplazó por Cloudflare Worker Free, con secretos de ejecución fuera de GitHub y un workflow protegido de despliegue. |
| P0 | Una publicación podía depender de un estado local antes de una escritura segura. | Publicar y retirar son transacciones del Worker: fuente, enlace privado y proyección cambian de forma atómica. |
| P1 | Deshacer una eliminación podía reintroducir localmente el estado público. | Deshacer restaura la fuente como privada; volver a compartir exige una decisión nueva. |
| P1 | El feed público consultaba Firestore desde el navegador. | Explorar usa GET del Worker; no hay suscripción social ni polling continuo. |
| P1 | La atmósfera era demasiado reconocible y costosa. | Dos capas transform-only de baja opacidad; sin partículas, video, WebGL ni canvas. |

## Abiertos para cerrar la release candidate

| Severidad | Tema | Criterio de cierre |
| --- | --- | --- |
| P0 | Activación del Worker | Secrets configurados en Cloudflare, health check, publicación/retiro/reporte reales y CORS probado en Pages. |
| P0 | Retirada heredada | El endpoint administrativo completa todas sus páginas y la auditoría no encuentra proyecciones inseguras. |
| P1 | QA visual publicado | 320, 390, 768, 1366, 1440 y 1920 px sin overflow ni pérdida de jerarquía. |
| P1 | Sesión Firebase real | Google y correo/contraseña validados en pocsi2.github.io/ONIRC con el dominio autorizado. |
| P2 | Validación externa | Cinco sesiones cualitativas, incluida una con lector de pantalla, antes de cualquier candidatura de diseño. |

La guía de activación y reversión está en [PUBLIC-ARCHIVE-WORKER-RUNBOOK.md](PUBLIC-ARCHIVE-WORKER-RUNBOOK.md).
