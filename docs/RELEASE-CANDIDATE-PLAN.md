# Onirc — Release Candidate «Archivo de luz»

**Estado:** código de la release candidate en cierre; archivo abierto todavía congelado hasta el despliegue verificado del Worker.
**Fuente de verdad:** main, GitHub Project «Onirc — Release Candidate / Archivo de luz» y este documento.

## Principio de operación

La experiencia pública no se activa por apariencia ni por una variable aislada. Requiere cuatro evidencias conjuntas:

1. Firestore niega cualquier lectura o escritura pública directa desde el navegador.
2. El Worker confiable está desplegado con secretos fuera de GitHub.
3. La retirada de proyecciones heredadas inseguras terminó.
4. Pages recibe tanto la URL HTTPS del Worker como el estado available.

~~~mermaid
flowchart LR
  I[Issue listo] --> B[Rama y PR]
  B --> C[CI: lint, tipos, pruebas y build]
  C --> M[Merge a main]
  M --> P[Pages y smoke test]
  M --> W[Worker protegido]
  P --> Q[QA y evidencia]
  W --> Q
  Q --> R[Release candidate]
~~~

Pages se despliega tras el merge. Firestore se despliega desde firebase-production con credenciales temporales. El Worker se despliega desde cloudflare-archive-production con un token limitado de Cloudflare; su llave de servicio de Google vive exclusivamente en Cloudflare Workers.

## Fases, issue y evidencia

| Orden | Fase / issue | Resultado verificable | Estado de código |
| --- | --- | --- | --- |
| P0 | Restablecer GitHub Pages verificable | out contiene inicio, calendar y explorar; Pages publica el SHA actual. | Listo; confirmación remota por PR. |
| P0 | Congelar y proteger el archivo público | Firestore niega cliente directo; interfaz congelada sin URL confiable. | Listo y cubierto por emulador. |
| A | Archivo de luz: sustracción y material | Una tensión visual por pantalla; Perla, Frost y Ópalo tienen usos exclusivos. | Implementado. |
| B | Paisaje temporal: calendario y Perla | Vacío, único, múltiple, hoy, foco y selección son una familia legible. | Implementado; requiere revisión publicada. |
| C | Cámara de memoria: Perla → Memoria y escritura | Entrada, retorno, composer, teclado y reduced motion mantienen contexto. | Implementado; requiere revisión publicada. |
| D | Archivo abierto seguro y seudónimo | Worker, proyección v2, retiro reversible, reporte y galería editorial sin lectura Firestore directa. | Implementado; activación pendiente. |
| E | Prueba de premio y release candidate | QA funcional, visual, accesible y rendimiento sin defectos P0/P1. | En cierre. |

Dependencias: P0 de Pages precede promoción; P0 de privacidad bloquea D; A precede B, C y D; B precede C; E necesita evidencia de todas.

## Arquitectura aprobada

~~~text
Memoria privada
  → Worker con token Firebase validado
  → publicDreams con proyección cerrada v2
  → feed editorial filtrado por el mismo Worker

Referencia privada del propietario
  → publicationLinks
  → retiro de la única copia pública relacionada
~~~

La proyección pública sólo incluye título, narrativa, fecha, tono, firma seudónima y fecha de publicación, además de su ID opaco y metadatos de esquema. Nunca incluye UID, correo, ownerId, sourceDreamId ni rutas privadas.

Editar la fuente no altera una publicación ya hecha. Eliminar y deshacer restaura únicamente la memoria privada: volver a compartir siempre es una acción deliberada. Las proyecciones heredadas inseguras se retiran, en lugar de inventar consentimiento o reactivar contenido borrado.

## Gates de calidad

Antes de merge:

- npm run lint;
- npm run typecheck;
- npm run worker:check;
- npm run test;
- npm run test:rules con Firestore Emulator y Java 21;
- CI=1 npm run test:e2e;
- npm run build con ONIRC_BASE_PATH igual a /ONIRC;
- comprobación de out/index.html, out/calendar/index.html y out/explorar/index.html.

Antes de activar el archivo:

- pruebas con visitante, propietario y segunda cuenta;
- prueba de Worker con publicar, editar fuente, retirar y reportar;
- retirada heredada completa, con auditoría del esquema público;
- teclado, foco visible, axe, reduced motion y consola limpia;
- revisión visual en 320, 390, 768, 1366, 1440 y 1920 px;
- confirmar que no hay secretos en Git, artefactos o variables públicas de Pages.

## Criterio editorial

- Inicio: una promesa, una acción, un protagonista.
- Calendario: el tiempo está primero; Perla es memoria, no botón decorativo.
- Detalle: título, fecha, narrativa y acciones al final.
- Composer: escribir antes de clasificar; publicar ocurre después de releer.
- Archivo abierto: placas estables, sin avatares, métricas, ranking ni scroll ansioso.
- Movimiento: continuidad, foco, profundidad, transformación o feedback; nada ornamental.

## Fuera de alcance

IA, analítica, perfiles, seguidores, métricas de engagement, exportación y nuevas funciones no necesarias para el diario de sueños principal.

El procedimiento exacto de despliegue y contingencia vive en [PUBLIC-ARCHIVE-WORKER-RUNBOOK.md](PUBLIC-ARCHIVE-WORKER-RUNBOOK.md).
