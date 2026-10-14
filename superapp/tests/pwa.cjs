"use strict";

const playwrightModule = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = require(playwrightModule);

const baseUrl = process.env.YOLDA_BASE_URL || "http://127.0.0.1:8090";
const chromePath = process.env.PLAYWRIGHT_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 393, height: 844 } });
  const page = await context.newPage();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  await page.goto(`${baseUrl}/?pwa-test=${Date.now()}#/home`, { waitUntil: "load" });
  await page.evaluate(() => navigator.serviceWorker.ready);
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    await page.reload({ waitUntil: "load" });
  }
  if (!await page.evaluate(() => Boolean(navigator.serviceWorker.controller))) {
    throw new Error("service worker did not control the page after activation");
  }

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#page-content").waitFor();
  const danaOffline = await page.evaluate(async () => {
    await document.fonts.ready;
    return document.fonts.check('16px "Dana"');
  });
  if (!danaOffline) throw new Error("Dana webfont was not available from the offline cache");
  await page.evaluate(() => { window.location.hash = "/offline"; });
  await page.waitForFunction(() => document.body.dataset.page === "offline");
  if (!await page.getByRole("heading", { name: "اتصال اینترنت قطع است" }).count()) {
    throw new Error("offline fallback route was not rendered");
  }
  if (runtimeErrors.length) throw new Error(`runtime errors: ${[...new Set(runtimeErrors)].join(" | ")}`);

  await context.setOffline(false);
  await browser.close();
  console.log("PWA audit passed: service worker activation, cached reload, Dana font cache, and offline route.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
