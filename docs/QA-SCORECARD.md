# Onirc — Scorecard QA

Fecha: 14 de agosto de 2026
Release: **Archivo de luz — Release Candidate**

## Evidencia de esta rama

| Área | Estado | Evidencia |
| --- | --- | --- |
| Dirección de arte y materiales | Verificado | Sustracción de superficies: Perla para memoria, Frost para controles y Ópalo para foco. El calendario es una trama temporal, no tarjetas por fecha. |
| Flujo local | Aprobado | Playwright: crear, edición, eliminación/deshacer, colección múltiple, escritura progresiva y retorno a la perla. 8/8 recorridos aprobados. |
| Privacidad pública | Protegida / congelada | Reglas productivas bloquean escrituras públicas de navegador. Emulador cubre propietaria, visitante, segunda cuenta, proyección visible, fuga heredada y escritura directa: 4/4. |
| Funciones confiables | Compilado; no desplegado | `functions/` pasa lint y compilación. Su despliegue requiere Blaze, WIF y aprobación del propietario. |
| GitHub Pages | Pendiente de CI remoto | El build local produce `out/` con `/`, `/calendar/` y `/explorar/`. El workflow verifica artefacto y smoke test después del despliegue. |
| Lint, tipos y unitarias | Aprobado | `npm run lint`, `npm run typecheck` y `npm run test`: 3 archivos / 7 pruebas. |
| Reglas Firestore | Aprobado localmente | `npm run test:rules` con emulador Firestore y Temurin 21 portátil: 1 archivo / 4 pruebas. CI instala Java 21. |
| Accesibilidad | Aprobado en regresión | axe no detecta violaciones críticas; etiquetas persistentes, semántica, foco de retorno, objetivos de 44 px y fallback reduced motion están cubiertos en E2E. |
| Rendimiento | Aprobado | Lighthouse local: inicio 97, calendario 95, accesibilidad 100 en ambos. Firebase/Auth se difiere hasta sesión conocida o intención explícita. |
| Responsive | Cobertura automatizada | Playwright ejecuta los recorridos en escritorio y móvil. La revisión visual final por matriz completa espera el SHA publicado. |

## Gates de cierre restantes

1. Subir la rama, abrir PR y aprobar CI remoto sobre el SHA exacto.
2. Hacer merge a `main` y confirmar Pages con smoke test de `/`, `/calendar/` y `/explorar/`.
3. Revisar visualmente el sitio publicado en 320, 390, 768, 1366, 1440 y 1920 px, incluida la sesión real de Firebase.
4. Mantener el archivo público congelado hasta que exista aprobación de Blaze, Workload Identity Federation, migración ensayada y auditoría de proyecciones.

No se adjudica todavía una candidatura de premio: la release candidate necesita la evidencia del despliegue real y la revisión humana final.
