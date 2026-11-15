# Submission traceability

| Task | Implementation | Evidence / remaining action |
|---|---|---|
| 01 Setup | package.json, Vite config, Express entry, generated secrets | Actual PowerShell screenshot and transcript of a labeled fresh setup reproduction |
| 02 Configuration | .env.example, keys script, service worker, registration, JWT middleware | No secrets in report |
| 03 Frontend | Login, registration, dashboard, product CRUD, movement CRUD, role controls, validation | Browser evidence script captures built application; offline/cache checks |
| 04 Backend | MongoDB collections/indexes, transactional movement writes, audit, REST CRUD | Real replica-set integration tests; Atlas screenshots optional and pending account access |
| 05 Push | VAPID generation, PushManager, subscriptions, push events, test route | Real FCM subscription and delivery passed: one send, one received push event and one notification |
| 06 Unit tests | tests/domain.test.js and tests/api.test.js | Test transcript and verification results |
| 07 Troubleshooting | Pino, request IDs, conflict responses, debugger launch configuration | Actual Chrome DevTools breakpoint with expanded Watch pane and subsequent 409 response |
| 08 Design report | UML diagrams, persona, storyboard, UI design references | Supplied original preserved; six native editable Figma screen imports prepared; saved Figma file/link remains required |
| 08 Final report | Word report, evidence register, technical reflection and challenges | Postman, setup, debugger, push, persistent storage evidence and GitHub URL included; saved Figma URL and optional cloud evidence pending |

The rubric contains inconsistent overall feature weighting (the first table sums to 110 including viva; the task table sums to 100). Use the task allocation as the submission checklist and confirm weighting with the lecturer. Viva answers and personal reflection should be adapted to your own understanding and experience.
