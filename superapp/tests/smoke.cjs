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
  aiHistory: [],
  aiFeedback: {},
  aiPreferences: {},
  aiResult: null,
  user: { displayName: "کاربر تست" }
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
  "/product/food-1", "/category/food/pizza", "/search", "/favorites", "/cart",
  "/checkout/address", "/checkout/time", "/payment", "/payment/result/success", "/payment/result/failed",
  "/orders", "/tracking", "/order/details", "/order/cancel", "/order/review",
  "/profile", "/profile/edit", "/addresses", "/address/new", "/payments", "/wallet",
  "/wallet/topup", "/transactions", "/rewards", "/invite", "/notifications", "/settings",
  "/settings/language", "/settings/security", "/settings/notifications", "/support", "/support/tickets",
  "/support/new-ticket", "/support/ticket/SUP-1042", "/prescription", "/prescription/status", "/delivery",
  "/bills", "/reservation", "/ai", "/ai/quiz", "/ai/results", "/ai/history", "/ai/preferences",
  "/vendor-panel", "/vendor-panel/orders", "/vendor-panel/catalog", "/vendor-panel/inventory",
  "/vendor-panel/finance", "/vendor-panel/reviews", "/vendor-panel/settings", "/courier", "/courier/orders",
  "/courier/active", "/courier/earnings", "/courier/history", "/courier/profile", "/ops", "/ops/orders",
  "/ops/couriers", "/ops/vendors", "/ops/customers", "/ops/finance", "/ops/support", "/ops/reports",
  "/ops/content", "/ops/settings", "/ops/audit", "/icons", "/offline"
];

const failures = [];
for (const route of routes) {
  try {
    const result = pages.resolve(route);
    if (!result?.content?.includes("id=\"page-content\"")) throw new Error("محتوای اصلی صفحه وجود ندارد");
    if (/\b(?:undefined|NaN)\b/.test(result.content)) throw new Error("مقدار نامعتبر در HTML");
    for (const match of result.content.matchAll(/assets\/icons\/([^"']+)/g)) {
      const iconPath = path.join(root, "assets", "icons", match[1]);
      if (!fs.existsSync(iconPath)) throw new Error(`آیکون پیدا نشد: ${match[1]}`);
    }
  } catch (error) {
    failures.push(`${route}: ${error.message}`);
  }
}

const profile = global.YOLDA_RECOMMENDER.parseNaturalLanguage("غذای سالم تا ۳۰۰ هزار تومان و بدون قارچ");
const recommendations = global.YOLDA_RECOMMENDER.recommend(global.YOLDA_DATA.products, profile, { service: "food", limit: 5 });
if (!recommendations.results.length) failures.push("موتور پیشنهاددهنده نتیجه‌ای نساخت");

if (failures.length) {
  console.error(failures.join("\n"));
  process.exit(1);
}

console.log(`Yolda smoke test passed: ${routes.length} routes, ${global.YOLDA_DATA.icons.length} icons.`);
