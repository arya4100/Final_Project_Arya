# SmartStock

A React/Vite progressive web application for small business inventory, built to match the supplied SmartStock design contract. Node 22.12+ is required.

## Run locally

```powershell
npm ci
npm run keys
npm run build
npm start
```

Run the commands from the project folder. After initial setup, double-click `Start-SmartStock.cmd` or run `npm start`. Wait for the API-ready message, then open **http://127.0.0.1:4000**. Press Ctrl+C in the launcher to stop it. The built version enables the service worker. Development: `npm run dev`, open http://127.0.0.1:5173 (service worker intentionally disabled in development).

Demo accounts (only when `SEED_DEMO=true`): `manager@smartstock.demo` and `employee@smartstock.demo`, password `SmartStock!2026`. Public registration always creates employees. Do not deploy with seeded accounts.

The default example uses a **real, persistent local MongoDB replica set** through mongodb-memory-server with WiredTiger storage in `.data/mongodb`, bound to `127.0.0.1:27028`. The first start downloads a MongoDB binary and requires internet. Data survives restarts, verified with an on-disk marker. Tests use separate disposable databases. To use your own replica set or Atlas, set both `LOCAL_DATABASE=false` and `DEMO_DATABASE=false`, then configure `MONGODB_URI`. Transactions require a replica set. Keep `.env` private and restrict its Windows ACL to your account. Production needs HTTPS, a persistent MongoDB replica set, `NODE_ENV=production`, a correct `APP_ORIGIN`, secure secret storage, and an explicit provisioning process for manager accounts.

## Commands and deliverables

| Command | Purpose |
|---|---|
| `npm test` | Domain and HTTP integration tests using a real MongoDB test replica set |
| `npm run build` | Production frontend |
| `npm run evidence` | Browser checks and genuine UI/cache screenshots; requires running built app and Edge/Chrome |
| `npm run report` | Generate design and final Word reports from recorded evidence |
| `npm run keys` | Generate ignored JWT and VAPID secrets once, preserve existing secrets |

See `docs/REQUIREMENTS.md`, `docs/TESTING.md`, `docs/DEPLOYMENT.md`, and `docs/VIVA.md`. Import `docs/SmartStock.postman_collection.json` into Postman. Reports live in `docs/`. Screenshots and validation records live in `evidence/`.

## Architecture and invariants

React components call an API adapter; IndexedDB is a private snapshot and offline command queue. Express authentication/authorization middleware guards all business endpoints. Zod schemas allow only known fields; MongoDB repositories use explicit filters and `$set` updates. The domain functions `delta` and `reconcile` centralize quantity arithmetic. MongoDB transactions combine product, movement, and audit writes. A unique `clientId` implements idempotent creation; payload and actor must match on retries. A retained command result prevents a deleted movement from being resurrected by a late retry. Optimistic product versions detect stale metadata edits.

Product quantity can be set at creation. Subsequent changes use movements. Movement edits reverse the prior effect and apply the replacement atomically. Movement deletion reverses its effect; an impossible reversal returns 409. Products with current movement history cannot be deleted. Deleted movements remain represented in the append-only audit collection.

## Offline contract

Visit and sign in online first in the same browser tab. The service worker caches the app shell and static assets, never API responses. IndexedDB holds user-scoped snapshots and pending movement creates. A sessionStorage identity enables offline viewing in the existing tab; it is not authentication and never grants server access. A closed tab requires online sign-in again. Offline changes do not optimistically alter confirmed inventory. Reconnect triggers authenticated, idempotent retries. A 409 stays in the queue with its reason; discard and enter a corrected movement. Product changes and movement edit/delete require online access. Sign-out clears private snapshots and queued changes after warning about pending work.

## Security boundaries and known limits

JWTs expire after two hours; the browser uses HttpOnly, SameSite=Strict cookies (Secure in production). The login response also supplies a bearer token for Postman; the frontend does not persist it. Explicit Origin checks defend browser mutations. Passwords use bcrypt. Authentication endpoints are rate limited; errors use request IDs and Pino logs omit passwords, tokens and subscription keys. Push subscriptions accept known HTTPS provider hosts to reduce SSRF exposure; encrypted delivery uses web-push and VAPID secrets on the server.

This is a single-store coursework system. JWT logout denylisting is process-local, so production with multiple API instances needs a shared revocation store or a server session store. Push delivery is best-effort after transaction commit; production should use a durable transactional outbox. The browser queue syncs when the app is open and reconnects, without claiming background delivery while closed. Full user/team administration, purchasing, and sales integrations are outside the supplied design.

No grade is guaranteed. Actual Postman, debugger, setup-reproduction and real push-delivery evidence are included. A six-screen editable Figma package is ready in `docs/figma`; importing it into a signed-in Figma account and recording its URL remains required. Cloud evidence is optional. Never replace that evidence with fabricated screenshots.

## Repository and additional verification

GitHub: https://github.com/arya4100/Final_Project_Arya (public).

Run `npm run test:api-collection` for the 23-request Postman collection, `npm run verify:persistence` with the app stopped for a database restart check, and `npm run figma:package` with the built app running to refresh the editable design import package. Actual desktop screenshots, live Watch values and FCM delivery results are in `evidence/`.

### Testing notification popups

In Settings, click **Enable notifications**, allow browser permission, then click **Send test notification**. Both employees and managers can test their own browser; test requests cannot notify another account. A push-service acceptance message confirms sending, while Windows notification permissions and Do not disturb determine whether a desktop popup is shown.

When a real push reaches the active page, SmartStock also displays a persistent **Push received** card. This card is triggered by a service-worker receipt, not by the send button. Native notifications use `renotify` and `requireInteraction` to request renewed alerts for repeated tests; Windows can still suppress desktop banners.
