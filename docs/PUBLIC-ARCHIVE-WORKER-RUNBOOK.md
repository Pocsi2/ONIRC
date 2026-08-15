# Onirc — Runbook del archivo público confiable

**Estado:** implementado en código, todavía congelado en producción.
**Objetivo:** publicar y retirar copias seudónimas sin Firebase Cloud Functions ni plan Blaze.

## Decisión

Cloud Functions se retiró de este repositorio porque su despliegue de producción requiere el plan Blaze. Onirc usa un Cloudflare Worker en el plan Free como frontera de confianza: recibe una identidad Firebase válida, lee la memoria privada con una cuenta de servicio dedicada y escribe una proyección pública deliberadamente mínima.

El plan Free de Workers incluye 100,000 solicitudes diarias y 10 ms de CPU por solicitud. El archivo limita la lectura a 36 placas por carga, no usa polling social ni métricas, y conserva el feed editorial para que ese presupuesto sea razonable. Si el tráfico o el cómputo alcanzan el límite, el archivo debe volver a congelarse antes de cambiar de plan. Consulta la documentación vigente de [precios de Workers](https://developers.cloudflare.com/workers/platform/pricing/) y [límites de Workers](https://developers.cloudflare.com/workers/platform/limits/).

## Frontera de privacidad

~~~text
Memoria privada en Firestore
        │
        │ token Firebase + intención explícita
        ▼
Cloudflare Worker confiable
        │ valida token, propiedad y esquema
        ├── publica una proyección v2 mínima
        ├── retira sólo la copia vinculada
        └── filtra el feed editorial
        ▼
publicDreams sin UID, ownerId, sourceDreamId, correo ni rutas privadas
~~~

Firestore deniega toda lectura y escritura directa de publicDreams desde el navegador. Esto incluye los documentos heredados: el feed nunca consulta Firestore desde el cliente. El Worker sólo devuelve documentos que cumplen exactamente este contrato:

- id opaco, visibility visible y schemaVersion 2;
- fecha, título, narrativa y tono;
- firma seudónima y fecha de publicación.

La referencia de propiedad queda sólo en users/{uid}/publicationLinks/{dreamId}. La memoria original no se convierte en una publicación: se conserva como fuente privada y la proyección es una instantánea.

## Riesgo heredado y retirada

Las proyecciones heredadas que tengan identificadores internos no se convierten automáticamente a públicas. Se **retiran** mediante el endpoint administrativo retire-legacy y su fuente privada se conserva. La persona propietaria puede volver a publicar conscientemente con una nueva firma seudónima.

Esta decisión evita dos fallas graves: recrear una memoria borrada desde una copia pública o asumir que una firma histórica era un seudónimo consentido.

## Secretos y privilegios

Los secretos de ejecución viven únicamente en Cloudflare Workers, nunca en el repositorio ni en GitHub Actions:

| Secreto | Uso |
| --- | --- |
| GOOGLE_SERVICE_ACCOUNT_EMAIL | Cuenta de servicio dedicada para Firestore. |
| GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY | Llave privada de esa cuenta; se rota o revoca si hay sospecha. |
| MIGRATION_ADMIN_UIDS | Lista separada por comas de UID Firebase que puede retirar documentos heredados. |

Crear una cuenta de servicio exclusiva para el Worker y otorgarle sólo la capacidad de leer y escribir documentos Firestore necesaria para esta operación. El rol predefinido Cloud Datastore User existe para operaciones de datos; revisar su alcance vigente y, si el proyecto lo permite, preferir un rol personalizado más estrecho. No otorgar Owner, Editor ni roles de administración de Firebase al Worker. Consulta los [roles y permisos de Firestore](https://cloud.google.com/iam/docs/roles-permissions/firestore).

La llave se guarda como secret de Cloudflare. Cloudflare cifra estos valores y Wrangler valida los nombres declarados al desplegar; los secretos no deben aparecer en wrangler.jsonc ni en archivos de aplicación. Consulta [Secrets de Workers](https://developers.cloudflare.com/workers/configuration/secrets/).

El Worker verifica el JWT Firebase por emisor, audiencia, firma y expiración. No consulta la revocación de sesión en cada petición; una revocación dura requiere una futura versión con verificación de revocación en un entorno compatible con Firebase Admin. Para esta release, los tokens vencidos o inválidos se rechazan y el cliente Firebase los refresca de forma normal.

## Preparación manual única

1. Crear una cuenta Cloudflare en el plan Free y un Worker llamado onirc-public-archive.
2. En Cloudflare Workers > Settings > Variables and Secrets, añadir los tres secretos anteriores. Copiar la llave completa desde la propiedad private_key del JSON de la cuenta de servicio; no subir ese JSON a GitHub.
3. En GitHub, crear el environment protegido cloudflare-archive-production y añadir como secretos:
   - CLOUDFLARE_ACCOUNT_ID
   - CLOUDFLARE_API_TOKEN
4. El token de Cloudflare debe estar limitado al único account y a despliegue de Workers. GitHub Actions necesita token y account ID en un entorno no interactivo; Cloudflare indica explícitamente que el token debe ser un secret del proveedor CI, no un archivo del repositorio. Consulta [GitHub Actions para Workers](https://developers.cloudflare.com/workers/ci-cd/external-cicd/github-actions/).
5. Mantener firebase-production como environment protegido para el workflow de reglas. No se despliegan Functions.

## Orden de activación

1. Ejecutar el workflow Deploy Onirc Firestore configuration. Debe pasar las pruebas de reglas y desplegar firestore.rules e índices.
2. Ejecutar Deploy Onirc public archive Worker con la confirmación DEPLOY. El workflow sólo publica código; los secretos de ejecución ya deben existir en Cloudflare.
3. Verificar GET /v1/archive/health en la URL Workers.dev resultante. Debe responder status ready y schemaVersion 2.
4. Con la cuenta cuyo UID figura en MIGRATION_ADMIN_UIDS, ejecutar POST /v1/archive/retire-legacy con un Firebase ID token actual y un cuerpo JSON vacío. Repetir usando nextCursor hasta que complete sea verdadero. No copiar el token a una issue, historial de shell ni archivo.
5. Revisar la colección publicDreams desde consola administrativa: no debe quedar un documento heredado expuesto; las proyecciones nuevas sólo deben tener los nueve campos del contrato v2.
6. Con una memoria de prueba, validar publicar, editar la fuente sin alterar la instantánea, retirar publicación y reporte. Probar también visitante, propietario y segunda cuenta.
7. Sólo después de la evidencia anterior, crear las variables de repositorio:
   - ONIRC_PUBLIC_ARCHIVE_API_URL con la URL HTTPS exacta del Worker;
   - ONIRC_PUBLIC_ARCHIVE_STATE con el valor available.
8. Desplegar Pages y comprobar /explorar, publicación y retiro en la URL pública.

Si una verificación falla, eliminar ONIRC_PUBLIC_ARCHIVE_STATE o la URL del Worker y volver a desplegar Pages. La interfaz regresa al estado congelado; no hace falta borrar memorias privadas.

## Operación y respuesta

- El Worker tiene CORS limitado a pocsi2.github.io y a los orígenes locales declarados. Agregar un dominio requiere cambiar la configuración versionada y volver a desplegar.
- El endpoint de retirada admite páginas de diez documentos para permanecer por debajo del presupuesto de CPU y subsolicitudes del plan Free.
- No habilitar publicación hasta completar la retirada heredada. Una proyección no segura se retira, no se corrige en el navegador.
- Ante pérdida de la llave de servicio, revocarla en Google Cloud, reemplazar el secreto de Cloudflare y volver a desplegar. Cloudflare advierte que actualizar un secret crea una nueva versión del Worker.
- No hay perfiles, seguidores, métricas, likes ni comentarios. Los reportes se almacenan de forma privada; su cola de revisión humana sigue siendo un requisito antes de ampliar alcance social.

## Evidencia requerida para cerrar la fase D

- Worker typecheck, pruebas de frontera y pruebas de reglas aprobadas.
- Worker desplegado con secretos configurados fuera de GitHub.
- Health check y recorrido real de publicar, retirar y reportar.
- Retirada heredada completa y auditoría de esquema.
- Feed público entregado sólo por Worker; Firestore directo negado para visitante y cuentas autenticadas.
- URL de Pages desplegada con ambas variables y evidencia visual de escritorio y móvil.
