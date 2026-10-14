"use strict";

const fs = require("node:fs");
const path = require("node:path");
const playwrightModule = process.env.PLAYWRIGHT_MODULE || "playwright";
const { chromium } = require(playwrightModule);

const root = path.resolve(__dirname, "..");
const baseUrl = process.env.YOLDA_BASE_URL || "http://127.0.0.1:8084";
const chromePath = process.env.PLAYWRIGHT_CHROME || "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

async function main() {
  const browser = await chromium.launch({ executablePath: chromePath, headless: true });
  const context = await browser.newContext({
    viewport: { width: 393, height: 844 },
    serviceWorkers: "block",
    reducedMotion: "reduce"
  });
  const page = await context.newPage();
  page.setDefaultTimeout(5000);
  const failures = [];
  const testedForms = new Set();
  const runtimeErrors = [];
  page.on("pageerror", (error) => runtimeErrors.push(error.message));
  page.on("console", (message) => {
    if (message.type() === "error") runtimeErrors.push(message.text());
  });

  async function run(name, task) {
    try {
      await task();
    } catch (error) {
      failures.push(`${name}: ${error.message}`);
    }
  }

  async function go(route) {
    await page.evaluate((nextRoute) => { window.location.hash = nextRoute; }, route);
    await page.waitForFunction((nextRoute) => window.location.hash === `#${nextRoute}`, route);
    const pageMarker = route.replace(/^\//, "").replaceAll("/", "-") || "home";
    await page.waitForFunction((marker) => document.body.dataset.page === marker, pageMarker);
    await page.locator("#page-content").waitFor();
    await page.waitForFunction(() => document.getElementById("page-loader")?.hidden === true);
  }

  async function expectRoute(route) {
    await page.waitForFunction((nextRoute) => window.location.hash === `#${nextRoute}`, route, { timeout: 4000 });
    const pageMarker = route.replace(/^\//, "").replaceAll("/", "-") || "home";
    await page.waitForFunction((marker) => document.body.dataset.page === marker, pageMarker, { timeout: 4000 });
    await page.locator("#page-content").waitFor();
    await page.waitForFunction(() => document.getElementById("page-loader")?.hidden === true);
  }

  async function submit(type) {
    testedForms.add(type);
    const form = page.locator(`[data-form="${type}"]`);
    await form.waitFor();
    await form.locator("button[type='submit']").click();
  }

  async function chooseAiStep(step, name, value, nextRoute) {
    const wizard = page.locator(`[data-ai-quiz-step="${step}"]`);
    await wizard.waitFor();
    const choices = wizard.locator(".choice-card-icon input[aria-label]");
    const expectedCount = step === 1 ? 3 : 4;
    if (await choices.count() !== expectedCount) throw new Error(`AI step ${step} has incomplete icon choices`);
    await wizard.locator(`input[name="${name}"][value="${value}"]`).click();
    await expectRoute(nextRoute);
  }

  async function expectToast(text) {
    await page.locator("#toast.is-visible").filter({ hasText: text }).waitFor({ timeout: 2500 });
  }

  await page.goto(`${baseUrl}/#/home`, { waitUntil: "domcontentloaded" });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
  });
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator("#page-content").waitFor();
  await page.waitForTimeout(600);

  await run("Dana font", async () => {
    const fontState = await page.evaluate(async () => {
      await document.fonts.ready;
      return {
        family: getComputedStyle(document.body).fontFamily,
        loaded: document.fonts.check('16px "Dana"')
      };
    });
    if (!fontState.family.includes("Dana")) throw new Error(`body font is ${fontState.family}`);
    if (!fontState.loaded) throw new Error("Dana webfont did not load");
  });

  await run("appearance and accessibility settings", async () => {
    await go("/settings");
    if (await page.locator(".settings-menu-card").count() !== 6) throw new Error("settings dashboard is incomplete");

    await go("/settings/appearance");
    await page.locator('[data-theme-option="dark"]').first().click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#page-content").waitFor();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark" && document.documentElement.dataset.themePreference === "dark");
    if (await page.locator('#theme-color-meta').getAttribute("content") !== "#140e1a") throw new Error("dark browser theme color is incorrect");
    await page.locator('[data-theme-option="light"]').first().click();
    await page.waitForFunction(() => document.documentElement.dataset.theme === "light");
    await page.locator('[data-theme-option="system"]').first().click();
    await page.waitForFunction(() => document.documentElement.dataset.themePreference === "system");
    await page.emulateMedia({ colorScheme: "dark", reducedMotion: "reduce" });
    await page.waitForFunction(() => document.documentElement.dataset.theme === "dark");
    await page.emulateMedia({ colorScheme: "light", reducedMotion: "reduce" });
    await page.waitForFunction(() => document.documentElement.dataset.theme === "light");

    await go("/settings/accessibility");
    for (const [key, dataset, enabled] of [
      ["largeText", "textSize", "large"],
      ["highContrast", "contrast", "high"],
      ["reduceMotion", "motion", "reduced"]
    ]) {
      const toggle = page.locator(`[data-setting-toggle="accessibility.${key}"]`);
      await toggle.click();
      await page.waitForFunction(({ name, value }) => document.documentElement.dataset[name] === value, { name: dataset, value: enabled });
      await toggle.click();
    }
  });

  await run("login → OTP → profile setup", async () => {
    await go("/auth/login");
    await page.locator("#phone").fill("09123456789");
    await submit("login");
    await expectRoute("/auth/otp");
    const otp = page.locator(".otp-grid input");
    for (let index = 0; index < 4; index += 1) await otp.nth(index).fill(String(index + 1));
    await submit("otp");
    await expectRoute("/auth/profile");
    await page.locator("#display-name").fill("کاربر آزمون");
    await page.locator("#email").fill("qa@yolda.test");
    await submit("profile-setup");
    await expectRoute("/permissions/location");
    await page.locator('[data-permission="location"]').click();
    await expectRoute("/permissions/notifications");
    await page.locator('[data-permission="notifications"]').click();
    await expectRoute("/home");
  });

  await run("checkout forms and payment", async () => {
    await go("/product/food-1");
    await page.locator('[data-add="food-1"]').click();
    await go("/checkout");
    await submit("checkout-address");
    await expectRoute("/checkout/time");
    await submit("checkout-time");
    await expectRoute("/payment");

    await page.locator('[data-modal="discount"]').click();
    await page.locator("#discount-code").fill("YOLDA20");
    await submit("discount");
    await expectToast("کد تخفیف آزمایشی اعمال شد");
    await page.locator('[data-pay]').click();
    await expectRoute("/payment/result/success");
  });

  await run("offers layout and filters", async () => {
    await go("/offers");
    const heroLayout = await page.locator(".offers-hero").evaluate((hero) => {
      const art = hero.querySelector(".offers-hero-art");
      return { heroWidth: hero.getBoundingClientRect().width, artWidth: art?.getBoundingClientRect().width || 0 };
    });
    if (!heroLayout.artWidth || heroLayout.artWidth > heroLayout.heroWidth * 0.45) throw new Error(`offer artwork is not constrained: ${JSON.stringify(heroLayout)}`);
    if (await page.locator('[data-filter-item="offers"]').count() !== 10) throw new Error("offer cards are incomplete");
    await page.locator('[data-filter-value="free-delivery"]').click();
    const visibleOffers = await page.locator('[data-filter-item="offers"]:not(.hidden)').count();
    if (visibleOffers < 1 || visibleOffers >= 10) throw new Error(`offer filtering did not change the results: ${visibleOffers}`);
    if (!(await page.locator('[data-filter-count="offers"]').innerText()).includes(String(visibleOffers).replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]))) throw new Error("offer result counter did not update");
    await page.locator('[data-scroll-to="offers-grid"]').click();
    await page.waitForFunction(() => window.scrollY > 0);
  });

  await run("home carousel and service directory", async () => {
    await go("/home");
    await page.waitForTimeout(3200);
    if (await page.evaluate(() => window.scrollY) !== 0) throw new Error("home carousel moved the entire page vertically");
    if (await page.locator("[data-auto-carousel]").getAttribute("data-active-slide") !== "1") throw new Error("nearby carousel did not advance after three seconds");
    await go("/grocery");
    await page.locator('[data-route="/stores/grocery"]').click();
    await expectRoute("/stores/grocery");
    if (await page.locator(".store-directory-grid .vendor-card").count() < 1) throw new Error("grocery all-stores directory is empty");
  });

  await run("header back alignment", async () => {
    await go("/grocery");
    const alignment = await page.evaluate(() => {
      const header = document.querySelector(".mobile-header").getBoundingClientRect();
      const back = document.querySelector(".header-back").getBoundingClientRect();
      const icon = document.querySelector(".header-back img").getBoundingClientRect();
      const brand = document.querySelector(".brand-lockup").getBoundingClientRect();
      return {
        titleCenterDelta: Math.abs((brand.left + brand.width / 2) - (header.left + header.width / 2)),
        backVerticalDelta: Math.abs((back.top + back.height / 2) - (header.top + header.height / 2)),
        iconCenterDelta: Math.max(Math.abs((icon.left + icon.width / 2) - (back.left + back.width / 2)), Math.abs((icon.top + icon.height / 2) - (back.top + back.height / 2))),
        leadingGap: Math.abs(header.right - back.right - 16),
        iconTransform: getComputedStyle(document.querySelector(".header-back img")).transform
      };
    });
    if (alignment.titleCenterDelta > 2) throw new Error(`internal page title is not centered: ${JSON.stringify(alignment)}`);
    if (alignment.backVerticalDelta > 2 || alignment.iconCenterDelta > 2) throw new Error(`back control is not centered: ${JSON.stringify(alignment)}`);
    if (alignment.leadingGap > 2) throw new Error(`back control is not on the RTL leading edge: ${JSON.stringify(alignment)}`);
    if (!alignment.iconTransform.includes("-1")) throw new Error(`RTL back arrow direction is incorrect: ${alignment.iconTransform}`);
  });

  await run("AI forms", async () => {
    await go("/ai");
    if (await page.locator(".ai-context-banner").count() !== 1) throw new Error("AI context banner is missing");
    if (await page.locator(".ai-flow-steps").count() !== 0) throw new Error("obsolete AI step strip is still visible");
    if (await page.locator('.ai-service-picker input[name="service"]').count() !== 3) throw new Error("AI service selector is incomplete");
    await page.locator("#ai-query").fill("غذای سالم و سریع تا ۳۰۰ هزار تومان");
    await submit("ai");
    await expectRoute("/ai/quiz");
    if (!(await page.locator(".ai-draft-summary").innerText()).includes("غذای سالم")) throw new Error("AI draft was not carried into step 2");
    await chooseAiStep(1, "service", "food", "/ai/quiz/2");
    await chooseAiStep(2, "mood", "comfort", "/ai/quiz/3");
    await chooseAiStep(3, "goal", "healthy", "/ai/quiz/4");
    await chooseAiStep(4, "cuisine", "iranian", "/ai/quiz/5");
    await submit("ai-quiz");
    await expectRoute("/ai/results");
    if (await page.locator(".ai-result-card").count() < 1) throw new Error("AI returned no recommendation cards");
    if (await page.locator(".ai-result-card.is-top-pick").count() !== 1) throw new Error("AI top recommendation is not highlighted");
    if (await page.locator(".ai-constraint-panel").count() !== 1) throw new Error("AI active constraints are not visible");
    await page.locator('[data-ai-refine="faster"]').click();
    await page.locator(".ai-result-query").filter({ hasText: "سریع‌تر" }).waitFor();

    await go("/ai");
    await page.locator('.ai-service-picker input[value="grocery"]').check();
    await page.locator("#ai-query").fill("خرید روزانه اقتصادی و سریع");
    await submit("ai");
    await expectRoute("/ai/quiz");
    if (!await page.locator('input[name="service"][value="grocery"]').isChecked()) throw new Error("AI service was not carried into step 2");
    await chooseAiStep(1, "service", "grocery", "/ai/quiz/2");
    await chooseAiStep(2, "mood", "comfort", "/ai/quiz/3");
    await chooseAiStep(3, "goal", "fast", "/ai/quiz/4");
    await chooseAiStep(4, "cuisine", "iranian", "/ai/quiz/5");
    await submit("ai-quiz");
    await expectRoute("/ai/results");
    if (!(await page.locator(".ai-constraint-list").innerText()).includes("سوپرمارکت")) throw new Error("AI service selection was not carried into results");
    if (await page.locator(".ai-result-card").count() < 1) throw new Error("AI grocery flow returned no results");

    await go("/ai/quiz");
    await chooseAiStep(1, "service", "food", "/ai/quiz/2");
    await chooseAiStep(2, "mood", "social", "/ai/quiz/3");
    await chooseAiStep(3, "goal", "popular", "/ai/quiz/4");
    await chooseAiStep(4, "cuisine", "azerbaijani", "/ai/quiz/5");
    await page.locator("#ai-meal-time").selectOption("dinner");
    await page.locator("#ai-exclusions").fill("قارچ، لبنیات");
    await submit("ai-quiz");
    await expectRoute("/ai/results");
    const constraints = await page.locator(".ai-constraint-list").innerText();
    if (!constraints.includes("شام") || !constraints.includes("بدون قارچ") || !constraints.includes("بدون لبنیات")) {
      throw new Error(`quiz constraints were not carried into results: ${constraints}`);
    }

    await go("/ai/preferences");
    await page.locator("#allergy").fill("قارچ");
    await submit("ai-preferences");
    await expectRoute("/ai");
  });

  await run("order and profile forms", async () => {
    await go("/order/cancel");
    await page.locator("#cancel-page-reason").selectOption({ index: 1 });
    await submit("cancel-order-page");
    await expectRoute("/orders");

    await go("/order/review");
    await page.locator("#review-text").fill("عالی بود");
    await submit("review");
    await expectRoute("/order/details");

    await go("/profile/edit");
    await page.locator("#edit-name").fill("کاربر به‌روزشده");
    await submit("profile-edit");
    await expectRoute("/profile");
    if (await page.locator(".profile-action-card").count() !== 9) throw new Error("profile action grid is incomplete");
    if (await page.locator(".profile-edit-button").count() !== 1) throw new Error("profile edit action is missing");
  });

  await run("address and payment-card modals", async () => {
    await go("/address/new");
    await page.locator("#new-title").fill("دفتر تست");
    await page.locator("#new-address").fill("ارومیه، خیابان آزمون، پلاک ۱۲");
    await page.locator("#new-plaque").fill("۱۲");
    await submit("address-page");
    await expectRoute("/addresses");

    const addressTrigger = page.locator("[data-edit-address]").first();
    await addressTrigger.click();
    await page.locator("#address-title").fill("خانه ویرایش‌شده");
    await submit("address");
    await page.locator("[role='dialog']").waitFor({ state: "detached" });

    await go("/payments");
    const cardCount = await page.locator(".payment-row").count();
    await page.locator('[data-modal="new-card"]').click();
    await page.locator("#card-bank").fill("بانک آزمون");
    await page.locator("#card-number").fill("6037997512349876");
    await page.locator("#card-expiry").fill("0608");
    await submit("payment-card");
    await page.locator("[role='dialog']").waitFor({ state: "detached" });
    if (await page.locator(".payment-row").count() !== cardCount + 1) throw new Error("new card was not rendered");
  });

  await run("wallet and language forms", async () => {
    await go("/wallet/topup");
    await page.locator("#topup-amount").fill("200000");
    await submit("wallet-topup");
    await expectRoute("/wallet");
    await go("/settings/language");
    await page.locator('input[name="language"][value="en"]').check();
    await submit("settings-language");
    if (await page.locator("html").getAttribute("lang") !== "en") throw new Error("English language mode did not activate");
    await page.locator('input[name="language"][value="fa"]').check();
    await submit("settings-language");
    await expectToast("زبان برنامه ذخیره شد");
  });

  await run("support forms", async () => {
    await go("/support/new-ticket");
    await page.locator("#ticket-topic").selectOption({ index: 1 });
    await page.locator("#ticket-message").fill("این یک درخواست آزمایشی رابط کاربری است.");
    await submit("support-ticket");
    await expectRoute("/support/tickets");
    await go("/support/ticket/SUP-1042");
    await page.locator('[name="reply"]').fill("پیام تست");
    await submit("ticket-reply");
    await expectToast("پاسخ ارسال شد");
  });

  await run("city service forms", async () => {
    await go("/delivery");
    if (!(await page.locator(".coming-soon-page").innerText()).includes("به‌زودی")) throw new Error("package delivery is not marked as coming soon");
    await go("/bills");
    if (!(await page.locator(".coming-soon-page").innerText()).includes("به‌زودی")) throw new Error("bill payment is not marked as coming soon");
    await go("/reservation");
    await submit("reservation");
    await expectToast("رزرو میز");
  });

  await run("panel modal forms", async () => {
    await go("/vendor-panel/orders");
    await page.locator('[data-modal="vendor-order"]').first().click();
    await submit("vendor-order");
    await go("/vendor-panel/catalog");
    await page.locator('[data-modal="vendor-product"]').first().click();
    await page.locator("#product-name").fill("محصول تست");
    await page.locator("#product-price").fill("250000");
    await page.locator("#product-description").fill("توضیح تست محصول");
    await submit("vendor-product");
    await go("/ops/orders");
    await page.locator('[data-modal="ops-new-order"]').click();
    await page.locator("#ops-customer").fill("09123456789");
    await page.locator("#ops-vendor").fill("رومانو");
    await page.locator("#ops-amount").fill("450000");
    await submit("ops-new-order");
    await go("/ops/support");
    await page.locator('[data-modal="ops-chat"]').first().click();
    await page.locator('[data-form="ops-chat"] [name="reply"]').fill("پاسخ تست اپراتور");
    await submit("ops-chat");
  });

  await run("superadmin content studio", async () => {
    await go("/superadmin/content");
    if (await page.locator("[data-cms-select]").count() < 8) throw new Error("page picker is incomplete");
    if (await page.locator('[data-cms-sort-list="home"] [data-cms-drag]').count() !== 8) throw new Error("home blocks are incomplete");

    await page.locator('[data-cms-drag="intro"] [data-modal="cms-block"]').click();
    await page.locator('[data-form="cms-block"] [name="field:title"]').fill("خانه هوشمند یولدا");
    await submit("cms-block");
    await expectToast("محتوا ذخیره");

    await page.locator('[data-cms-drag="confidence"] [data-cms-toggle="confidence"]').click();
    await expectToast("مخفی شد");
    await page.locator('[data-cms-drag="services"] [data-cms-move="down"]').click();
    await expectToast("ترتیب صفحه");
    await page.locator('[data-cms-preview="/home"]').first().click();
    await expectRoute("/home");
    if (await page.locator('[data-cms-block="intro"] [data-cms-field="title"]').innerText() !== "خانه هوشمند یولدا") throw new Error("edited content was not published");
    if (!(await page.locator('[data-cms-block="confidence"]').evaluate((element) => element.hidden))) throw new Error("hidden block is still visible");
    const publishedOrder = await page.locator('[data-cms-page="home"]').evaluate((root) => [...root.children].filter((element) => element.dataset.cmsBlock).map((element) => element.dataset.cmsBlock));
    if (publishedOrder.indexOf("services") <= publishedOrder.indexOf("smart-ai")) throw new Error("block order was not published");

    await page.reload({ waitUntil: "domcontentloaded" });
    await page.locator("#page-content").waitFor();
    if (await page.locator('[data-cms-block="intro"] [data-cms-field="title"]').innerText() !== "خانه هوشمند یولدا") throw new Error("CMS content did not persist");

    await go("/superadmin/content");
    await page.locator('[data-modal="cms-reset"][data-id="home"]').click();
    await page.locator('[data-confirm-cms-reset="home"]').click();
    await expectToast("بازنشانی شد");
  });

  await run("detail dialogs and operator search", async () => {
    await go("/notifications");
    await page.locator('[data-modal="notification"]').first().click();
    if (!(await page.locator('[role="dialog"]').innerText()).includes("رهگیری زنده")) throw new Error("notification detail dialog is incomplete");
    await page.locator("[data-close-modal]").first().click();
    await go("/support");
    await page.locator('[data-modal="faq"]').first().click();
    if (!(await page.locator('[role="dialog"]').innerText()).includes("پنج دقیقه")) throw new Error("FAQ detail dialog is incomplete");
    await page.locator("[data-close-modal]").first().click();
    await go("/settings/security");
    await page.locator('[data-modal="active-devices"]').click();
    if (!(await page.locator('[role="dialog"]').innerText()).includes("این دستگاه")) throw new Error("active devices dialog did not identify the current device");
    await page.locator("[data-close-modal]").first().click();
    await go("/courier/history");
    await page.locator('[data-modal="courier-history"]').first().click();
    if (!(await page.locator('[role="dialog"]').innerText()).includes("درآمد پیک")) throw new Error("courier history detail dialog is incomplete");
    await page.locator("[data-close-modal]").first().click();
    await go("/ops/orders");
    await page.locator("#ops-order-search").fill("داروخانه");
    if (await page.locator('[data-search-row]:not([hidden])').count() !== 1) throw new Error("operator order search did not filter rows");
    await page.locator('[data-search-row]:not([hidden]) [data-modal="ops-order"]').click();
    if (!(await page.locator('[role="dialog"]').innerText()).includes("جزئیات سفارش")) throw new Error("operator order detail dialog did not open");
    await page.locator("[data-close-modal]").first().click();
  });

  for (const [type, route] of [
    ["vendor-settings", "/vendor-panel/settings"],
    ["courier-profile", "/courier/profile"],
    ["ops-settings", "/ops/settings"]
  ]) {
    await run(`${type} form`, async () => {
      await go(route);
      await submit(type);
      await expectToast("تغییرات ذخیره شد");
    });
  }

  const source = ["assets/js/pages.js", "assets/js/app.js"]
    .map((file) => fs.readFileSync(path.join(root, file), "utf8"))
    .join("\n");
  const declaredForms = new Set([...source.matchAll(/data-form=["']([^"']+)/g)].map((match) => match[1]));
  const untested = [...declaredForms].filter((type) => !testedForms.has(type));
  if (untested.length) failures.push(`forms missing interaction coverage: ${untested.join(", ")}`);
  if (runtimeErrors.length) failures.push(`runtime errors: ${[...new Set(runtimeErrors)].join(" | ")}`);

  await browser.close();
  if (failures.length) {
    console.error(failures.join("\n"));
    process.exit(1);
  }
  console.log(`Interaction flows passed: theme persistence/system sync, accessibility, Dana, profile UI, ${testedForms.size} form types, permissions, payment, dialogs, and the complete AI journey.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
