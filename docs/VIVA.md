# Code defence practice

- Why transactions? A stock quantity update, movement record and audit entry must commit together. A failed transaction leaves all three unchanged.
- Why a replica set? MongoDB multi-document transactions require replica-set or sharded deployment support. The demo runs a real one-node replica set; it does not demonstrate high availability.
- How do you stop overselling? Transactions read and update the same product. Concurrent writes cause a transaction retry; the retry checks current quantity again. Negative results return 409.
- How does editing work? `current - delta(previous) + delta(next)`. Deleting reverses the previous effect; reversal is rejected if it would make stock negative.
- Why a stable client ID? Replaying an offline request after an ambiguous network failure must not apply a sale twice. A unique index plus matching actor/payload identifies a safe retry.
- Why both UI and backend permissions? UI controls communicate permissions; only server checks enforce them. A forged employee request still returns 403.
- Why not cache every API response? Shared HTTP caches can expose private inventory. The shell is cached separately; IndexedDB snapshots are user-scoped and cleared on logout.
- Why no optimistic offline quantity changes? Other staff may change stock while disconnected. The server must confirm the authoritative result.
- What is VAPID? It identifies the application server to a push provider. Subscription public-key material enables encrypted message delivery; private VAPID material stays server-side.
- Which patterns are used? Middleware chain for cross-cutting authentication/logging; API adapter for browser transport; command queue for offline mutations; pure domain functions for stock rules; database module for connection lifecycle. Do not claim GoF patterns solely to satisfy a rubric.
- What needs production improvement? Shared token revocation, durable notification outbox, persistent DB, HTTPS, monitoring, backup/restore drills, deployment secret management, and full external evidence.

Personalize the report reflection: describe what you actually changed, which assertion or log isolated a failure, and how you verified the correction. Be ready to open the code and trace one complete stock-out request.
