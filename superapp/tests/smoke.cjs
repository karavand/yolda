"use strict";

const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");

const root = path.resolve(__dirname, "..");
global.window = global;

["data.js", "recommender.js", "pages.js"].forEach((file) => {
  const source = fs.readFileSync(path.join(root, "assets", "js", file), "utf8");
  vm.runInThisContext(source, { filename: file });
});

const state = {
  carts: { food: [{ id: "food-1", qty: 1 }], grocery: [], pharmacy: [] },
  activeCartService: "food",
  favorites: ["food-4"],
  theme: "system",
  aiHistory: [],
  aiFeedback: {},
  aiPreferences: {},
  aiQuizSelections: {},
  aiResult: null,
  cms: { pages: {}, audit: [] },
  cmsActivePage: "home",
  user: { displayName: "کاربر تست", phone: "۰۹۱۲۳۴۵۶۷۸۹", email: "test@example.com", birthday: "", city: "ارومیه" },
  addresses: [
    { id: "home", title: "خانه", value: "ارومیه، خیابان دانشگاه", kind: "home" },
    { id: "work", title: "محل کار", value: "ارومیه، میدان ایالت", kind: "work" }
  ],
  selectedAddressId: "home",
  paymentMethods: [
    { id: "mellat-4567", bank: "بانک ملت", last4: "4567", expiry: "۰۶/۰۵", isDefault: true }
  ],
  walletBalance: 1250000,
  transactions: [
    { id: "tx-1", title: "افزایش موجودی", subtitle: "امروز", amount: 1000000, kind: "deposit" },
    { id: "tx-2", title: "سفارش", subtitle: "امروز", amount: -250000, kind: "payment" }
  ],
  settings: {
    cashOnDelivery: true,
    language: "fa",
    notifications: { orders: true, offers: true, wallet: false, support: true },
    security: { biometric: true, twoFactor: false },
    accessibility: { reduceMotion: false, highContrast: false, largeText: false }
  },
  notificationsRead: false
};

Object.defineProperty(state, "cart", {
  get() { return state.carts[state.activeCartService]; },
  set(value) { state.carts[state.activeCartService] = value; }
});

const format = new Intl.NumberFormat("fa-IR");
const pages = global.createYoldaPages({
  data: global.YOLDA_DATA,
  state,
  icon: (name) => `assets/icons/${name}`,
  number: (value) => format.format(value),
  money: (value) => `${format.format(value)} تومان`,
  isFavorite: (id) => state.favorites.includes(id),
  cartTotal: () => 420000,
  cartCount: () => 1,
  recommender: global.YOLDA_RECOMMENDER
});

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

const failures = [];
const actionAttribute = /\bdata-(?:route|back|add|fav|qty|clear-cart|cart-service|pay|permission|theme-option|theme-toggle|toggle|setting-toggle|settings-save|modal|edit-address|delete-address|default-address|delete-card|default-card|logout|mark-read|resend-otp|close-modal|close-modal-backdrop|confirm-cancel|confirm-cms-reset|icon-category|copy-icon|copy-value|share|amount|refresh|bill-type|search-service|ai-step-choice|ai-prompt|ai-feedback|ai-refine|scroll-to|cms-select|cms-preview|cms-toggle|cms-move|cms-handle|toast)\b/i;
for (const route of routes) {
  try {
    const result = pages.resolve(route);
    if (!result?.content?.includes("id=\"page-content\"")) throw new Error("محتوای اصلی صفحه وجود ندارد");
    if ((result.content.match(/id=\"page-content\"/g) || []).length !== 1) throw new Error("شناسه محتوای اصلی تکراری است");
    if (!/<h1\b/i.test(result.content)) throw new Error("عنوان اصلی H1 وجود ندارد");
    if (/\b(?:undefined|NaN)\b/.test(result.content)) throw new Error("مقدار نامعتبر در HTML");
    if (/\son[a-z]+\s*=/i.test(result.content)) throw new Error("رویداد درون‌خطی ناامن در HTML پیدا شد");
    const ids = [...result.content.matchAll(/\sid=["']([^"']+)["']/gi)].map((match) => match[1]);
    const duplicateIds = ids.filter((id, index) => ids.indexOf(id) !== index);
    if (duplicateIds.length) throw new Error(`شناسه تکراری پیدا شد: ${[...new Set(duplicateIds)].join(", ")}`);
    for (const labelMatch of result.content.matchAll(/<label\b([^>]*)>([\s\S]*?)<\/label>/gi)) {
      const attributes = labelMatch[1];
      const body = labelMatch[2];
      const forMatch = attributes.match(/\bfor=["']([^"']+)["']/i);
      if (forMatch && !ids.includes(forMatch[1])) throw new Error(`label به شناسه ناموجود اشاره می‌کند: ${forMatch[1]}`);
      if (!forMatch && !/<(?:input|select|textarea)\b/i.test(body)) throw new Error("label بدون for یا کنترل داخلی پیدا شد");
    }
    const labelRanges = [...result.content.matchAll(/<label\b[^>]*>[\s\S]*?<\/label>/gi)].map((match) => ({
      start: match.index,
      end: match.index + match[0].length
    }));
    for (const controlMatch of result.content.matchAll(/<(input|select|textarea)\b([^>]*)>/gi)) {
      const attributes = controlMatch[2];
      if (/\btype=["']hidden["']/i.test(attributes)) continue;
      const idMatch = attributes.match(/\bid=["']([^"']+)["']/i);
      const hasExternalLabel = idMatch && new RegExp(`<label\\b[^>]*\\bfor=["']${idMatch[1]}["']`, "i").test(result.content);
      const hasInlineLabel = labelRanges.some((range) => controlMatch.index > range.start && controlMatch.index < range.end);
      const hasAriaName = /\baria-(?:label|labelledby)=["'][^"']+["']/i.test(attributes);
      if (!hasExternalLabel && !hasInlineLabel && !hasAriaName) {
        throw new Error(`کنترل فرم بدون نام دسترس‌پذیر پیدا شد: <${controlMatch[1]}${attributes}>`);
      }
    }
    for (const imageMatch of result.content.matchAll(/<img\b([^>]*)>/gi)) {
      if (!/\balt=["'][^"']*["']/i.test(imageMatch[1])) throw new Error(`تصویر بدون alt پیدا شد: <img${imageMatch[1]}>`);
    }
    for (const formMatch of result.content.matchAll(/<form\b[^>]*>([\s\S]*?)<\/form>/gi)) {
      for (const buttonMatch of formMatch[1].matchAll(/<button\b([^>]*)>/gi)) {
        if (!/\btype=["'](?:button|submit|reset)["']/i.test(buttonMatch[1])) {
          throw new Error(`دکمه داخل فرم type ندارد: <button${buttonMatch[1]}>`);
        }
      }
    }
    for (const match of result.content.matchAll(/assets\/icons\/([^"']+)/g)) {
      const iconPath = path.join(root, "assets", "icons", match[1]);
      if (!fs.existsSync(iconPath)) throw new Error(`آیکون پیدا نشد: ${match[1]}`);
    }
    for (const match of result.content.matchAll(/<button\b([^>]*)>/gi)) {
      const attributes = match[1];
      const isSubmit = /\btype=["']submit["']/i.test(attributes);
      const isDisabled = /\bdisabled\b/i.test(attributes);
      const isHandledChip = /\bclass=["'][^"']*\bchip\b[^"']*["']/i.test(attributes);
      if (!isSubmit && !isDisabled && !isHandledChip && !actionAttribute.test(attributes)) {
        throw new Error(`دکمه بدون اکشن پیدا شد: <button${attributes}>`);
      }
    }
    for (const match of result.content.matchAll(/\bdata-route=["']([^"']+)["']/gi)) {
      const linkedPage = pages.resolve(match[1]);
      if (linkedPage.title === "صفحه پیدا نشد") throw new Error(`مسیر داخلی نامعتبر است: ${match[1]}`);
    }
    let buttonDepth = 0;
    for (const match of result.content.matchAll(/<button\b|<\/button>/gi)) {
      if (match[0].toLowerCase().startsWith("</")) buttonDepth -= 1;
      else buttonDepth += 1;
      if (buttonDepth > 1) throw new Error("دکمه تودرتو پیدا شد");
      if (buttonDepth < 0) throw new Error("بسته‌شدن نامعتبر دکمه");
    }
    if (buttonDepth !== 0) throw new Error("تگ دکمه بسته نشده است");
  } catch (error) {
    failures.push(`${route}: ${error.message}`);
  }
}

const accountContracts = [
  ["/profile", "data-logout"],
  ["/profile", "profile-action-grid"],
  ["/profile", "profile-edit-button"],
  ["/addresses", "data-edit-address"],
  ["/addresses", "data-delete-address"],
  ["/payments", "data-modal=\"new-card\""],
  ["/payments", "data-delete-card"],
  ["/settings/security", "data-setting-toggle"],
  ["/settings/notifications", "data-setting-toggle"],
  ["/settings/appearance", "data-theme-option"],
  ["/settings/accessibility", "accessibility.largeText"],
  ["/about", "about-hero"],
  ["/orders", "data-filter-group=\"orders\""],
  ["/transactions", "data-filter-group=\"transactions\""]
];
for (const [route, marker] of accountContracts) {
  if (!pages.resolve(route).content.includes(marker)) failures.push(`${route}: قرارداد تعاملی ${marker} وجود ندارد`);
}

for (const cmsPage of global.YOLDA_DATA.cmsPages) {
  const html = pages.resolve(cmsPage.route).content;
  if (!html.includes(`data-cms-page="${cmsPage.id}"`)) failures.push(`${cmsPage.route}: شناسه صفحه CMS وجود ندارد`);
  for (const block of cmsPage.blocks) {
    if (!html.includes(`data-cms-block="${block.id}"`)) failures.push(`${cmsPage.route}: بلوک CMS ${block.id} در خروجی وجود ندارد`);
    for (const field of block.fields) {
      if (!html.includes(`data-cms-field="${field.key}"`)) failures.push(`${cmsPage.route}: فیلد CMS ${block.id}.${field.key} در خروجی وجود ندارد`);
    }
  }
}

const homeContracts = ["home-intro", "home-top-grid", "home-resume-card", "home-service-grid", "home-confidence", "home-promo-grid", "home-vendor-grid", "home-product-list"];
const homeContent = pages.resolve("/home").content;
for (const marker of homeContracts) {
  if (!homeContent.includes(marker)) failures.push(`/home: قرارداد رابط ${marker} وجود ندارد`);
}
if ((homeContent.match(/class="home-service-card/g) || []).length !== global.YOLDA_DATA.services.length) {
  failures.push("/home: همه سرویس‌ها در داشبورد خانه نمایش داده نمی‌شوند");
}

const commerceContracts = [
  ["/cart", "cart-checkout-grid"],
  ["/payment", "payment-flow-hero"],
  ["/orders", "orders-overview-hero"],
  ["/tracking", "tracking-status-banner"],
  ["/order/details", "order-detail-hero"],
  ["/payment/result/failed", "yld-pay-payment-failed.webp"],
  ["/order/cancel", "yld-order-cancel.webp"]
];
for (const [route, marker] of commerceContracts) {
  if (!pages.resolve(route).content.includes(marker)) failures.push(`${route}: قرارداد رابط ارتقایافته ${marker} وجود ندارد`);
}

for (const filename of global.YOLDA_DATA.icons) {
  if (!fs.existsSync(path.join(root, "assets", "icons", filename))) failures.push(`فایل کتابخانه آیکون پیدا نشد: ${filename}`);
}
const iconFiles = fs.readdirSync(path.join(root, "assets", "icons")).filter((filename) => filename.toLowerCase().endsWith(".webp"));
if (iconFiles.length !== global.YOLDA_DATA.icons.length) failures.push(`تعداد آیکون‌های دیسک (${iconFiles.length}) با کتابخانه (${global.YOLDA_DATA.icons.length}) برابر نیست`);

const aiContracts = [
  ["/ai", "ai-context-banner"],
  ["/ai", "ai-hint-row"],
  ["/ai", "ai-service-picker"],
  ["/ai/quiz", 'name="service"'],
  ["/ai/quiz", "data-ai-step-choice"],
  ["/ai/quiz/2", 'name="mood"'],
  ["/ai/quiz/3", 'name="goal"'],
  ["/ai/quiz/4", 'name="cuisine"'],
  ["/ai/quiz/5", 'name="exclusions"'],
  ["/ai/quiz/5", 'name="mealTime"'],
  ["/ai/results", "ai-constraint-panel"],
  ["/ai/results", "data-ai-refine"],
  ["/ai/results", "ai-top-pick"]
];
for (const [route, marker] of aiContracts) {
  if (!pages.resolve(route).content.includes(marker)) failures.push(`${route}: قرارداد جریان AI ${marker} وجود ندارد`);
}

const profile = global.YOLDA_RECOMMENDER.parseNaturalLanguage("غذای سالم تا ۳۰۰ هزار تومان و بدون قارچ");
const recommendations = global.YOLDA_RECOMMENDER.recommend(global.YOLDA_DATA.products, profile, { service: "food", limit: 5 });
if (!recommendations.results.length) failures.push("موتور پیشنهاددهنده نتیجه‌ای نساخت");
const quizProfile = global.YOLDA_RECOMMENDER.profileFromSelections({ mood: "comfort", goal: "popular", cuisine: "iranian", exclusions: "قارچ، لبنیات", mealTime: "dinner" });
if (quizProfile.priority !== "popular" || quizProfile.mealTime !== "dinner" || !quizProfile.exclusions.includes("قارچ") || !quizProfile.exclusions.includes("لبنیات")) {
  failures.push("پروفایل پرسش‌نامه AI محدودیت‌ها، وعده یا اولویت را درست ثبت نمی‌کند");
}
const groceryProfile = global.YOLDA_RECOMMENDER.parseNaturalLanguage("برای خرید سوپرمارکت میوه و سبزی می‌خواهم");
if (groceryProfile.service !== "grocery") failures.push("AI سرویس سوپرمارکت را از درخواست طبیعی تشخیص نمی‌دهد");

const offersContent = pages.resolve("/offers").content;
for (const marker of ["offers-hero-art", 'data-filter-group="offers"', 'data-filter-item="offers"', 'data-filter-count="offers"']) {
  if (!offersContent.includes(marker)) failures.push(`/offers: قرارداد رفع باگ پیشنهادها ${marker} وجود ندارد`);
}

const indexHtml = fs.readFileSync(path.join(root, "index.html"), "utf8");
for (const id of ["page-loader", "ai-loader", "app", "modal-root", "toast"]) {
  if (!indexHtml.includes(`id="${id}"`)) failures.push(`پوسته برنامه فاقد #${id} است`);
}
if (!fs.existsSync(path.join(root, "BRAND_AND_LOADING_ASSETS.md"))) failures.push("راهنمای دارایی‌های برند و لودینگ وجود ندارد");

const appSource = fs.readFileSync(path.join(root, "assets", "js", "app.js"), "utf8");
const mainCss = fs.readFileSync(path.join(root, "assets", "css", "main.css"), "utf8");
const serviceWorker = fs.readFileSync(path.join(root, "service-worker.js"), "utf8");
if (!appSource.includes("function normalizeIconSprites")) failures.push("نرمال‌سازی Sprite آیکن‌ها وجود ندارد");
if (!appSource.includes('asset.closest(".icon-card")')) failures.push("کتابخانه آیکن از برش Sprite مستثنا نشده است");
if (appSource.includes("document.body.dataset.route =")) failures.push("نشانگر مسیر body با قرارداد data-route اکشن‌ها تداخل دارد");
if (!appSource.includes("document.body.dataset.page =")) failures.push("نشانگر امن صفحه روی body وجود ندارد");
if (!mainCss.includes(".icon-sprite-crop")) failures.push("استایل Sprite آیکن‌ها وجود ندارد");
if (!serviceWorker.includes('CACHE_NAME = "yolda-web-v29"')) failures.push("نسخه کش Service Worker به‌روز نیست");
if (!serviceWorker.includes('assets/media/yolda-loading.webm')) failures.push("ویدیوی لودینگ در کش آفلاین ثبت نشده است");
if (!appSource.includes('loader.classList.add("has-media")')) failures.push("حالت تمام‌صفحه لودینگ ویدیویی فعال نمی‌شود");
if (!appSource.includes("const isInitial = !lastRenderedPath")) failures.push("لودینگ مسیری برای همه صفحه‌ها فعال نیست");
if (!fs.existsSync(path.join(root, "assets", "media", "yolda-loading.webm"))) failures.push("ویدیوی لودینگ یولدا وجود ندارد");
if (!fs.existsSync(path.join(root, "assets", "brand", "yolda-logo.png"))) failures.push("لوگوی نهایی یولدا وجود ندارد");
for (const font of ["Dana-Regular.woff2", "Dana-Medium.woff2", "Dana-DemiBold.woff2", "Dana-Bold.woff2", "Dana-ExtraBold.woff2", "Dana-Black.woff2"]) {
  if (!fs.existsSync(path.join(root, "assets", "fonts", font))) failures.push(`فونت دانا پیدا نشد: ${font}`);
}
if (!appSource.includes('scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" })')) failures.push("تب فعال در پیمایش افقی نمایان نمی‌شود");
if (!indexHtml.includes('data.themePreference = preference') && !indexHtml.includes('dataset.themePreference = preference')) failures.push("اعمال زودهنگام پوسته برای جلوگیری از پرش رنگ وجود ندارد");
if (!appSource.includes('themeMedia.addEventListener')) failures.push("هماهنگی زنده پوسته با تنظیمات سیستم وجود ندارد");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Yolda smoke test passed: ${routes.length} routes, ${global.YOLDA_DATA.icons.length} icons.`);
