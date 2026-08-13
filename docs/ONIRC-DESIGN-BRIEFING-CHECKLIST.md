# Onirc — Briefing de producto, diseño y calidad

**Versión:** 3.0 — diario privado, nube personal y publicación seudónima  
**Fecha:** 13 de agosto de 2026  
**Estado:** fuente de verdad operativa  
**Producto publicado:** [pocsi2.github.io/ONIRC](https://pocsi2.github.io/ONIRC/)

---

## 1. La idea

> Los sueños son recuerdos hechos de capas.

Onirc convierte un sueño en una **Perla**: un objeto pequeño, luminoso y situado en el tiempo. El calendario no administra tareas; es un paisaje temporal donde los recuerdos pueden permanecer privados, sincronizarse de forma personal o compartirse conscientemente.

La experiencia debe comunicar luz, espacio, materia, profundidad y movimiento con calma. Debe sentirse como entrar a un lugar de memorias, no como operar un dashboard.

### Promesa

**Tus sueños, visibles en el tiempo.**

### Principios innegociables

1. Privado es el valor predeterminado.
2. Nada se comparte al iniciar sesión ni al sincronizar.
3. Publicar crea una **copia independiente**, reversible; nunca transforma ni expone la memoria privada por accidente.
4. El autor público se identifica con un seudónimo elegido, nunca con correo, nombre de Google ni nombre interno.
5. La firma UX es **Perla → Memoria**. La Nube-cortina pertenece sólo a registrar.
6. La belleza no justifica pérdida de legibilidad, privacidad, teclado, rendimiento o reduced motion.

## 2. Alcance real de la versión actual

| Área | Estado | Comportamiento actual |
| --- | --- | --- |
| Portada | Implementado | Presenta Onirc, privacidad local inicial y acceso al calendario. |
| Calendario personal | Implementado | Mes navegable, múltiples recuerdos por día, perlas y colección por fecha. |
| Crear / editar / borrar | Implementado | Borrador local, fecha sin futuro, confirmación contextual y Deshacer. |
| Perla → Memoria | Implementado | Detalle en URL del calendario, foco retornable y movimiento reducido. |
| Tema | Implementado | Sistema / Día / Noche cálida, persistido localmente. |
| Firebase Auth | Implementado | Google y correo/contraseña. |
| Sincronización privada | Implementado | Activación explícita; Firestore por `uid`, con unión que evita pérdida silenciosa. |
| Publicar | Implementado | Confirmación y seudónimo; crea copia en `publicDreams`. |
| Feed público | Implementado | `/explorar`, galería reciente de publicaciones públicas con seudónimo. |
| Retirar publicación | Implementado | “Hacer privado” borra la copia pública y conserva la privada. |
| Perfiles públicos | Diferido | No hay páginas de perfil, seguidores ni mensajes. |
| Comentarios, likes, reportes | Diferido | No deben añadirse sin moderación, bloqueo y política de abuso. |
| Exportación / importación | Diferido | No se muestra como disponible. |
| ECoG, IA, analítica, backend propio | Fuera de alcance | No forman parte del producto actual. |

## 3. Arquitectura de información

### Inicio `/`

- Wordmark Onirc, promesa breve y atmósfera Perla.
- Acción primaria: abrir calendario.
- Cuenta opcional: Google o correo.
- Mensaje honesto: el diario comienza en este navegador; la nube requiere decisión explícita.

### Mi calendario `/calendar`

- Mes/año, mes anterior, siguiente y Hoy.
- Una fecha silenciosa no exige atención; una fecha con sueño contiene una Perla.
- Varias memorias forman una constelación discreta y llevan a una colección finita.
- Nube-cortina: abre “Registrar sueño”.
- Detalle, editor y colección viven en el estado URL: `month`, `dream`, `collection`, `compose`, `date`.

### Espacio público `/explorar`

- Galería editorial, no red social de rendimiento.
- Sólo presenta publicaciones que una persona eligió compartir.
- Cada pieza incluye Perla, fecha, título, narrativa y “por {seudónimo}”.
- Sin contadores, comentarios, ranking, nombre real, email ni identificación de cuenta en la interfaz.
- Estado diseñado para carga, vacío y error.

### Cuenta y nube

- Iniciar sesión verifica identidad; **no envía recuerdos**.
- “Sincronizar” une la copia del navegador con `users/{uid}/dreams`.
- Si hay versiones divergentes, se preservan las dos en vez de sobrescribir una silenciosamente.

## 4. Privacidad y publicación

### Estados de una memoria

| Estado | Dónde existe | Quién puede leerla |
| --- | --- | --- |
| Local | `localStorage` del navegador | Sólo quien usa ese navegador. |
| Privada sincronizada | `users/{uid}/dreams/{dreamId}` | Sólo el `uid` propietario. |
| Publicada | Copia privada + `publicDreams/{uid}_{dreamId}` | Cualquier visitante del feed público. |

### Flujo “Hacerlo público”

1. Abrir una memoria privada sincronizada.
2. Elegir **Hacerlo público**.
3. Leer el alcance: la copia será visible a cualquiera y la original seguirá privada.
4. Elegir un seudónimo de 2 a 32 caracteres.
5. Confirmar **Compartir públicamente**.
6. Crear la copia pública; mostrarla en `/explorar`.

El seudónimo se guarda sólo en el documento privado del usuario para reutilizarlo. Cambiarlo en una publicación futura no modifica retroactivamente publicaciones anteriores: ese comportamiento sólo puede añadirse con una decisión explícita de producto.

### Reglas de Firestore

- `users/{userId}` y su subcolección `dreams` sólo permiten lectura/escritura al propietario autenticado.
- `publicDreams` permite lectura pública.
- Crear, actualizar o eliminar una publicación exige que `ownerId` coincida con `request.auth.uid`.
- La creación valida los campos públicos permitidos y el tamaño del seudónimo.
- El archivo versionado es [`firestore.rules`](../../firestore.rules); las reglas activas de Firebase deben mantenerse idénticas.

### Riesgo pendiente — obligatorio antes de promoción pública

La proyección actual de `publicDreams` conserva `ownerId` y `sourceDreamId` para aplicar autorización. Aunque no se muestran en la UI, Firestore los entrega a cualquier lector público. Antes de una promoción amplia se debe migrar a una arquitectura que no exponga identificadores internos al cliente público (por ejemplo, una colección de publicación con propietario opaco y reglas/función de servidor apropiadas). No declarar “anonimato técnico” hasta completar esa migración.

## 5. Dirección visual: Memoria nácar

### Materiales

- **Perla:** acción, recuerdo y foco; materia luminosa, nunca botón de juego.
- **Frost:** superficies utilitarias y navegación.
- **Ópalo:** foco, detalle y composición editorial.
- **Niebla:** ambiente a muy baja opacidad.
- **Luz:** rojo eléctrico sólo para memoria, alerta crítica o foco significativo.

### Capas espaciales

`Z0` fondo · `Z1` atmósfera · `Z2` ambiente · `Z3` calendario · `Z4` superficies · `Z5` memoria enfocada · `Z6` navegación · `Z7` feedback.

### Movimiento

Cada animación debe servir continuidad, profundidad, foco, transformación o feedback. Se priorizan `transform` y `opacity`.

- Atmosfera: casi imperceptible, lenta y desactivable.
- Perla: expansión mínima en hover/focus/selección.
- Perla → Memoria: transición principal; el calendario recede y el detalle emerge de la Perla.
- Reduced motion: sin paralaje ni deriva continua; mantiene jerarquía, foco y feedback con crossfade corto o cambio inmediato.

Los tokens, variantes y decisiones están en [`docs/MOTION-SYSTEM.md`](MOTION-SYSTEM.md) y [`docs/MOTION-AUDIT.md`](MOTION-AUDIT.md).

## 6. Accesibilidad y responsive

### Obligatorio

- `lang="es"`, fechas `es-GT`, contraste suficiente y foco visible.
- Objetivos táctiles de al menos 44 px.
- Ninguna función depende exclusivamente de hover.
- Botones reales, labels persistentes, `aria-live` para estado y teclado completo.
- `prefers-reduced-motion` respeta ambiente, transiciones y foco.

### Viewports de control

`320×568`, `390×844`, `768×1024`, `1024×768`, `1366×768`, `1440×900`, `1920×1080`.

No se acepta overflow horizontal, calendario ilegible, texto recortado, foco perdido o controles inaccesibles.

## 7. Lenguaje y microcopy

- “Registrar sueño”, no “crear registro”.
- “Conservar cambios”, no “guardar objeto”.
- “Hacerlo público” explica la acción; “Compartir públicamente” confirma el alcance.
- “Hacer privado” comunica retiro del feed, no borrado de la memoria.
- “Sincronizar” se acompaña de una explicación de copia privada; nunca de una promesa vaga de seguridad.

La voz es íntima y humana, pero no esotérica ni ambigua en acciones irreversibles.

## 8. Checklist de liberación

### Producto y experiencia

- [x] Privado es el estado inicial de una memoria.
- [x] Sincronizar requiere una acción explícita tras iniciar sesión.
- [x] Publicar pide una confirmación y un seudónimo.
- [x] Retirar del feed conserva la memoria original.
- [x] El feed no muestra métricas ni identidad real en la interfaz.
- [x] Perla → Memoria y retorno preservan contexto del calendario.
- [x] La Nube-cortina abre creación sin competir con la memoria.
- [ ] El feed dispone de reportar, ocultar y moderación antes de crecimiento público.
- [ ] Se eliminan identificadores internos de documentos accesibles públicamente.
- [ ] Existe política de contenido, privacidad y retención para publicaciones públicas.

### Calidad técnica

- [x] Next.js exporta estáticamente para GitHub Pages.
- [x] Autenticación y Firestore funcionan con SDK cliente.
- [x] Reglas privadas y de publicación están versionadas.
- [x] `npm run lint`, `npm run typecheck`, `npm run test` y `npm run build` pasan antes de liberar.
- [ ] Pruebas E2E con dos cuentas demuestran aislamiento privado y retiro público.
- [ ] Pruebas de reglas Firestore mediante emulador/CI.
- [ ] Auditoría real de Lighthouse y axe de `/calendar` y `/explorar` en la URL publicada.

### Decisiones explícitamente diferidas

- [ ] Exportación e importación de datos.
- [ ] Comentarios, reacciones, perfiles, seguir personas o mensajería.
- [ ] Reportes, bloqueo, moderación y panel de revisión.
- [ ] ECoG, adjuntos biométricos, IA o análisis de sueño.
- [ ] Backend propio, secretos administrativos o analítica de contenido.

## 9. Protocolo de evolución

1. Definir la intención y los datos que implica antes de diseñar la UI.
2. Actualizar este documento y `firestore.rules` juntos si cambia visibilidad o autorización.
3. Implementar el flujo con estado vacío, carga, error, éxito, teclado y reduced motion.
4. Probar con una cuenta propietaria, otra cuenta y un visitante sin cuenta cuando el contenido sea público.
5. Ejecutar lint, typecheck, test y build estático; revisar la interfaz publicada.
6. Registrar defectos y evidencia en `docs/QA-ISSUES.md` y `docs/QA-SCORECARD.md`.
7. Eliminar cualquier efecto, control o dato que no contribuya a memoria, claridad o confianza.

## 10. Definition of Done del producto actual

Onirc estará listo para ampliar el calendario público cuando se cumplan todos los puntos:

- no existe exposición de identificadores internos o sueños privados en la superficie pública;
- publicar y retirar funcionan con dos cuentas y visitante sin cuenta;
- reportar/ocultar/moderar existe antes de fomentar descubrimiento social;
- el feed mantiene la calma editorial en móvil, escritorio y reduced motion;
- la auditoría de accesibilidad y rendimiento publicada no tiene defectos críticos;
- las políticas de contenido y privacidad explican con precisión qué es público.

Hasta entonces, Onirc es un diario de sueños privado con una **función de publicación consciente en fase temprana**, no una red social completa.
