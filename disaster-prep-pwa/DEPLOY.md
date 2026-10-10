# Deploy to Netlify (about 5 minutes)

**Why Netlify:** HTTPS out of the box (needed for the service worker), serves the static app *and* the one proxy function
(`netlify/functions/api.mjs`, routes `/api/sachet` and `/api/hazard`) from the same site, gzips files, and deploys from a
single command. GitHub Pages would host the static files but cannot run the proxy (SACHET and ThinkHazard send no CORS headers).

## Option A: command line (recommended)

```bash
cd D:\Code\disaster-prep-pwa
npx netlify-cli login          # opens your browser; sign in as yourself
npx netlify-cli init           # create & link a new site (choose "Create & configure a new project")
npx netlify-cli deploy --build --prod
```

`--build` runs `node tools/make-dist.mjs` (copies only the 13 app files into `dist/`) and also uploads the function.
No environment variables are required (defaults point at the real SACHET / ThinkHazard endpoints).
Optional overrides: `SACHET_FEED_URL`, `THINKHAZARD_BASE`.

## Option B: Git
Push this folder to GitHub, then in Netlify choose **Add new site -> Import from Git**. The build command and publish
directory are already in `netlify.toml`.

## After deploying, verify (one command)

```bash
node tests/e2e/deployed.mjs https://YOUR-SITE.netlify.app
```

It checks HTTPS, service worker, installability, offline-after-first-load, the proxy, headers, secrets and console errors.

## Before every update
Bump `VERSION` in `sw.js` (e.g. `dpa-v3`), otherwise returning users keep the old cached app.
