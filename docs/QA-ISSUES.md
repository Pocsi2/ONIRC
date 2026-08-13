# Onirc — Issues de calidad

Fecha: 13 de agosto de 2026

## Cerrados en este release

| Severidad | Hallazgo | Resolución |
| --- | --- | --- |
| P1 | Roles ARIA de grilla sin filas semánticas | Se eliminó el patrón ARIA inválido; la región conserva nombre y cada perla es un botón etiquetado. |
| P1 | Controles sólo con icono en móvil | Se añadieron nombres accesibles para calendario y apariencia. |
| P1 | Texto secundario con contraste 4.4:1 | Se ajustó el token de texto tenue a contraste AA. |
| P1 | Rutas/API de autenticación incompatibles con exportación estática | Se retiraron NextAuth y rutas servidoras; build entrega sólo páginas estáticas. |

## Diferidos conscientemente

| Severidad futura | Tema | Condición para resolver |
| --- | --- | --- |
| P0 de lanzamiento con cuentas | Autenticación, privacidad por usuario y sincronización | Elegir backend/identidad; GitHub Pages solo no puede resolverlo. |
| P1 de producto compartido | Calendario público, alias, reportes y moderación | Definir políticas, API y reglas de acceso. |
| P2 | Exportación JSON/Markdown/PDF | Decidir formato, consentimiento y migración de datos. |
| P2 | Validación con cinco personas y lector de pantalla | Ejecutar investigación externa antes de candidatura de diseño. |
| P3 | Más refinamiento de escalas tipográficas | Iterar con capturas de dispositivos físicos y contenido real. |
