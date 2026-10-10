// Control experiment: same offline reload WITHOUT a service worker must fail, proving offline.mjs really tests the SW.
import { startServer, launch, check, done, PHONE } from "./helpers.mjs";

const { server, url } = await startServer();
const browser = await launch();
const context = await browser.newContext({ ...PHONE, serviceWorkers: "block" });
const page = await context.newPage();
await page.goto(url + "/index.html");
await page.waitForSelector("#country");
await context.setOffline(true);
const reloaded = await page.reload().then(() => true, () => false);
const rendered = reloaded && await page.waitForSelector("#country", { timeout: 3000 }).then(() => true, () => false);
check("control: without service worker, offline reload does NOT render the app", !rendered, "rendered=" + rendered);
await browser.close();
server.close();
done();
