# Onirc — Briefing de producto, diseño y calidad

**Versión:** 3.1 — dirección de arte para una experiencia de premio
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
- El archivo versionado es [`firestore.rules`](../firestore.rules); las reglas activas de Firebase deben mantenerse idénticas.

### Riesgo pendiente — obligatorio antes de promoción pública

La proyección actual de `publicDreams` conserva `ownerId` y `sourceDreamId` para aplicar autorización. Aunque no se muestran en la UI, Firestore los entrega a cualquier lector público. Antes de una promoción amplia se debe migrar a una arquitectura que no exponga identificadores internos al cliente público (por ejemplo, una colección de publicación con propietario opaco y reglas/función de servidor apropiadas). No declarar “anonimato técnico” hasta completar esa migración.

## 5. Dirección de arte — Archivo de luz

### 5.1 Mandato creativo

La próxima iteración no debe intentar “verse más premium” añadiendo más transparencias, gradientes o movimiento. Debe convertirse en una **pieza editorial interactiva sobre el tiempo**.

La dirección recomendada es **Archivo de luz**: un diario que parece estar guardado en una vitrina de mañana, hecho de papel mineral, reflejos nacarados y silencio. No es una app de meditación, una interfaz espacial, una agenda digital ni una red social de bienestar. Es un instrumento íntimo de recuerdo que, de forma excepcional, puede dejar una copia en un archivo compartido.

La sensación objetivo es:

> “No estoy usando una herramienta. Estoy visitando un lugar que ya recuerda conmigo.”

Si una decisión visual no mejora esta frase, debe eliminarse.

### 5.2 Posicionamiento estético

| Debe sentirse como | No debe parecerse a |
| --- | --- |
| Un archivo editorial iluminado desde dentro | Un dashboard SaaS con tarjetas translúcidas |
| Una perla encontrada en una fecha | Un marcador de productividad o un logro |
| Un museo íntimo y contemporáneo | Una app de astrología, wellness o “sueños cósmicos” |
| Una interfaz del futuro que conserva tacto | Una demo de WebGL, juego o UI de criptomonedas |
| Una publicación cultural lenta | Un feed social con avatares, métricas y scroll ansioso |

**Regla de oro:** la singularidad proviene de la composición, el ritmo y la continuidad de las acciones; no de efectos que podrían pertenecer a cualquier producto.

### 5.3 Los cinco gestos de autoría

1. **El vacío es material.** Dejar áreas tranquilas no es falta de diseño. Es cómo se hace perceptible una Perla, un título o una decisión.
2. **Cada pantalla tiene una sola tensión principal.** Inicio: promesa. Calendario: tiempo. Detalle: narrativa. Composer: escritura. Explorar: archivo humano. Nunca compiten dos protagonistas.
3. **Las superficies se ganan.** Una lámina Frost u Ópalo sólo existe cuando establece jerarquía, protección o foco. No se usan como fondo de todo.
4. **La tipografía hace el trabajo emocional.** El contraste entre la serif editorial y la sans funcional debe crear pausa y confianza antes de que lo haga un gradiente.
5. **La luz señala significado.** El rojo eléctrico y el brillo nacarado aparecen como eventos escasos. Si son omnipresentes, dejan de contar una historia.

### 5.4 Principio de sustracción

Antes de aprobar un bloque visual, responder:

- ¿Qué información o relación hace más clara?
- ¿Qué emoción específica sostiene?
- ¿Podría desaparecer sin reducir claridad, jerarquía o memoria?

Si la última respuesta es “sí”, quitarlo. En especial: chips redundantes, bordes decorativos, botones secundarios con fondo, sombras profundas continuas, blobs grandes sin relación con el contenido, iconos junto a texto obvio y rótulos explicativos que el diseño ya debería comunicar.

## 6. Gramática visual prescriptiva

### 6.1 Distribución de color

Los valores exactos viven en tokens; estas proporciones son una herramienta de dirección de arte para revisar capturas, no una fórmula de CSS.

| Rol visual | Proporción objetivo | Uso |
| --- | ---: | --- |
| Lienzo cálido / carbón cálido nocturno | 70–78% | El silencio alrededor del contenido. Nunca debe verse gris de interfaz. |
| Neutros materiales: Perla, Frost, marfil | 14–20% | Navegación, controles esenciales y láminas ganadas. |
| Atmósfera: cian brumoso, lavanda, rubor, champagne | 4–7% | Luz distante; baja saturación y bordes difusos. |
| Tinta editorial | 4–6% | Títulos, texto y señales de lectura. Debe sostener contraste real. |
| Rojo eléctrico | Máximo 1.5% | Perla activa, foco crítico, error de alto significado. Nunca relleno decorativo. |

#### Reglas de color

- Ninguna pantalla debe usar un gradiente como “papel tapiz” de alto contraste. El gradiente está en la luz, no en el fondo entero.
- Día no es blanco clínico; Noche cálida no es negro invertido. Ambos comparten el mismo guion material.
- No usar azul de enlace estándar, verde de éxito genérico ni rojo de error como color dominante de una superficie. Las confirmaciones deben poder existir con texto, icono y cambio de estado, no sólo con color.
- Las publicaciones públicas no usan rojo para diferenciarse de las privadas. Público se expresa con contexto, seudónimo y una capa Ópalo contenida; rojo sigue significando memoria o riesgo.

### 6.2 Tipografía: escala, respiración y contraste

La interfaz debe alternar **lectura editorial** y **precisión instrumental**. La serif no es un adorno: expresa que una memoria tiene peso. La sans no es neutra: garantiza que acciones y estados se entiendan al primer vistazo.

| Rol | Familia | Escritorio | Móvil | Regla de composición |
| --- | --- | ---: | ---: | --- |
| Hero de inicio | Display serif | 88–148 px | 56–76 px | Máximo dos líneas; una pausa intencional, no un bloque lleno. |
| Mes del calendario | Display serif | 64–112 px | 48–68 px | Debe sentirse como título de una página, no como encabezado de widget. |
| Título de memoria | Display serif | 72–136 px | 52–72 px | Puede quebrarse; nunca reducirlo hasta perder presencia. |
| Título de publicación | Display serif | 36–56 px | 32–42 px | No competir con la narrativa ni crear tarjetas idénticas. |
| Cuerpo de memoria | Sans | 18–21 px / 1.65–1.78 | 17–19 px / 1.62–1.74 | Medida máxima: 42–50 caracteres aproximados por línea. |
| UI y metadatos | Sans | 13–15 px | 13–15 px | Contraste alto y espaciado de letras usado con moderación. |

#### Reglas tipográficas

- El display utiliza tracking negativo óptico, nunca compresión agresiva. Si un título largo se ve apretado, se altera composición o tamaño de bloque, no sólo `font-size`.
- Los rótulos en mayúsculas son señales de orientación, no decoración. Máximo una línea y tracking moderado.
- La fecha debe leer como una nota al margen, no como metadata de aplicación.
- Ningún texto funcional depende de una serif diminuta. Formularios, errores y control de cuenta usan sans de alta legibilidad.
- En la revisión visual, ocultar imágenes y gradientes: la jerarquía debe sobrevivir con tipografía y espacio.

### 6.3 Composición y grid

El grid debe dar orden sin revelar una cuadrícula burocrática.

| Viewport | Grid | Márgenes | Intención |
| --- | --- | --- | --- |
| 1440–1920 | 12 columnas, max-width 1440 px | 48–72 px | Grandes vacíos y tensión entre bloque editorial y campo temporal. |
| 1024–1366 | 12 columnas flexibles | 32–48 px | El calendario sigue siendo el plano dominante. |
| 768–1023 | 8 columnas | 24–32 px | Reordenar jerarquía; no reducir simplemente el desktop. |
| 320–767 | 4 columnas | 16–20 px | Una mano, lectura vertical y acciones siempre alcanzables. |

#### Gramática de composición

- No centrar todo. Una composición de premio necesita dirección: una masa editorial, un campo vacío y una contraparte material.
- Una pantalla puede tener un único elemento deliberadamente desplazado entre 4% y 8% de la alineación central para crear vida. El desplazamiento debe ser óptico, no aleatorio.
- El contenido de lectura no supera la medida editorial aunque la pantalla sea amplia.
- Evitar dos contenedores con borde dentro de otro contenedor con borde. Máximo una superficie elevada por zona de atención.
- En móvil, usar espacio vertical generoso antes que miniaturizar elementos. Si un calendario de siete columnas queda ilegible, se simplifica su tratamiento visual; no se hacen celdas más pequeñas que el toque posible.

### 6.4 Materiales: recetas y límites

| Material | Debe comunicar | Receta perceptual | Nunca usarlo para |
| --- | --- | --- | --- |
| **Perla** | Recuerdo, punto de entrada, foco | Reflejo claro en el cuadrante superior izquierdo, núcleo opaco suave, halo corto y sombra contenida. | Cada botón, avatar, decoración o indicador sin acción. |
| **Frost** | Herramienta cercana | Velo translúcido, borde de luz de 1 px, blur sólo si separa contenido real. | Card stack, fondos de formularios repetidos o toda la página. |
| **Ópalo** | Capa narrativa enfocada | Gradiente de tres luces muy desaturadas y superficie de lectura amplia. | Alertas, confirmaciones triviales o listas repetitivas. |
| **Niebla** | Profundidad periférica | Forma grande, opacidad baja, sin borde ni interactividad. | Partículas, confeti, textura continua o sustituto de contenido. |
| **Luz eléctrica** | Memoria activa o riesgo | Punto, filete o ring pequeño, con contraste de forma y texto. | Fondo total, CTA principal permanente o diferenciación público/privado. |

#### Límites técnicos visibles

- Máximo dos campos de blur relevantes por viewport; los demás se resuelven con opacidad, color y borde.
- No apilar más de dos sombras perceptibles en un mismo componente.
- No usar borde blanco completo alrededor de todas las tarjetas. Una superficie puede insinuarse por contraste de luz, no sólo por rectángulo.
- La Perla siempre tiene una lectura estática correcta; la animación sólo suma presencia.

### 6.5 Anti-patrones que se deben eliminar

| Señal de interfaz genérica | Sustitución Onirc |
| --- | --- |
| Grid de tarjetas idénticas | Campo editorial con ritmos, una sola superficie de foco y espacios sin borde. |
| “Glassmorphism” con blur en todo | Frost limitado a navegación, herramientas y capas realmente elevadas. |
| CTA primario, secundario y terciario visibles a la vez | Una acción emocional por pantalla; lo demás se retira o se vuelve texto discreto. |
| Tres blobs pastel por componente | Una luz responsable de una relación espacial concreta. |
| Animación de entrada en cada elemento | Revelado por grupos; contenido esencial disponible de inmediato. |
| Feed con avatar, hora, likes y comentarios | Placa editorial: Perla, título, texto, fecha y seudónimo. |
| Botón rojo para “público” | Ritual de publicación con explicación y Ópalo contenido. |

## 7. Dirección por experiencia

### 7.1 Portada — una invitación, no un onboarding

**Objetivo:** que en tres segundos se perciban luz, calma y sueño; en diez, que se entienda que existe un calendario personal.

#### Composición recomendada

```text
┌──────────────────────────────────────────────────────────────┐
│ marca                                         cuenta / tema    │
│                                                              │
│ DIARIO DE SUEÑOS                                              │
│ Tus sueños,                                                   │
│ visibles en el tiempo.            campo de luz / 3 perlas    │
│                                                              │
│ [ Abrir mi calendario ]           Empieza en este navegador  │
└──────────────────────────────────────────────────────────────┘
```

- La palabra “Onirc” aparece como firma, no como logotipo corporativo dominante.
- El hero es tipográfico. El campo de Perlas acompaña, no ilustra literalmente un sueño.
- Debe existir una sola CTA de producto. Acceso, apariencia y legal se comportan como herramientas discretas.
- La promesa de privacidad se escribe con precisión: “Empieza en este navegador”; no prometer cifrado, anonimato o nube sin la acción correspondiente.

#### Evitar

- estadísticas, “streaks”, tarjetas de beneficios, carruseles, screenshots de producto o tres botones de registro;
- ilustraciones de lunas, estrellas, galaxias, ojos o símbolos esotéricos;
- un hero centrado con todo flotando simétricamente.

### 7.2 Calendario personal — un paisaje temporal, no una planilla

**Objetivo:** que cada sueño parezca habitar una fecha; que los días vacíos sean silenciosos, no “faltantes”.

#### Reglas de composición

- El mes es el título principal y debe ocupar una porción generosa del primer tercio del viewport.
- La cuadrícula comparte un único plano; **los días no son 31 tarjetas redondeadas**. La delimitación vive en ritmo, cifras, líneas casi invisibles o cambios de luz, no en cajas repetidas.
- Un día sin sueño sólo necesita número y presencia mínima. No se rellena con punto decorativo, ícono o color de estado.
- Un día con un sueño: Perla anclada a la fecha, número aún legible, halo mínimo.
- Varios sueños: máximo tres microperlas en una constelación contenida y conteo textual accesible. No apilar globos luminosos.
- Hoy se distingue con un anillo fino o una nota de luz. Nunca debe competir con una memoria existente.
- El estado seleccionado suaviza el resto del plano; no pinta el día entero ni convierte la fecha en botón de productividad.

#### Escala y ritmo

- Desktop: las celdas deben respirar; priorizar vacío sobre llenar ancho.
- Móvil: conservar siete días, reducir el ruido de las líneas y garantizar al menos 44 px de objetivo para una Perla o una fecha interactiva.
- Los nombres de día se tratan como una leyenda atmosférica, no como encabezados de tabla pesados.

#### Prueba visual

Mirar el calendario a 25% de zoom. Debe seguir leyendo como un campo de tiempo con algunos recuerdos luminosos. Si se lee como 35 cajas grises, la dirección falló.

### 7.3 Detalle — entrar a una capa más quieta

**Objetivo:** que la memoria gane aire, peso y legibilidad sin borrar su relación con el mes.

- La superficie de detalle no es un modal convencional ni una tarjeta al centro. Es una cámara editorial que ocupa el foco del viewport.
- El calendario sigue perceptible detrás como distancia, con contraste reducido. Nunca desaparece mediante una pantalla negra opaca.
- La Perla de origen debe permanecer cerca del margen superior o convertirse en un punto de luz de la superficie; no se duplica como icono decorativo.
- Orden absoluto: título, fecha, cuerpo, acciones. Las acciones no pueden estar por encima de la narrativa.
- El cuerpo tiene margen de lectura real. Evitar columnas de texto demasiado anchas, bloques bajo imágenes ficticias o metadatos en cuadrícula.
- Editar, hacer público/privado y eliminar se colocan como herramientas de final de lectura. Eliminar no comparte jerarquía visual con publicar.

#### Regla de luz

Usar un campo de luz principal y, como máximo, una contraluz. Tres halos de color convierten Ópalo en plantilla de glassmorphism.

### 7.4 Registrar / editar — escribir antes de clasificar

**Objetivo:** que registrar se sienta como preservar un fragmento, no llenar un CRUD.

- La lámina es una hoja de memoria: alta, limpia, con borde de material ligero y una jerarquía vertical evidente.
- El foco inicial puede estar en el título o en la narrativa según investigación posterior, pero no se ocultan fecha, título o cuerpo detrás de pasos que sorprendan.
- La fecha se presenta como contexto (“¿Cuándo ocurrió?”), no como campo administrativo aislado.
- El textarea es el mayor espacio funcional del formulario; debe invitar a escribir, no parecer una caja comprimida.
- Borrador, validación y confirmación se integran como notas pequeñas cercanas al campo o al gesto de guardar.
- Guardar siempre crea una memoria privada. **La publicación vive después, al releer la memoria**, no como switch rápido dentro del primer acto de escritura. Esta separación es una decisión de confianza y de dirección de arte.

#### Ejemplo de jerarquía

```text
REGISTRAR SUEÑO
Guardemos lo que todavía está cerca.

Título del sueño            [ Una frase para volver              ]
¿Cuándo ocurrió?            [ 13 ago 2026                       ]
¿Qué recuerdas?             [                                   ]
                            [  espacio narrativo amplio          ]
                            [                                   ]

El borrador se conserva aquí.       Dejarlo por ahora  [ Registrar ]
```

### 7.5 Publicar — una decisión editorial, no un toggle

**Objetivo:** hacer consciente el paso de diario a archivo compartido.

La hoja de publicación debe tener una composición propia y breve:

1. Título: **“¿Dejarlo a la vista?”**
2. Alcance claro: “Se creará una copia visible en el Espacio público. Tu memoria original seguirá privada.”
3. Vista previa mínima de título, fecha y primera línea; nunca una duplicación de todo el detalle.
4. Campo de seudónimo: “Firma pública”.
5. Botón: **“Compartir públicamente”**.
6. Acción secundaria: “Mantener privado”.

- El seudónimo se presenta como firma editorial, no como handle de red social: sin `@`, contador, avatar ni sugerencias de contacto.
- Público usa lenguaje sobrio y una luz Ópalo contenida. No usar rojo, iconos de megáfono o avisos alarmistas.
- Al retirar, el texto confirma el efecto: “La copia pública se retirará; tu memoria privada seguirá aquí.”

### 7.6 Espacio público — archivo colectivo con seudónimo

**Objetivo:** hacer que una publicación se sienta encontrada, no consumida.

- Nombrar el espacio “Espacio público” o “Archivo abierto”; evitar “feed”, “trending”, “comunidad” o “para ti”.
- Usar una cuadrícula editorial estable, no masonry. La estabilidad permite que los textos respiren y que un recuerdo no se convierta en contenido de scroll infinito.
- Cada publicación se resuelve como una placa ligera, con variación de escala controlada por longitud o posición, no por popularidad.
- El seudónimo aparece al final como colofón: `por Marea quieta`. Es una firma, no un perfil.
- No hay avatar, reacción, contador, hora relativa, algoritmo ni CTA de seguimiento.
- El vacío inicial debe ser hermoso y honesto: “Todavía hay silencio.” No usar contenido ficticio para simular comunidad.

#### Ritmo de galería

- Desktop: 3 columnas sólo si la medida de texto sigue cómoda; 2 columnas si el contenido lo requiere.
- Tablet: 2 columnas con espacio generoso.
- Móvil: 1 columna; cada pieza debe poder leerse sin que parezca una tarjeta de red social.
- Una publicación destacada puede ocupar dos columnas sólo si es editorialmente justificada, nunca por engagement.

### 7.7 Cuenta, sincronización y tema — herramientas que no roban la escena

- La cuenta no debe parecer un embudo comercial. El acceso se siente como abrir una puerta silenciosa.
- El estado de sincronización debe responder con hechos: listo, sincronizando, sincronizado, error. Nunca usar iconos de nube sin texto.
- La apariencia se agrupa como una utilidad de material; no como una gran tarjeta de ajustes.
- No mostrar correo completo de forma persistente en la cabecera. Usar una forma breve de identidad y revelar más sólo donde sea necesario.

## 8. Interacción y movimiento como dirección de arte

### 8.1 Regla de cámara única

Onirc debe sentirse filmado por una sola cámara tranquila. Cada transición conserva origen, escala y profundidad. Si una interacción usa un slide lateral, otra un zoom brusco y otra un fade genérico, la experiencia se fragmenta.

| Momento | Origen espacial | Duración / carácter | Resultado que se busca |
| --- | --- | --- | --- |
| Hover/focus de Perla | La propia Perla | 160–220 ms, escala mínima | “Puedo acercarme.” |
| Perla → Memoria | Fecha seleccionada | 600–820 ms, curva suave | “Me moví hacia este recuerdo.” |
| Retorno | Superficie de memoria | Misma familia, inversa | “Volví a su fecha.” |
| Nube-cortina | Control fijo de creación | 180–340 ms | “La acción estaba detrás de una capa.” |
| Guardar | Fecha elegida | 240–420 ms | “Ahora vive aquí.” |
| Publicar | Detalle de memoria | 240–420 ms, sin celebración | “Una copia entró al archivo abierto.” |
| Navegar mes | Campo calendario | 180–280 ms, casi estático | “El tiempo cambió, yo sigo orientado.” |

### 8.2 Coreografías obligatorias

#### Perla → Memoria

1. El botón recibe foco antes de cualquier interpolación.
2. La Perla aumenta luz y escala de forma casi imperceptible.
3. El calendario baja prioridad, no legibilidad.
4. La superficie se manifiesta desde la posición de la Perla; título primero, fecha después, cuerpo listo para leer.
5. El regreso devuelve foco al botón de la Perla de origen, incluso con teclado y reduced motion.

#### Crear → Preservar

1. La Nube-cortina abre la lámina sin barrer toda la pantalla.
2. El formulario gana foco de escritura en menos de 100 ms.
3. Al guardar, no hay modal de éxito, confeti ni toast triunfalista dominante.
4. El formulario recede y aparece la nueva Perla en la fecha correspondiente.
5. El mensaje de estado es complementario: el objeto resultante es la confirmación.

### 8.3 Lo que no se anima

- Cada día del calendario al cambiar de mes.
- Texto de lectura, especialmente párrafos narrativos.
- Sombras o blur grandes de forma continua.
- La posición de contenido que el usuario intenta leer o alcanzar.
- Cualquier feedback de error con rebote, vibración o destello rojo repetido.

### 8.4 Reduced motion

En modo reducido, la dirección se conserva mediante orden, contraste y foco:

- Perla → Memoria: crossfade corto o cambio inmediato con la misma jerarquía.
- Atmósfera: inmóvil.
- Nube: cambio de opacidad o etiqueta visible; no deriva.
- Acciones: estado textual, ring de foco y confirmación estática.

Los tokens y el inventario de movimiento se mantienen en [`MOTION-SYSTEM.md`](MOTION-SYSTEM.md) y [`MOTION-AUDIT.md`](MOTION-AUDIT.md).

## 9. Responsive, accesibilidad y rendimiento

### 9.1 Móvil como modo de intimidad

Móvil no es una maqueta encogida. Es el estado natural de alguien que acaba de despertar.

- La navegación superior debe ocupar una línea limpia y no forzar cuatro controles con iconos ambiguos.
- El mes permanece monumental, pero no desplaza el calendario útil por debajo del primer scroll sin razón.
- La Perla y la Nube-cortina tienen objetivo táctil real de 44 px aunque su materia visible sea menor.
- El detalle funciona como una capa de lectura completa; no deja columnas laterales ni tarjetas encajonadas.
- La publicación se revisa en vertical: texto de alcance antes del botón, seudónimo visible y acciones separadas.

### 9.2 Criterios de accesibilidad visibles

- `lang="es"`, fechas `es-GT`, semántica de botones y calendario, labels persistentes y anuncios de estado.
- Un foco visible debe pertenecer al material: ring de Luz o cambio de borde/luma suficiente. No ocultar focus para preservar “minimalismo”.
- El contraste se prueba sobre el estado final de cada gradiente, no sobre el token aislado.
- Los días con recuerdos se distinguen por Perla, texto accesible y jerarquía; nunca por color solamente.
- Ninguna publicación pública debe requerir hover para revelar autor, fecha o acción.
- Las acciones destructivas y de visibilidad explican consecuencia antes de confirmar.

### 9.3 Presupuesto de rendimiento

- Priorizar CSS y Motion con `transform`/`opacity`; no introducir WebGL, canvas, video de fondo ni scroll-jacking.
- Máximo dos formas ambientales animadas; ninguna en reduced motion.
- `backdrop-filter` sólo en superficies pequeñas de elevación real.
- Cargar tipografías con fallback visualmente compatible; no permitir salto de layout que cambie la composición hero.
- El contenido y los controles esenciales deben ser útiles antes de que termine cualquier ambiente visual.

### 9.4 Viewports y pruebas visuales

`320×568`, `390×844`, `430×932`, `768×1024`, `1024×768`, `1366×768`, `1440×900`, `1920×1080`.

Para cada viewport revisar: densidad del calendario, posición de Nube-cortina, lectura de títulos largos, navegación, foco, publicación, estados de error y ausencia de overflow horizontal.

## 10. Sistema de contenido y voz

### 10.1 Tono

La voz es clara, íntima y contemporánea. La poesía vive en la promesa, los vacíos y los estados de inicio; las acciones hablan de forma concreta.

| Intención | Sí | No |
| --- | --- | --- |
| Registrar | “Registrar sueño” | “Crear registro”, “Añadir objeto” |
| Guardar | “Conservar cambios” | “Submit”, “Guardar objeto” |
| Publicar | “Hacerlo público” | “Activar social”, “Postear” |
| Confirmar alcance | “Crearás una copia visible…” | “¿Seguro?” sin contexto |
| Retirar | “Hacer privado” | “Despublicar” o “Eliminar” ambiguo |
| Vacío | “Todavía hay silencio.” | “No hay datos.” |
| Error | “La copia privada no pudo actualizarse.” | “Error 500” o “Algo salió mal.” |

### 10.2 Reglas de microcopy

- Una oración por mensaje de sistema cuando sea posible.
- Evitar adjetivos que no cambian una decisión: “mágico”, “increíble”, “especial”, “hermoso”.
- Nunca usar la poesía para ocultar un efecto de privacidad, borrado, red o publicación.
- Mostrar el sujeto de una consecuencia: “Tu memoria original seguirá privada.”
- El seudónimo no se llama “usuario”, “handle” o “nombre de perfil”; se llama “Firma pública” o “Seudónimo”.

## 11. Brief de implementación para la siguiente vuelta

### Fase A — Quitar el ruido antes de añadir identidad

**Objetivo:** recuperar el vacío y reducir la apariencia de card stack.

- Eliminar fondos, bordes y sombras que no expresen jerarquía.
- Convertir el calendario de colección de celdas a plano temporal compartido.
- Reducir las luces ambientales a una composición responsable por página.
- Revisar todos los componentes para que Perla, Frost y Ópalo tengan un uso exclusivo y reconocible.

**No iniciar** ilustración, nuevas funciones sociales ni más animación antes de terminar esta fase.

### Fase B — Hacer tangible el tiempo

**Objetivo:** que el calendario se reconozca de inmediato como Onirc sin mirar el logo.

- Rediseñar días vacíos, sueño único, múltiples sueños, hoy, hover, focus y seleccionado como una familia material.
- Hacer que el mes y el vacío superior definan el ritmo editorial.
- Validar 25% zoom, teclado, móvil y reduced motion antes de pulir luces.

### Fase C — Dar peso a la memoria

**Objetivo:** convertir Perla → Memoria en la prueba central de autoría.

- Refinar origen compartido, receso de contexto, lectura y retorno.
- Diseñar detalle y composer como dos capas distintas: contemplar vs escribir.
- Probar títulos de 1, 3 y 10 palabras; cuerpos de 20, 400 y 2,000 caracteres.

### Fase D — Afinar el archivo público

**Objetivo:** que publicar sea cuidadoso y explorar sea lento.

- Diseñar la lámina de publicación como ritual editorial, no confirmación genérica.
- Rehacer el feed como archivo estable y seudónimo, sin señales de engagement.
- Resolver primero el riesgo técnico de identificadores internos antes de promover el área públicamente.

### Fase E — Prueba de premio

**Objetivo:** demostrar coherencia, no declararla.

- Capturar inicio, calendario vacío/poblado, detalle, composer, publicación y explorar en todos los viewports.
- Grabar Perla → Memoria y Nube-cortina en movimiento normal y reducido.
- Recorrer con una cuenta local, cuenta sincronizada, segunda cuenta y visitante.
- Ejecutar revisión de sustracción y retirar el 10–15% de elementos de menor propósito antes de la última ronda de pulido.

## 12. Puertas de dirección de arte y checklist de liberación

### 12.1 Prueba de cinco segundos

- [ ] Sin leer, se perciben luz, silencio y una relación con el tiempo.
- [ ] La pantalla no se confunde con una app de productividad, wellness o una plantilla de glassmorphism.
- [ ] Sólo existe un protagonista visual claro.
- [ ] El contraste y la jerarquía sobreviven al ocultar gradientes y movimiento.

### 12.2 Prueba de una tarea

- [ ] Una persona nueva entiende cómo registrar un sueño sin tutorial.
- [ ] Una fecha con sueño se entiende como memoria, no como evento o tarea.
- [ ] La decisión de sincronizar se entiende sin promesas vagas de privacidad.
- [ ] La decisión de hacer público se entiende como creación de una copia y no como cambio accidental de la original.
- [ ] El Espacio público se reconoce como archivo seudónimo, no como red social.

### 12.3 Prueba de materialidad

- [ ] Cada Perla se siente física sin parecer un globo, una partícula o un premio de juego.
- [ ] Frost aparece sólo en herramientas o capas que necesitan separación.
- [ ] Ópalo se reserva para foco narrativo y no se repite como tarjeta.
- [ ] La atmósfera se percibe después de mirar, no antes que el contenido.
- [ ] Rojo eléctrico es escaso, semántico y nunca es el color de fondo predominante.

### 12.4 Prueba de ritmo y responsive

- [ ] Inicio, calendario, detalle, composer y explorar tienen composiciones propias, no un mismo template.
- [ ] Móvil conserva escala emocional, objetivo táctil y lectura sin encoger desktop.
- [ ] Ningún flujo depende de hover, scroll especial o animación para entenderse.
- [ ] Reduced motion conserva la misma jerarquía y control.
- [ ] No hay overflow horizontal, saltos de layout perceptibles ni controles cortados.

### 12.5 Prueba de confianza

- [x] Privado es el estado inicial de una memoria.
- [x] Sincronizar requiere una acción explícita tras iniciar sesión.
- [x] Publicar pide una confirmación y un seudónimo.
- [x] Retirar del feed conserva la memoria original.
- [ ] Se eliminan identificadores internos de documentos accesibles públicamente.
- [ ] Existe reportar, ocultar y moderación antes de fomentar descubrimiento social.
- [ ] La política de privacidad explica con precisión qué se guarda localmente, qué se sincroniza y qué se hace público.

### 12.6 Evidencia obligatoria para una candidatura visual

| Área | Evidencia mínima |
| --- | --- |
| Dirección de arte | Capturas comparables de todas las pantallas clave, con una nota que nombre protagonista, material y tensión de cada una. |
| UX | Recorrido de primera visita, registro, edición, borrado/deshacer, sincronización, publicación y retiro. |
| Movimiento | Grabaciones de Perla → Memoria, retorno, Nube-cortina y reduced motion. |
| Accesibilidad | Teclado, foco visible, lector de pantalla básico, contraste y objetivos táctiles. |
| Ingeniería | `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`, consola limpia y auditoría de rendimiento. |
| Confianza | Pruebas con dos cuentas y visitante; ningún privado o identificador interno en superficie pública. |

## 13. Definition of Done de la siguiente iteración

La siguiente vuelta de diseño estará terminada sólo cuando:

1. la plataforma se reconoce como Onirc por su relación entre Perla, vacío, tipografía y calendario, incluso sin logo;
2. el calendario deja de leerse como una matriz de tarjetas y se convierte claramente en un paisaje temporal;
3. Perla → Memoria es más memorable que cualquier efecto ambiental;
4. la publicación se siente deliberada, seudónima y reversible;
5. el Espacio público se percibe como archivo cultural contenido, no como un feed de engagement;
6. móvil, teclado, contraste y reduced motion conservan la misma dignidad visual;
7. se han quitado, no añadido, elementos sin responsabilidad visual;
8. las pruebas técnicas, de privacidad, accesibilidad y responsive no tienen defectos P0/P1 conocidos.

Hasta entonces, no se agrega una nueva función. El camino hacia una experiencia de premio es **menos ruido, más intención y más continuidad por interacción**.
