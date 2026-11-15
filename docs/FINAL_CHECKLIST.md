# Before you submit

The application, reports, diagrams, screenshots, collection and tests are included. The reports are deliberately honest about remaining evidence.

- [x] Production React/Vite build succeeds.
- [x] MongoDB-backed product and stock movement CRUD, JWT roles and validation.
- [x] Real replica-set transactions and audit history.
- [x] 28 passing unit/API tests, including concurrent overselling and replay after deletion.
- [x] 13 passing browser checks and genuine UI/cache screenshots.
- [x] Offline reload, private IndexedDB snapshots and idempotent movement sync.
- [x] Web Push implementation and generated server-side VAPID keys.
- [x] Design/final Word reports, UML SVG/PNG/source, persona/storyboard and viva preparation.
- [x] 23-request Postman collection with assertions.
- [x] Postman collection: 23 requests and 25 assertions passed; four actual desktop response screenshots included.
- [ ] Create the high-fidelity Figma design file and add its actual URL/export evidence.
- [x] Actual PowerShell window and transcript of fresh frontend/backend setup reproduction.
- [x] Live Chrome DevTools breakpoint and expanded Watch pane during an API oversell rejection.
- [x] Real FCM browser subscription, encrypted send, received push event and browser notification verified.
- [x] Persistent local WiredTiger replica set: saved marker survived complete shutdown and restart.
- [x] GitHub repository created at https://github.com/arya4100/smartstock-inventory-pwa; final push verified by the publication script.
- [ ] Optional bonus: configure Atlas, show redacted replication/scaling evidence.
- [x] Evidence-based reflection completed in docs/REFLECTION.md and the report.
- [ ] Review the reflection, share the private repository with the assessor and practice the viva.

The Figma package is fully prepared in docs/figma: six high-fidelity screens with editable text, shapes, icons and colour styles. It still needs to be imported and saved in an authenticated Figma account; a local package cannot supply an actual Figma file URL. See docs/figma/README.md.

Update docs/submission.json and regenerate reports with `npm run report`. Add new evidence figures to scripts/report.js or directly to the Word report. Never include .env, tokens, cookies or private push keys in screenshots or commits.
