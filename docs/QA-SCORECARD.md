# Onirc — Scorecard QA

Fecha: 14 de agosto de 2026
Release: **Archivo de luz — Release Candidate**

## Evidencia de la rama

| Área | Estado | Evidencia |
| --- | --- | --- |
| Dirección de arte y materiales | Verificado | Perla para memoria, Frost para herramientas y Ópalo para foco; el calendario conserva una trama temporal sin tarjetas por día. |
| Flujo personal | Aprobado en regresión | Playwright cubre crear, editar, borrar/deshacer, colección múltiple, escritura progresiva y retorno a la Perla. |
| Frontera Firestore | Aprobada localmente | El emulador cubre propietario, visitante, segunda cuenta, proyección heredada y toda lectura/escritura pública directa. |
| Worker confiable | Aprobado localmente; pendiente de despliegue | Typecheck, lint y tres pruebas de frontera cubren health, token requerido y CORS limitado. |
| Contrato de publicación | Aprobado localmente | Pruebas de esquema verifican proyección v2 exacta, rechazo de ownerId, sourceDreamId, campos desconocidos y fechas imposibles. |
| GitHub Pages | Verificado en main; pendiente de SHA de esta rama | Build estático y workflow validan inicio, calendar y explorar antes del artefacto. |
| Lint, tipos y unitarias | En validación de cierre | El gate exige lint, typecheck, worker:check y pruebas unitarias antes de PR. |
| Accesibilidad | Aprobada en regresión previa | axe, etiquetas persistentes, foco de retorno, objetivos de 44 px y reduced motion se cubren en E2E. |
| Rendimiento | Aprobado en regresión previa | La carga anónima difiere Firebase; el Worker concentra sólo acciones de archivo y una lectura editorial limitada. |

## Gates de activación que aún requieren estado externo

1. Crear el Worker Free y sus secretos en Cloudflare.
2. Configurar los environments protegidos firebase-production y cloudflare-archive-production.
3. Desplegar reglas, Worker y retirar por completo las proyecciones heredadas.
4. Validar publicar, retirar, reporte y feed con cuentas reales en la URL de Pages.
5. Añadir las variables de Pages sólo después de esa validación.
6. Revisar visualmente el SHA publicado en 320, 390, 768, 1366, 1440 y 1920 px.

No se declara aún una candidatura de premio ni un archivo público activo: faltan la evidencia de despliegue real y la revisión humana final.
