# Onirc — Runbook de Firebase para Release Candidate

## Estado presente

- Firestore en producción ya está **congelado de forma segura**: las memorias privadas sólo son accesibles por su propietario; `publicDreams` sólo permite leer documentos con `visibility == "visible"`; el navegador no puede escribir publicaciones ni reportes.
- La interfaz pública se mantiene apagada de forma predeterminada mediante `NEXT_PUBLIC_PUBLIC_ARCHIVE_STATE`.
- Las Functions están implementadas y compiladas, pero **no se han desplegado**.

## Arquitectura aprobada

```text
memoria privada
   │
   ├── publishDream() ──► proyección pública segura y seudónima
   │                         (sin UID, ownerId, sourceDreamId, correo ni rutas internas)
   │
   └── publicationLinks privado ──► permite retirar sólo la copia propia
```

`publishDream()` crea una instantánea explícita. Editar una memoria privada no modifica una publicación previa. `unpublishDream()` borra la proyección y restituye la visibilidad privada de origen.

## Precondiciones para desplegar

1. El propietario aprueba explícitamente el plan Blaze. Cloud Functions requiere Blaze en producción; configurar alertas y revisar el presupuesto antes de activarlo. Las alertas no son un tope de gasto.
2. Crear un service account de despliegue con privilegios mínimos necesarios para Firestore rules/indexes y Cloud Functions.
3. Crear Workload Identity Federation entre GitHub Actions y Google Cloud. No guardar JSON de service account en el repositorio.
4. En GitHub, crear el environment protegido `firebase-production` y variables:
   - `GCP_WIF_PROVIDER`
   - `GCP_DEPLOY_SERVICE_ACCOUNT`
5. Añadir revisores requeridos al environment y usar el workflow manual `Deploy Onirc Firebase`.

## Evidencia de reglas

`npm run test:rules` levanta sólo el emulador Firestore y prueba visitante, propietaria, segunda cuenta, proyección visible, documento heredado y escrituras directas. Firebase CLI requiere JDK 21 o superior para el emulador actual. El workflow de Pages instala Temurin 21 para que esta prueba sea obligatoria en CI; no es necesario instalar Java globalmente para usar Onirc.

La matriz aprobó localmente el 14 de agosto con Temurin 21 portátil: 4 pruebas para propietaria, visitante, segunda cuenta, proyección visible/documento heredado y escritura directa. CI instala Temurin 21, por lo que no es necesario instalar Java globalmente para usar Onirc.

## Despliegue seguro

1. Ejecutar primero `rules` desde el workflow protegido.
2. Validar con emulador y una cuenta real que las rutas privadas continúan privadas.
3. Desplegar `functions` con aprobación del environment.
4. Ejecutar `migrateLegacyPublicDreams` sólo con claim administrativo, en lotes de 100. La función vuelve a leer la memoria privada; nunca revive un documento borrado a partir de la copia heredada.
5. Auditar `publicDreams`: no debe existir `ownerId`, `sourceDreamId`, UID, correo ni ruta interna.
6. Sólo entonces fijar la variable de Pages `ONIRC_PUBLIC_ARCHIVE_STATE=available` y desplegar frontend. Si hay duda, retirar la variable congela nuevamente la UI pública.

## Límites de diseño

- `maxInstances: 2` limita la concurrencia de Functions; no sustituye alertas ni revisión de facturación.
- Los reportes son de escritura exclusiva por Function. No hay feed social, métricas, seguidores ni ranking.
- La migración no debe ejecutarse sin una copia de seguridad administrativa y una revisión explícita del propietario.
