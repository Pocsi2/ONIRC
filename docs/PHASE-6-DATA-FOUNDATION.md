# ONEIRIC Phase 6 — Persistence + Data Foundation

Phase 6 hardens the usable MVP without introducing authentication or a remote service. The application now has a clear migration seam for a future API or database.

## Repository contract

`src/lib/dreams-repository.ts` owns storage concerns. Components consume `useDreamStore` and do not know whether the data is local, remote, cached, or synchronized.

The repository exposes:

- `load()`
- `save(dreams)`
- `subscribe(listener)`
- `status()`

## Storage format

Current key: `oneiric:dreams:v2`

Current envelope:

```json
{
  "version": 2,
  "dreams": []
}
```

The previous Phase 5 key, `oneiric:dreams:v1`, is read and migrated automatically. Records are validated before entering the application state. Invalid payloads never crash the experience; the seed landscape is restored and the user receives a quiet status message.

## Failure behavior

- Browser storage unavailable: continue with an in-memory session store.
- Storage full: keep the current session usable and expose a status message.
- Invalid serialized data: recover to the seed landscape without rendering corrupt records.
- Multiple tabs: listen for storage changes and refresh the temporal landscape.

## Deferred remote layer

Authentication, API routes, database schema, Supabase, conflict resolution, and multi-user ownership remain deferred. They belong in a later backend phase and should implement the repository contract rather than leak infrastructure decisions into visual components.
