# Testing and genuine evidence

1. Run `npm test`. Keep `evidence/tests.txt`; assertions verify domain boundaries, auth, roles, CRUD, duplicate replay, oversell rollback, concurrent sale conflicts and push URL restrictions.
2. Build and start the app. Run `npm run evidence`. It uses installed Edge (or `BROWSER_PATH`) via Playwright; no simulated browser screenshots are substituted for actual UI evidence.
3. Import the Postman collection. Run login manager, create/read/update/delete product, create/read/update/delete movement, employee forbidden, invalid input, oversell and push requests. The login script stores the bearer token. Capture actual Postman windows with responses, status and assertions. Browser/HTTP test evidence does not count as Postman evidence.
4. In Chrome/Edge DevTools > Application: show Service Workers, Cache Storage (`smartstock-shell-v1`) and IndexedDB (`smartstock-private`). Go offline, reload the same authenticated tab, record a movement, inspect the queue, reconnect and confirm it synchronizes once.
5. For a stock conflict, queue an OUT movement offline, reduce available quantity in another session, reconnect and check the visible conflict. Discard it and submit a valid quantity. No stock silently disappears.
6. VS Code: open this folder, launch **Debug SmartStock API**, set a breakpoint on `reconcile` in `server/domain.js`, add `current`, `previous`, `next`, `result` to Watch. Send an oversized stock-out. Step through and capture actual watched values plus the 409 response. Never capture `.env`, cookies, authorization headers or VAPID private keys.
7. Push: use built localhost or HTTPS. Settings > Enable notifications. Allow browser permission. As manager send a test notification, then record stock-out crossing the minimum. Capture the actual OS notification. Check `/api/push/test` sent/failed counts. If browser/OS blocks delivery, report that limitation rather than claiming success.
8. Optional Atlas: use a restricted DB user, IP access list, replica-set-backed cluster, and encrypted URI. Show redacted cluster topology, collections and indexes. Explain horizontal scaling as a future configuration unless actually enabled.

Automated screenshots and test output establish only what they actually demonstrate. A generated report must not describe pending external evidence as completed.
