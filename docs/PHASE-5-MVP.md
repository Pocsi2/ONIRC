# ONEIRIC Phase 5 — Usable Dream Journal MVP

Phase 5 turns the visual prototype into a usable local-first journal while keeping backend work out of scope for Phase 6.

## Product decision

The temporary persistence adapter is browser `localStorage` under `oneiric:dreams:v1`. The UI consumes a small `useDreamStore` contract instead of reading storage directly. This keeps the next migration to a database or Supabase adapter contained.

## Included

- Create a dream from New Dream.
- Reveal the new pearl in the correct calendar month.
- Browse months with working previous/next controls.
- Open seeded and user-created dreams from the temporal landscape.
- Edit a dream on a dedicated route.
- Delete a dream with an inline confirmation.
- Preserve the pearl-to-memory visual relationship for created and edited dreams.
- Keep keyboard labels, focus states, readable confirmations, and reduced-motion behavior.

## Deliberately deferred

- Authentication.
- Database or Supabase persistence.
- Multi-user synchronization.
- AI, export, analytics, and dark mode.

## Migration seam for Phase 6

The Phase 6 persistence layer should implement the operations currently exposed by `useDreamStore`:

- `addDream`
- `updateDream`
- `removeDream`
- `getDream`
- collection subscription / hydration

The visual components should not need to know whether those operations are backed by local storage, an API, or a database.
