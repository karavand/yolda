"use strict";

const playwrightModule = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = require(playwrightModule);

const baseUrl = process.env.YOLDA_BASE_URL || "http://127.0.0.1:8084";
const chromePath = process.env.PLAYWRIGHT_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";
const requestedViewports = (process.argv.find((value) => value.startsWith("--viewports=")) || "--viewports=320,393,768,1024,1440")
  .split("=")[1]
  .split(",")
  .map(Number)
  .filter(Number.isFinite);
const auditDarkMode = process.argv.includes("--dark");
const auditAccessibilityMode = process.argv.includes("--accessibility");

const routes = [
  "/home", "/welcome", "/auth/login", "/auth/otp", "/auth/profile",
  "/permissions/location", "/permissions/notifications", "/services", "/offers", "/nearby",
  "/food", "/grocery", "/pharmacy", "/vendor/food", "/vendor/grocery", "/vendor/pharmacy",
  "/stores/food", "/stores/grocery", "/stores/pharmacy",
  "/product/food-1", "/category/food/pizza", "/search", "/favorites", "/cart", "/checkout",
  "/checkout/address", "/checkout/time", "/payment", "/payment/result/success", "/payment/result/failed",
  "/orders", "/tracking", "/order/details", "/order/cancel", "/order/review", "/order/success",
  "/profile", "/profile/edit", "/addresses", "/address/new", "/payments", "/wallet",
  "/wallet/topup", "/transactions", "/rewards", "/invite", "/notifications", "/settings",
  "/settings/appearance", "/settings/accessibility", "/settings/language", "/settings/security", "/settings/notifications", "/about", "/support", "/support/tickets",
  "/support/new-ticket", "/support/ticket/SUP-1042", "/prescription", "/prescription/status", "/delivery",
  "/bills", "/reservation", "/ai", "/ai/quiz", "/ai/quiz/2", "/ai/quiz/3", "/ai/quiz/4", "/ai/quiz/5", "/ai/results", "/ai/history", "/ai/preferences",
  "/vendor-panel", "/vendor-panel/orders", "/vendor-panel/catalog", "/vendor-panel/inventory",
  "/vendor-panel/finance", "/vendor-panel/reviews", "/vendor-panel/settings", "/courier", "/courier/orders",
  "/courier/active", "/courier/earnings", "/courier/history", "/courier/profile", "/ops", "/ops/orders",
  "/ops/couriers", "/ops/vendors", "/ops/customers", "/ops/finance", "/ops/support", "/ops/reports",
  "/ops/content", "/ops/settings", "/ops/audit", "/superadmin", "/superadmin/content", "/icons", "/offline"
];

async function main() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const failures = [];

  for (const width of requestedViewports) {
    const context = await browser.newContext({
      viewport: { width, height: width < 600 ? 844 : width < 900 ? 1024 : 900 },
      serviceWorkers: "block",
      reducedMotion: "reduce"
    });
    const page = await context.newPage();
    const runtimeErrors = [];
    page.on("pageerror", (error) => runtimeErrors.push(error.message));
    page.on("console", (message) => {
      if (message.type() === "error") runtimeErrors.push(message.text());
    });

    await page.goto(`${baseUrl}/#/home`, { waitUntil: "domcontentloaded" });
    await page.locator("#page-content").waitFor();
    await page.waitForTimeout(250);

    if (auditDarkMode) {
      await page.evaluate(() => { window.location.hash = "/settings/appearance"; });
      await page.waitForFunction(() => document.body.dataset.page === "settings-appearance");
      const themeToggle = page.locator('[data-theme-option="dark"]');
      if (await themeToggle.getAttribute("aria-pressed") !== "true") await themeToggle.click();
      await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    }

    if (auditAccessibilityMode) {
      await page.evaluate(() => { window.location.hash = "/settings/accessibility"; });
      await page.waitForFunction(() => document.body.dataset.page === "settings-accessibility");
      for (const key of ["largeText", "highContrast", "reduceMotion"]) {
        const toggle = page.locator(`[data-setting-toggle="accessibility.${key}"]`);
        if (await toggle.getAttribute("aria-pressed") !== "true") await toggle.click();
      }
      await page.waitForFunction(() => document.documentElement.dataset.textSize === "large" && document.documentElement.dataset.contrast === "high" && document.documentElement.dataset.motion === "reduced");
    }

    for (const route of routes) {
      await page.evaluate((nextRoute) => { window.location.hash = nextRoute; }, route);
      const pageMarker = route.replace(/^\//, "").replaceAll("/", "-") || "home";
      await page.waitForFunction((marker) => document.body.dataset.page === marker, pageMarker);
      await page.locator("#page-content").waitFor();
      await page.waitForFunction(() => document.getElementById("page-loader")?.hidden === true);

      const result = await page.evaluate(() => {
        const visible = (element) => {
          const style = getComputedStyle(element);
          const rect = element.getBoundingClientRect();
          return style.display !== "none" && style.visibility !== "hidden" && Number(style.opacity) > 0 && rect.width > 0 && rect.height > 0;
        };
        const loader = document.getElementById("page-loader");
        const loaderVisible = loader ? visible(loader) && !loader.hidden : false;
        const brokenImages = [...document.images]
          .filter((image) => image.complete && image.naturalWidth === 0)
          .map((image) => image.getAttribute("src"));
        const activeTabsOffscreen = [...document.querySelectorAll(".panel-tabs .is-active, .cart-tabs .is-active")]
          .filter(visible)
          .filter((tab) => {
            const scroller = tab.closest(".panel-tabs, .cart-tabs");
            if (!scroller || scroller.scrollWidth <= scroller.clientWidth + 1) return false;
            const tabRect = tab.getBoundingClientRect();
            const scrollerRect = scroller.getBoundingClientRect();
            return tabRect.left < scrollerRect.left - 2 || tabRect.right > scrollerRect.right + 2;
          })
          .map((tab) => tab.textContent.trim());
        const interactiveOutsideViewport = [...document.querySelectorAll("button, a, input, select, textarea")]
          .filter(visible)
          .filter((element) => !element.closest(".panel-tabs, .cart-tabs, .chip-row, .category-scroll, .horizontal-scroll, .horizontal-carousel, .two-row-scroller, .product-scroller, .table-wrap, .icon-grid"))
          .filter((element) => {
            const rect = element.getBoundingClientRect();
            return rect.left < -2 || rect.right > window.innerWidth + 2;
          })
          .slice(0, 5)
          .map((element) => `${element.tagName.toLowerCase()}:${element.textContent.trim().slice(0, 30)}`);

        return {
          horizontalOverflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          loaderVisible,
          brokenImages,
          activeTabsOffscreen,
          interactiveOutsideViewport,
          bodyRouteAction: document.body.hasAttribute("data-route"),
          notFound: document.body.textContent.includes("این صفحه پیدا نشد")
        };
      });

      const issues = [];
      if (result.horizontalOverflow > 1) issues.push(`document overflow ${result.horizontalOverflow}px`);
      if (result.loaderVisible) issues.push("blocking loader remained visible");
      if (result.brokenImages.length) issues.push(`broken images: ${result.brokenImages.join(", ")}`);
      if (result.activeTabsOffscreen.length) issues.push(`active tabs offscreen: ${result.activeTabsOffscreen.join(", ")}`);
      if (result.interactiveOutsideViewport.length) issues.push(`controls outside viewport: ${result.interactiveOutsideViewport.join(", ")}`);
      if (result.bodyRouteAction) issues.push("body exposes data-route and intercepts clicks");
      if (result.notFound) issues.push("route rendered not-found content");
      if (issues.length) failures.push(`${width}px ${route}: ${issues.join("; ")}`);
    }

    if (runtimeErrors.length) failures.push(`${width}px runtime errors: ${[...new Set(runtimeErrors)].join(" | ")}`);
    await context.close();
  }

  await browser.close();
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`UI audit passed: ${routes.length} routes in ${auditDarkMode ? "dark" : "light"} mode${auditAccessibilityMode ? " with accessibility preferences" : ""} across ${requestedViewports.length} viewport(s) (${requestedViewports.join(", ")}px).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
