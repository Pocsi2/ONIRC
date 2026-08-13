# Onirc — Scorecard QA

Fecha: 13 de agosto de 2026
Release evaluado: diario local estático para GitHub Pages.

| Área evaluable en este release | Resultado | Evidencia |
| --- | ---: | --- |
| Dirección de arte y materiales | 8.3 / 10 | Revisión visual de portada y calendario; tokens Perla/Frost/Ópalo. |
| Comprensión y flujo local | 8.2 / 10 | E2E: crear, abrir, editar, borrar, deshacer. |
| Responsive y tacto | 8.0 / 10 | Proyectos E2E desktop y móvil; controles mínimos de 44 px. |
| Accesibilidad | 8.7 / 10 | axe desktop/móvil sin violaciones; teclado y reduced motion cubiertos. |
| Movimiento y continuidad | 8.3 / 10 | `layoutId` Perla → Memoria, retorno de foco, auditoría actualizada. |
| Rendimiento y estabilidad | 8.2 / 10 | Exportación estática, sin API, sin imágenes pesadas, build y consola E2E limpios; Lighthouse CI alcanza 94 / 100 y 93 / 100 de rendimiento, con accesibilidad 100 / 100. |
| Voz y contenido | 8.4 / 10 | Español, microcopy local claro, sin promesas de nube o cuenta. |

**Promedio del alcance estático:** 8.3 / 10.

No se asigna puntuación integral sobre el briefing de 100 puntos: autenticación, privacidad por usuario, visibilidad pública, moderación y exportación fueron diferidos deliberadamente y no se consideran cumplidos.

## Comandos aprobados

```text
npm run lint
npm run typecheck
npm run build
npm run test
npm run test:e2e
npm run qa:lighthouse
```

## Evidencia E2E

- Desktop y móvil: crear → abrir → editar → eliminar → deshacer.
- Desktop y móvil: varias memorias en una fecha → colección finita → retorno al calendario.
- Desktop y móvil: `prefers-reduced-motion: reduce` y análisis axe sin violaciones.
- El servidor E2E sirve `out/`, la misma exportación que consumirá GitHub Pages.

## Evidencia Lighthouse CI

- Portada: rendimiento 94 / 100, accesibilidad 100 / 100 en la medición móvil local.
- Calendario: rendimiento 93 / 100, accesibilidad 100 / 100 en la medición móvil local.
- Los reportes se guardan localmente en `artifacts/lighthouse/` y no se publican ni contienen memorias del usuario.
