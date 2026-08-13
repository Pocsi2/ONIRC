# Onirc — Historial de Phase 5

> Documento histórico. La edición vigente es el diario local estático documentado en `DESIGN-BRIEF.md` y `docs/BRIEFING-COMPLIANCE.md`.

Phase 5 turns the visual prototype into a usable local-first journal. Phase 6 now hardens that local persistence behind a replaceable data layer.

## Product decision

The UI consumes a small `useDreamStore` contract instead of reading storage directly. Browser persistence is implemented by the Phase 6 repository under `oneiric:dreams:v2`, with migration support for the original `v1` array.

## Included

- Create a dream from New Dream.
- Reveal the new pearl in the correct calendar month.
- Browse months with working previous/next controls.
- Open seeded and user-created dreams from the temporal landscape.
- Edit a dream on a dedicated route.
- Delete a dream with an inline confirmation.
- Preserve the pearl-to-memory visual relationship for created and edited dreams.
- Keep keyboard labels, focus states, readable confirmations, and reduced-motion behavior.

## Out of scope for the local-first MVP

- Authentication.
- Remote database persistence.
- Multi-user synchronization.
- AI, export, analytics, and dark mode.

## Migration seam for remote persistence

The future remote persistence layer should implement the operations currently exposed by `useDreamStore`:

- `addDream`
- `updateDream`
- `removeDream`
- `getDream`
- collection subscription / hydration

The visual components should not need to know whether those operations are backed by local storage, an API, or a database.
