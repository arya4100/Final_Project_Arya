# Persistent MongoDB and publication

For an existing local MongoDB installation, configure a replica set (`mongod --replSet rs0 --dbpath <your-data-directory>`) and initialize it in mongosh with `rs.initiate()`. Do not run initialization against an existing production cluster. Alternatively use an Atlas connection string supplied by your account.

The default local mode already persists data at `.data/mongodb`. For an external database, set `LOCAL_DATABASE=false`, `DEMO_DATABASE=false`, `SEED_DEMO=false`, and a persistent `MONGODB_URI`; configure HTTPS through your hosting platform/reverse proxy. This Express application uses MongoDB TCP and is intended for a Node host, not static-only hosting. Set `APP_ORIGIN` to the real HTTPS origin. Do not expose the localhost server directly to the internet. Add authenticated manager provisioning through a trusted administrative process; public registration deliberately cannot create managers.

Generate strong secrets with `npm run keys` locally and use the host secret manager in production. VAPID public keys may be sent to clients; private keys and JWT secrets stay on the server. Rotate secrets if exposed. Restrict MongoDB credentials and network access; back up persistent data.

GitHub submission (requires your authenticated GitHub account):

```powershell
git init
git add .
git status
git commit -m "Implement SmartStock inventory PWA"
git branch -M main
git remote add origin https://github.com/YOUR-ACCOUNT/smartstock.git
git push -u origin main
```

Review staged files before committing. `.env`, dependencies, temporary database binaries and runtime data are ignored. Set the actual GitHub URL in `docs/submission.json`, add your real Figma link and evidence status, then regenerate reports. No repository has been claimed or published on your behalf.
