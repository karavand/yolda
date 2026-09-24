(function () {
  "use strict";

  const data = window.YOLDA_DATA;
  const app = document.getElementById("app");
  const modalRoot = document.getElementById("modal-root");
  const toast = document.getElementById("toast");
  const pageLoader = document.getElementById("page-loader");
  const aiLoader = document.getElementById("ai-loader");
  const api = window.YOLDA_API;
  const config = window.YOLDA_CONFIG;
  const storageKey = "yolda-real-site-state-v3";
  const themeMedia = window.matchMedia("(prefers-color-scheme: dark)");

  const defaultState = {
    carts: {
      food: [{ id: "food-1", qty: 1 }],
      grocery: [],
      pharmacy: []
    },
    activeCartService: "food",
    favorites: ["food-4"],
    theme: "system",
    searchService: "all",
    iconCategory: "all",
    aiProfile: null,
    aiResult: null,
    aiHistory: [],
    aiFeedback: {},
    aiPreferences: {},
    pendingPhone: "",
    user: {
      displayName: "سارا محمدی",
      email: "sara@example.com",
      birthday: "۱۳۷۵/۰۶/۲۱",
      city: "ارومیه",
      phone: "۰۹۱۲ ۳۴۵ ۶۷۸۹"
    },
    addresses: [
      { id: "home", title: "خانه", value: "ارومیه، خیابان دانشگاه، کوچه سوم، پلاک ۱۸", kind: "home" },
      { id: "work", title: "محل کار", value: "ارومیه، میدان ایالت، ساختمان اداری، طبقه ۵", kind: "work" }
    ],
    selectedAddressId: "home",
    paymentMethods: [
      { id: "mellat-4567", bank: "بانک ملت", last4: "4567", expiry: "۰۶/۰۵", isDefault: true },
      { id: "saman-8910", bank: "بانک سامان", last4: "8910", expiry: "۰۷/۰۸", isDefault: false }
    ],
    walletBalance: 1250000,
    transactions: [
      { id: "tx-topup", title: "افزایش موجودی", subtitle: "امروز · ۱۳:۲۰", amount: 1000000, kind: "deposit" },
      { id: "tx-order", title: "سفارش رومانو", subtitle: "امروز · ۱۲:۴۸", amount: -749000, kind: "payment" },
      { id: "tx-refund", title: "بازگشت وجه", subtitle: "۲۶ شهریور · ۲۰:۴۵", amount: 220000, kind: "refund" },
      { id: "tx-pharmacy", title: "سفارش داروخانه", subtitle: "۲۵ شهریور · ۱۷:۱۰", amount: -520000, kind: "payment" },
      { id: "tx-invite", title: "هدیه معرفی دوست", subtitle: "۲۳ شهریور · ۱۰:۰۵", amount: 100000, kind: "deposit" }
    ],
    settings: {
      cashOnDelivery: true,
      language: "fa",
      notifications: { orders: true, offers: true, wallet: false, support: true },
      security: { biometric: true, twoFactor: false },
      accessibility: { reduceMotion: false, highContrast: false, largeText: false }
    },
    isAuthenticated: true,
    notificationsRead: false
  };

  const state = loadState();
  normalizeState();
  applyTheme(state.theme);
  applyInterfacePreferences();
  const faNumber = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 1 });
  const faMoney = new Intl.NumberFormat("fa-IR", { maximumFractionDigits: 0 });
  let toastTimer;
  let loaderTimer;
  let otpTimer;
  let routeRenderToken = 0;
  let modalReturnFocus = null;
  let lastRenderedPath = "";
  const routeTrail = [currentPath()];
  let routeNavigationAction = "";

  const icon = (name) => `assets/icons/${name}`;
  const number = (value) => faNumber.format(value);
  const money = (value) => `${faMoney.format(value)} تومان`;
  const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
  })[character]);
  const isFavorite = (id) => state.favorites.includes(id);
  const cartTotal = () => state.cart.reduce((sum, entry) => {
    const product = data.products.find((item) => item.id === entry.id);
    return sum + (product ? product.price * entry.qty : 0);
  }, 0);
  const cartCount = () => state.cart.reduce((sum, entry) => sum + entry.qty, 0);
  const allCartCount = () => Object.values(state.carts).flat().reduce((sum, entry) => sum + entry.qty, 0);
  const toEnglishDigits = (value) => String(value || "").replace(/[۰-۹٠-٩]/g, (digit) => {
    const faIndex = "۰۱۲۳۴۵۶۷۸۹".indexOf(digit);
    return faIndex >= 0 ? String(faIndex) : String("٠١٢٣٤٥٦٧٨٩".indexOf(digit));
  });
  const toPersianDigits = (value) => String(value ?? "").replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
  const formatIranPhone = (value) => {
    const digits = toEnglishDigits(value).replace(/\D/g, "").replace(/^98/, "").replace(/^0/, "");
    if (!/^9\d{9}$/.test(digits)) return toPersianDigits(value);
    return `۰${toPersianDigits(digits.slice(0, 3))} ${toPersianDigits(digits.slice(3, 6))} ${toPersianDigits(digits.slice(6))}`;
  };

  const pages = window.createYoldaPages({
    data,
    state,
    icon,
    number,
    money,
    isFavorite,
    cartTotal,
    cartCount,
    recommender: window.YOLDA_RECOMMENDER
  });

  function loadState() {
    try {
      const stored = JSON.parse(localStorage.getItem(storageKey));
      const previous = JSON.parse(localStorage.getItem("yolda-real-site-state-v2"));
      const legacy = JSON.parse(localStorage.getItem("yolda-static-prototype-state-v1"));
      return { ...defaultState, ...(stored || previous || legacy || {}) };
    } catch (error) {
      return { ...defaultState };
    }
  }

  function normalizeState() {
    if (!state.carts) {
      state.carts = { food: Array.isArray(state.cart) ? state.cart : [], grocery: [], pharmacy: [] };
    }
    ["food", "grocery", "pharmacy"].forEach((service) => {
      if (!Array.isArray(state.carts[service])) state.carts[service] = [];
    });
    if (!state.activeCartService || !state.carts[state.activeCartService]) state.activeCartService = "food";
    if (!Array.isArray(state.favorites)) state.favorites = [];
    if (!Array.isArray(state.aiHistory)) state.aiHistory = [];
    if (!state.aiFeedback || typeof state.aiFeedback !== "object") state.aiFeedback = {};
    if (!state.aiPreferences || typeof state.aiPreferences !== "object") state.aiPreferences = {};
    state.user = { ...defaultState.user, ...(state.user && typeof state.user === "object" ? state.user : {}) };
    if (!Array.isArray(state.addresses) || !state.addresses.length) state.addresses = defaultState.addresses.map((item) => ({ ...item }));
    if (!state.selectedAddressId || !state.addresses.some((item) => item.id === state.selectedAddressId)) {
      state.selectedAddressId = state.addresses[0]?.id || "";
    }
    if (!Array.isArray(state.paymentMethods)) state.paymentMethods = defaultState.paymentMethods.map((item) => ({ ...item }));
    if (!state.paymentMethods.some((item) => item.isDefault) && state.paymentMethods[0]) state.paymentMethods[0].isDefault = true;
    state.walletBalance = Number.isFinite(Number(state.walletBalance)) ? Number(state.walletBalance) : defaultState.walletBalance;
    if (!Array.isArray(state.transactions)) state.transactions = defaultState.transactions.map((item) => ({ ...item }));
    const storedSettings = state.settings && typeof state.settings === "object" ? state.settings : {};
    state.settings = {
      ...defaultState.settings,
      ...storedSettings,
      notifications: { ...defaultState.settings.notifications, ...(storedSettings.notifications || {}) },
      security: { ...defaultState.settings.security, ...(storedSettings.security || {}) },
      accessibility: { ...defaultState.settings.accessibility, ...(storedSettings.accessibility || {}) }
    };
    if (!["light", "dark", "system"].includes(state.theme)) state.theme = "system";
    if (state.settings.language !== "fa") state.settings.language = "fa";
    state.isAuthenticated = state.isAuthenticated !== false;
    state.notificationsRead = state.notificationsRead === true;
    Object.defineProperty(state, "cart", {
      configurable: true,
      enumerable: false,
      get() { return state.carts[state.activeCartService]; },
      set(value) { state.carts[state.activeCartService] = Array.isArray(value) ? value : []; }
    });
  }

  function saveState() {
    try {
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (error) {
      // The application stays functional even when local storage is unavailable.
    }
  }

  function resolvedTheme(preference = state.theme) {
    if (preference === "system") return themeMedia.matches ? "dark" : "light";
    return preference === "dark" ? "dark" : "light";
  }

  function themeLabel(preference = state.theme) {
    return preference === "dark" ? "تیره" : preference === "light" ? "روشن" : "هماهنگ با دستگاه";
  }

  function applyTheme(preference = state.theme, options = {}) {
    const selected = ["light", "dark", "system"].includes(preference) ? preference : "system";
    const resolved = resolvedTheme(selected);
    state.theme = selected;
    if (options.transition && !state.settings?.accessibility?.reduceMotion) {
      document.documentElement.classList.add("theme-transition");
      window.setTimeout(() => document.documentElement.classList.remove("theme-transition"), 320);
    }
    document.documentElement.dataset.theme = resolved;
    document.documentElement.dataset.themePreference = selected;
    document.getElementById("theme-color-meta")?.setAttribute("content", resolved === "dark" ? "#140e1a" : "#5e1a84");
    document.querySelectorAll("[data-theme-option]").forEach((button) => {
      const isSelected = button.dataset.themeOption === selected;
      button.classList.toggle("is-selected", isSelected);
      button.setAttribute("aria-pressed", isSelected ? "true" : "false");
    });
    document.querySelectorAll("[data-current-theme]").forEach((element) => {
      element.textContent = `${themeLabel(selected)}${selected === "system" ? ` · اکنون ${resolved === "dark" ? "تیره" : "روشن"}` : ""}`;
    });
    if (options.announce) showToast(`ظاهر ${themeLabel(selected)} فعال شد`);
  }

  function applyInterfacePreferences() {
    const preferences = state.settings.accessibility;
    document.documentElement.dataset.motion = preferences.reduceMotion ? "reduced" : "full";
    document.documentElement.dataset.contrast = preferences.highContrast ? "high" : "normal";
    document.documentElement.dataset.textSize = preferences.largeText ? "large" : "default";
  }

  function currentPath() {
    const raw = window.location.hash.replace(/^#/, "") || "/home";
    return raw.split("?")[0] || "/home";
  }

  const nextFrame = () => new Promise((resolve) => window.requestAnimationFrame(() => resolve()));

  function brandMark(variant = "default") {
    const brand = config.assets?.brand;
    const isFull = variant.includes("full");
    const isLight = variant.includes("light");
    const source = isFull
      ? (isLight ? brand?.logoLight : brand?.logo)
      : (isLight ? brand?.symbolLight : brand?.symbol);
    const asset = brand?.enabled
      ? `<img class="brand-asset" data-brand-asset src="${source}" alt="" decoding="async" fetchpriority="high">`
      : "";
    return `<span class="brand-asset-shell ${isFull ? "is-lockup" : "is-symbol"}" aria-hidden="true"><span class="brand-placeholder">ی</span>${asset}</span>`;
  }

  function hydrateBrandAssets() {
    document.querySelectorAll("[data-brand-asset]").forEach((asset) => {
      const shell = asset.closest(".brand-asset-shell");
      const markReady = () => shell?.classList.add("has-asset");
      const markFailed = () => shell?.classList.remove("has-asset");
      asset.addEventListener("load", markReady, { once: true });
      asset.addEventListener("error", markFailed, { once: true });
      if (asset.complete) {
        if (asset.naturalWidth) markReady();
        else markFailed();
      }
    });
  }

  const transparentIconPixel = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'/%3E";

  function normalizeIconSprites(scope = document) {
    scope.querySelectorAll('img[src*="assets/icons/"]:not([data-icon-normalized])').forEach((asset) => {
      asset.dataset.iconNormalized = "pending";
      const normalize = () => {
        if (!asset.isConnected || !asset.naturalWidth || !asset.naturalHeight) return;
        if (asset.closest(".icon-card")) {
          asset.dataset.iconNormalized = "ready";
          return;
        }
        const ratio = asset.naturalWidth / asset.naturalHeight;
        if (ratio < 1.75) {
          asset.dataset.iconNormalized = "ready";
          return;
        }
        const source = asset.currentSrc || asset.src;
        const columns = ratio >= 2.96 ? 3 : 4;
        const zoom = columns === 3 ? 1.35 : 1.05;
        const horizontalPosition = (((zoom - 1) / 2) / ((columns * zoom) - 1)) * 100;
        asset.classList.add("icon-sprite-crop");
        asset.style.setProperty("--icon-sprite-size", `${columns * zoom * 100}% auto`);
        asset.style.setProperty("--icon-sprite-position", `${horizontalPosition.toFixed(2)}% top`);
        asset.style.backgroundImage = `url("${source.replaceAll('"', "%22")}")`;
        asset.src = transparentIconPixel;
        asset.dataset.iconNormalized = "ready";
      };
      const markFailed = () => { asset.dataset.iconNormalized = "failed"; };
      if (asset.complete && asset.naturalWidth) normalize();
      else asset.addEventListener("load", normalize, { once: true });
      asset.addEventListener("error", markFailed, { once: true });
    });
  }

  function configureBrandMetadata() {
    const brand = config.assets?.brand;
    if (!brand?.enabled || !brand.favicon) return;
    const favicon = document.createElement("link");
    favicon.rel = "icon";
    favicon.type = brand.favicon.toLowerCase().endsWith(".png") ? "image/png" : "image/svg+xml";
    favicon.href = brand.favicon;
    document.head.append(favicon);
  }

  function configureLoaderVideo(loader, media) {
    const video = loader?.querySelector("[data-loader-video]");
    if (!video || !media?.enabled || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    if (media.poster) video.poster = media.poster;
    [[media.webm, "video/webm"], [media.mp4, "video/mp4"]].forEach(([src, type]) => {
      if (!src) return;
      const source = document.createElement("source");
      source.src = src;
      source.type = type;
      video.append(source);
    });
    const visual = video.closest(".loader-visual");
    video.addEventListener("canplay", () => {
      visual?.classList.add("has-media");
      video.play().catch(() => undefined);
    });
    video.addEventListener("error", () => visual?.classList.remove("has-media"));
    video.load();
  }

  function showPageLoader() {
    if (!pageLoader) return performance.now();
    window.clearTimeout(loaderTimer);
    pageLoader.hidden = false;
    document.body.classList.add("has-blocking-loader");
    app.setAttribute("aria-busy", "true");
    window.requestAnimationFrame(() => pageLoader.classList.add("is-visible"));
    return performance.now();
  }

  function hidePageLoader(startedAt = performance.now(), token = routeRenderToken) {
    const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
    const remaining = Math.max(0, (reducedMotion ? 60 : 340) - (performance.now() - startedAt));
    window.clearTimeout(loaderTimer);
    loaderTimer = window.setTimeout(() => {
      if (token !== routeRenderToken || !pageLoader) return;
      pageLoader.classList.remove("is-visible");
      app.setAttribute("aria-busy", "false");
      document.body.classList.remove("has-blocking-loader");
      loaderTimer = window.setTimeout(() => {
        if (token === routeRenderToken && pageLoader) pageLoader.hidden = true;
      }, reducedMotion ? 20 : 190);
    }, remaining);
  }

  async function renderWithLoader() {
    const token = ++routeRenderToken;
    if (lastRenderedPath) {
      window.clearTimeout(loaderTimer);
      pageLoader?.classList.remove("is-visible");
      if (pageLoader) pageLoader.hidden = true;
      document.body.classList.remove("has-blocking-loader");
      app.setAttribute("aria-busy", "false");
      render();
      return;
    }
    const startedAt = showPageLoader();
    await nextFrame();
    if (token !== routeRenderToken) return;
    render();
    hidePageLoader(startedAt, token);
  }

  function showAiLoader() {
    if (!aiLoader) return;
    aiLoader.hidden = false;
    document.body.classList.add("has-blocking-loader");
    app.setAttribute("aria-busy", "true");
    window.requestAnimationFrame(() => aiLoader.classList.add("is-visible"));
    aiLoader.querySelector("video")?.play().catch(() => undefined);
  }

  async function hideAiLoader() {
    if (!aiLoader) return;
    aiLoader.classList.remove("is-visible");
    await new Promise((resolve) => window.setTimeout(resolve, 190));
    aiLoader.hidden = true;
    if (!pageLoader?.classList.contains("is-visible")) document.body.classList.remove("has-blocking-loader");
    app.setAttribute("aria-busy", "false");
  }

  function navigate(path) {
    if (currentPath() === path) {
      render();
      return;
    }
    routeTrail.push(path);
    routeNavigationAction = "push";
    window.location.hash = path;
  }

  function navigateBack() {
    if (routeTrail.length > 1) {
      routeTrail.pop();
      routeNavigationAction = "back";
      window.history.back();
      return;
    }
    navigate("/home");
  }

  function desktopNavigation(path) {
    return `
      <aside class="desktop-nav" aria-label="ناوبری کامل نمونه یولدا">
        <a class="desktop-brand" href="#/home" data-route="/home">
          ${brandMark("full-light")}
          <span class="desktop-brand-copy"><span>سوپراپلیکیشن شهری</span><small>خدمات روزمره ارومیه</small></span>
        </a>
        ${data.desktopNavigation.map((group) => `
          <nav class="desktop-nav-group" aria-label="${group.label}">
            <div class="desktop-nav-label">${group.label}</div>
            ${group.items.map((item) => `
              <a class="desktop-nav-link ${isRouteActive(path, item.route) ? "is-active" : ""}" href="#${item.route}" data-route="${item.route}" ${isRouteActive(path, item.route) ? "aria-current=\"page\"" : ""}>
                <img src="${icon(item.icon)}" alt=""><span>${item.title}</span>
              </a>
            `).join("")}
          </nav>
        `).join("")}
        <div class="desktop-nav-footer">
          نسخه وب یولدا · شهر ارومیه<br>
          PWA · پیشنهاد هوشمند · طراحی واکنش‌گرا
        </div>
      </aside>
    `;
  }

  function header(title, path) {
    const selectedAddress = state.addresses.find((item) => item.id === state.selectedAddressId) || state.addresses[0];
    const hasBack = !["/", "/home"].includes(path);
    return `
      <header class="mobile-header ${hasBack ? "has-back" : ""}">
        <div class="header-leading">
          ${hasBack ? `<button type="button" class="header-icon header-back" data-back aria-label="بازگشت به صفحه قبل"><img src="${icon("yld-ui-chevron-previous.webp")}" alt=""></button>` : ""}
          <a class="brand-lockup" href="#/home" data-route="/home" aria-label="خانه یولدا">
            ${brandMark()}
            <span>${escapeHtml(title || "یولدا")}</span>
          </a>
        </div>
        <div class="header-actions">
          <button type="button" class="address-chip" data-route="/addresses">
            <img src="${icon("yld-map-pin.webp")}" width="18" height="18" alt="">
            <span>${selectedAddress ? `${escapeHtml(selectedAddress.title)} · ${escapeHtml(selectedAddress.value)}` : "افزودن آدرس"}</span>
          </button>
          <button type="button" class="header-icon ai-header-button" data-route="/ai" aria-label="پیشنهاد هوشمند یولدا">
            <img src="${icon("yld-discover-recommended.webp")}" alt="">
          </button>
          <button type="button" class="header-icon" data-route="/cart" aria-label="سبدهای خرید">
            <img src="${icon("yld-ui-cart.webp")}" alt="">
            ${allCartCount() ? `<b class="nav-count header-count">${number(allCartCount())}</b>` : ""}
          </button>
          <button type="button" class="header-icon" data-route="/notifications" aria-label="اعلان‌ها">
            <img src="${icon("yld-ui-notifications.webp")}" alt="">
            ${state.notificationsRead ? "" : `<span class="notification-dot" aria-hidden="true"></span>`}
          </button>
        </div>
      </header>
    `;
  }

  function bottomNavigation(path) {
    const items = [
      ["خانه", "/home", "yld-ui-categories.webp"],
      ["سفارش‌ها", "/orders", "yld-ui-orders.webp"],
      ["سبد خرید", "/cart", "yld-ui-cart.webp"],
      ["پیام‌ها", "/notifications", "yld-ui-notifications.webp"],
      ["پروفایل", "/profile", "yld-profile-personal-info.webp"]
    ];
    return `
      <nav class="bottom-nav" aria-label="ناوبری اصلی">
        ${items.map(([label, route, itemIcon]) => `
          <a class="${isBottomActive(path, route) ? "is-active" : ""}" href="#${route}" data-route="${route}" ${isBottomActive(path, route) ? "aria-current=\"page\"" : ""}>
            <img src="${icon(itemIcon)}" alt="">
            <span>${label}</span>
            ${route === "/cart" && allCartCount() ? `<b class="nav-count">${number(allCartCount())}</b>` : ""}
          </a>
        `).join("")}
      </nav>
    `;
  }

  function cartBar(hasBottom) {
    return `
      <button class="cart-bar ${hasBottom ? "" : "no-bottom"}" data-route="/cart">
        <span><strong>مشاهده سبد خرید</strong><br><span>${number(cartCount())} آیتم</span></span>
        <strong>${money(cartTotal())}</strong>
      </button>
    `;
  }

  function render() {
    const path = currentPath();
    if (path !== "/auth/otp") window.clearInterval(otpTimer);
    const routeChanged = path !== lastRenderedPath;
    const previousScrollY = window.scrollY;
    const shouldMarkNotificationsRead = path === "/notifications" && !state.notificationsRead;
    const routePage = pages.resolve(path);
    const hasHeader = routePage.header !== false;
    const hasBottom = routePage.bottom === true;
    applyTheme(state.theme);
    applyInterfacePreferences();
    document.title = `${routePage.title || "یولدا"} — یولدا`;
    app.innerHTML = `
      <div class="app-shell">
        ${desktopNavigation(path)}
        <section class="workspace">
          <div class="app-frame ${routePage.wide ? "wide-frame" : ""} ${hasBottom ? "has-bottom-nav" : ""} ${routePage.cartBar ? "has-cart-bar" : ""}">
            ${hasHeader ? header(routePage.title, path) : ""}
            ${routePage.content}
            ${routePage.cartBar ? cartBar(hasBottom) : ""}
            ${hasBottom ? bottomNavigation(path) : ""}
          </div>
        </section>
      </div>
    `;
    delete document.body.dataset.route;
    document.body.dataset.page = path.replace(/^\//, "").replaceAll("/", "-") || "home";
    modalRoot.innerHTML = "";
    document.body.classList.remove("has-open-modal");
    app.removeAttribute("inert");
    app.removeAttribute("aria-hidden");
    app.querySelectorAll("[data-route]").forEach((element) => {
      const route = element.dataset.route;
      if (element.tagName === "A" && !element.hasAttribute("href")) element.setAttribute("href", `#${route}`);
      if (!["A", "BUTTON", "INPUT", "SELECT", "TEXTAREA"].includes(element.tagName) && !element.hasAttribute("tabindex")) {
        element.setAttribute("tabindex", "0");
        if (!element.hasAttribute("role")) element.setAttribute("role", "link");
      }
    });
    bindPageInputs(path);
    hydrateBrandAssets();
    normalizeIconSprites(app);
    lastRenderedPath = path;
    window.scrollTo({ top: routeChanged ? 0 : previousScrollY, behavior: "auto" });
    const main = document.getElementById("page-content");
    if (main && routeChanged) {
      main.setAttribute("tabindex", "-1");
      main.focus({ preventScroll: true });
    }
    if (shouldMarkNotificationsRead) {
      window.setTimeout(() => {
        if (currentPath() !== "/notifications") return;
        state.notificationsRead = true;
        saveState();
        document.querySelector(".notification-dot")?.remove();
        const status = document.querySelector("[data-notification-status]");
        if (status) {
          status.classList.remove("yellow");
          status.classList.add("success");
          status.textContent = "همه دیده شده";
        }
        document.querySelectorAll(".notification-item").forEach((item) => item.classList.add("is-read"));
      }, 900);
    }
  }

  function isRouteActive(path, route) {
    if (route === "/home") return path === "/home" || path === "/";
    if (route === "/food") return path === "/food" || path === "/vendor/food";
    if (route === "/grocery") return path === "/grocery" || path === "/vendor/grocery";
    if (route === "/pharmacy") return path === "/pharmacy" || path === "/vendor/pharmacy" || path === "/prescription";
    return path === route || path.startsWith(`${route}/`);
  }

  function isBottomActive(path, route) {
    if (route === "/home") return ["/home", "/food", "/grocery", "/pharmacy", "/search", "/ai"].some((base) => path === base || path.startsWith(`${base}/`));
    return path === route || path.startsWith(`${route}/`);
  }

  function addToCart(id) {
    const product = data.products.find((item) => item.id === id);
    if (!product) return showToast("این محصول در دسترس نیست");
    state.activeCartService = product.service;
    const existing = state.cart.find((entry) => entry.id === id);
    if (existing) existing.qty += 1;
    else state.cart.push({ id, qty: 1 });
    saveState();
    render();
    const names = { food: "غذا", grocery: "سوپرمارکت", pharmacy: "داروخانه" };
    showToast(`به سبد ${names[product.service]} اضافه شد`);
  }

  function changeQuantity(id, delta) {
    const item = state.cart.find((entry) => entry.id === id);
    if (!item) return;
    item.qty += delta;
    if (item.qty <= 0) state.cart = state.cart.filter((entry) => entry.id !== id);
    saveState();
    render();
  }

  function switchCart(service) {
    if (!state.carts[service]) return;
    state.activeCartService = service;
    saveState();
    render();
  }

  function applyAiPreferences(profile) {
    const preferences = state.aiPreferences || {};
    if (!profile.budget && preferences.budget) profile.budget = Number(preferences.budget) || null;
    if (!profile.cuisine && preferences.cuisine) {
      profile.cuisine = preferences.cuisine;
      if (profile.vector[preferences.cuisine] !== undefined) profile.vector[preferences.cuisine] = 0.7;
    }
    if ((!profile.dietary || !profile.dietary.length) && preferences.dietary) {
      profile.dietary = [preferences.dietary];
      if (profile.vector[preferences.dietary] !== undefined) profile.vector[preferences.dietary] = 0.75;
    }
    const exclusions = String(preferences.allergy || "").split(/[،,]/).map((item) => item.trim()).filter(Boolean);
    profile.exclusions = [...new Set([...(profile.exclusions || []), ...exclusions])];
    if (preferences.cuisine || preferences.dietary || preferences.budget || exclusions.length) profile.recognized.push("saved-preferences");
    return profile;
  }

  async function buildAiRecommendation(profile, query) {
    const startedAt = performance.now();
    showAiLoader();
    try {
      await nextFrame();
      const result = window.YOLDA_RECOMMENDER.recommend(data.products, profile, {
        service: "food",
        limit: 6,
        feedback: state.aiPreferences.learning === false ? {} : state.aiFeedback
      });
      state.aiProfile = profile;
      state.aiResult = result;
      state.aiHistory.unshift({
        id: `ai-${Date.now()}`,
        query,
        generatedAt: result.generatedAt,
        productIds: result.results.map((item) => item.product.id),
        confidence: result.confidence
      });
      state.aiHistory = state.aiHistory.slice(0, 12);
      saveState();
      const reducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
      const remaining = Math.max(0, (reducedMotion ? 100 : 520) - (performance.now() - startedAt));
      await new Promise((resolve) => window.setTimeout(resolve, remaining));
      await hideAiLoader();
      navigate("/ai/results");
    } catch (error) {
      await hideAiLoader();
      showToast("ساخت پیشنهاد انجام نشد؛ دوباره تلاش کن");
    }
  }

  function runAiFromText(text) {
    const profile = applyAiPreferences(window.YOLDA_RECOMMENDER.parseNaturalLanguage(text));
    return buildAiRecommendation(profile, text);
  }

  function runAiFromForm(form) {
    const values = Object.fromEntries(new FormData(form).entries());
    const profile = applyAiPreferences(window.YOLDA_RECOMMENDER.profileFromSelections(values));
    return buildAiRecommendation(profile, "انتخاب از پرسش‌نامه هوشمند");
  }

  function toggleFavorite(id) {
    if (state.favorites.includes(id)) {
      state.favorites = state.favorites.filter((item) => item !== id);
      showToast("از علاقه‌مندی‌ها حذف شد");
    } else {
      state.favorites.push(id);
      showToast("به علاقه‌مندی‌ها اضافه شد");
    }
    saveState();
    render();
  }

  function showToast(message) {
    window.clearTimeout(toastTimer);
    toast.textContent = message;
    toast.classList.add("is-visible");
    toastTimer = window.setTimeout(() => toast.classList.remove("is-visible"), 2400);
  }

  function setBusy(element, busy, label = "در حال انجام...") {
    if (!element) return;
    if (busy) {
      element.dataset.originalHtml = element.innerHTML;
      element.innerHTML = `<span class="button-spinner" aria-hidden="true"></span><span>${escapeHtml(label)}</span>`;
      element.disabled = true;
      element.setAttribute("aria-busy", "true");
    } else {
      element.innerHTML = element.dataset.originalHtml || element.innerHTML;
      element.disabled = false;
      element.removeAttribute("aria-busy");
      delete element.dataset.originalHtml;
    }
  }

  function openModal(type, itemId = "") {
    const address = state.addresses.find((item) => item.id === itemId);
    const card = state.paymentMethods.find((item) => item.id === itemId);
    const closeButton = `<button type="button" class="icon-button" data-close-modal aria-label="بستن پنجره"><img src="${icon("yld-ui-close.webp")}" alt=""></button>`;
    const addressModal = `
      <div class="page-title-row"><h2 id="modal-title">${address ? "ویرایش آدرس" : "آدرس جدید"}</h2>${closeButton}</div>
      <form data-form="address">
        <input type="hidden" name="id" value="${escapeHtml(address?.id || "")}">
        <div class="field"><label for="address-title">عنوان آدرس</label><input id="address-title" name="title" value="${escapeHtml(address?.title || "")}" placeholder="خانه، محل کار..." required></div>
        <div class="field"><label for="address-value">نشانی کامل</label><textarea id="address-value" name="address" rows="4" placeholder="خیابان، کوچه، پلاک و واحد" required>${escapeHtml(address?.value || "")}</textarea></div>
        <div class="field"><label for="address-phone">شماره تحویل‌گیرنده</label><input id="address-phone" name="phone" inputmode="tel" autocomplete="tel" value="${escapeHtml(address?.recipientPhone || state.user.phone || "")}" placeholder="۰۹۱۲ ۳۴۵ ۶۷۸۹"></div>
        <button class="btn btn-primary btn-block" type="submit">${address ? "ذخیره تغییرات" : "ذخیره آدرس"}</button>
      </form>
    `;
    const content = {
      discount: `
        <div class="page-title-row"><h2 id="modal-title">کد تخفیف</h2>${closeButton}</div>
        <form data-form="discount"><div class="field"><label for="discount-code">کد را وارد کنید</label><input id="discount-code" placeholder="مثلاً YOLDA20" dir="ltr" required></div><button class="btn btn-primary btn-block" type="submit">اعمال کد</button></form>
      `,
      "cancel-order": `
        <div class="page-title-row"><h2 id="modal-title">لغو سفارش</h2>${closeButton}</div>
        <p class="muted">اگر هنوز در بازه پنج‌دقیقه‌ای باشی، سفارش بدون هزینه لغو می‌شود.</p>
        <div class="field"><label for="cancel-reason">دلیل لغو</label><select id="cancel-reason"><option>تغییر نظرم</option><option>اشتباه در آدرس</option><option>اشتباه در اقلام</option></select></div>
        <button class="btn btn-danger btn-block" data-confirm-cancel>تأیید لغو سفارش</button>
      `,
      "new-address": addressModal,
      "edit-address": addressModal,
      "delete-address": `
        <div class="page-title-row"><h2 id="modal-title">حذف آدرس</h2>${closeButton}</div>
        <p>آیا از حذف آدرس «${escapeHtml(address?.title || "انتخاب‌شده") }» مطمئن هستید؟ این کار قابل بازگشت نیست.</p>
        <div class="action-grid"><button type="button" class="btn btn-secondary" data-close-modal>انصراف</button><button type="button" class="btn btn-danger" data-confirm-delete-address="${escapeHtml(itemId)}">حذف آدرس</button></div>
      `,
      "delete-card": `
        <div class="page-title-row"><h2 id="modal-title">حذف کارت بانکی</h2>${closeButton}</div>
        <p>کارت ${escapeHtml(card?.bank || "انتخاب‌شده")} با شماره پایانی <b dir="ltr">${escapeHtml(card?.last4 || "—")}</b> حذف شود؟</p>
        <div class="action-grid"><button type="button" class="btn btn-secondary" data-close-modal>انصراف</button><button type="button" class="btn btn-danger" data-confirm-delete-card="${escapeHtml(itemId)}">حذف کارت</button></div>
      `,
      "new-card": `
        <div class="page-title-row"><h2 id="modal-title">افزودن کارت بانکی</h2>${closeButton}</div>
        <form data-form="payment-card">
          <div class="field"><label for="card-bank">نام بانک</label><input id="card-bank" name="bank" placeholder="مثلاً بانک ملت" required></div>
          <div class="field"><label for="card-number">شماره کارت</label><input id="card-number" name="cardNumber" inputmode="numeric" autocomplete="cc-number" maxlength="19" dir="ltr" placeholder="0000 0000 0000 0000" required></div>
          <div class="field"><label for="card-expiry">تاریخ انقضا</label><input id="card-expiry" name="expiry" inputmode="numeric" maxlength="5" dir="ltr" placeholder="06/08" required></div>
          <p class="form-note">در نسخه متصل به بک‌اند، اطلاعات کارت باید فقط به‌صورت توکن امن بانکی ذخیره شود.</p>
          <button class="btn btn-primary btn-block" type="submit">ذخیره کارت</button>
        </form>
      `
    }[type];
    if (!content) return;
    modalReturnFocus = document.activeElement;
    document.body.classList.add("has-open-modal");
    app.setAttribute("inert", "");
    app.setAttribute("aria-hidden", "true");
    modalRoot.innerHTML = `<div class="modal-backdrop" data-close-modal-backdrop><section class="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">${content}</section></div>`;
    normalizeIconSprites(modalRoot);
    const cardNumber = modalRoot.querySelector("#card-number");
    if (cardNumber) cardNumber.addEventListener("input", () => {
      cardNumber.value = toEnglishDigits(cardNumber.value).replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
    });
    const cardExpiry = modalRoot.querySelector("#card-expiry");
    if (cardExpiry) cardExpiry.addEventListener("input", () => {
      const digits = toEnglishDigits(cardExpiry.value).replace(/\D/g, "").slice(0, 4);
      cardExpiry.value = digits.length > 2 ? `${digits.slice(0, 2)}/${digits.slice(2)}` : digits;
    });
    const firstControl = modalRoot.querySelector("form input:not([type='hidden']), form select, form textarea")
      || modalRoot.querySelector("button, [href], [tabindex]:not([tabindex='-1'])");
    if (firstControl) firstControl.focus();
  }

  function closeModal() {
    modalRoot.innerHTML = "";
    document.body.classList.remove("has-open-modal");
    app.removeAttribute("inert");
    app.removeAttribute("aria-hidden");
    if (modalReturnFocus?.isConnected) modalReturnFocus.focus();
    modalReturnFocus = null;
  }

  function bindPageInputs(path) {
    const activeScrollableTab = document.querySelector(".panel-tabs .is-active, .cart-tabs .is-active");
    if (activeScrollableTab) {
      window.requestAnimationFrame(() => activeScrollableTab.scrollIntoView({ behavior: "auto", block: "nearest", inline: "center" }));
    }

    if (path === "/auth/otp") {
      startOtpCountdown();
      const inputs = [...document.querySelectorAll(".otp-grid input")];
      inputs.forEach((input, index) => {
        input.addEventListener("input", () => {
          input.value = toEnglishDigits(input.value).replace(/\D/g, "").slice(0, 1);
          if (input.value && inputs[index + 1]) inputs[index + 1].focus();
        });
        input.addEventListener("keydown", (event) => {
          if (event.key === "Backspace" && !input.value && inputs[index - 1]) inputs[index - 1].focus();
        });
      });
    }

    if (path === "/search") {
      const searchInput = document.getElementById("global-search");
      if (searchInput) searchInput.addEventListener("input", updateSearchResults);
    }

    if (path === "/icons") {
      const iconSearch = document.getElementById("icon-search");
      if (iconSearch) iconSearch.addEventListener("input", filterIconGallery);
    }
  }

  function startOtpCountdown(seconds = 45) {
    window.clearInterval(otpTimer);
    const button = document.querySelector("[data-resend-otp]");
    if (!button) return;
    let countdown = button.querySelector("[data-otp-countdown]");
    if (!countdown) {
      button.innerHTML = `ارسال مجدد تا <b data-otp-countdown aria-live="polite">۰۰:۴۵</b>`;
      countdown = button.querySelector("[data-otp-countdown]");
    }
    let remaining = seconds;
    const update = () => {
      const minutes = String(Math.floor(remaining / 60)).padStart(2, "0");
      const secondsPart = String(remaining % 60).padStart(2, "0");
      countdown.textContent = toPersianDigits(`${minutes}:${secondsPart}`);
      if (remaining <= 0) {
        window.clearInterval(otpTimer);
        button.disabled = false;
        button.textContent = "ارسال مجدد کد";
        return;
      }
      remaining -= 1;
    };
    button.disabled = true;
    update();
    otpTimer = window.setInterval(update, 1000);
  }

  function updateSearchResults() {
    const input = document.getElementById("global-search");
    const container = document.getElementById("search-results");
    const count = document.getElementById("search-count");
    if (!input || !container) return;
    const query = input.value.trim().toLowerCase();
    const results = data.products.filter((item) => {
      const matchesService = state.searchService === "all" || item.service === state.searchService;
      const haystack = `${item.name} ${item.description} ${item.tag}`.toLowerCase();
      return matchesService && haystack.includes(query);
    });
    container.innerHTML = results.length
      ? results.map(pages.productRow).join("")
      : `<section class="empty-state" style="min-height:20rem"><img src="${icon("yld-discover-vendor-search.webp")}" alt=""><h2>نتیجه‌ای پیدا نشد</h2><p>نام دیگری امتحان کن یا فیلتر سرویس را تغییر بده.</p></section>`;
    normalizeIconSprites(container);
    if (count) count.textContent = `${number(results.length)} مورد`;
  }

  function filterIconGallery() {
    const query = (document.getElementById("icon-search")?.value || "").trim().toLowerCase();
    document.querySelectorAll(".icon-card").forEach((card) => {
      const matchesCategory = state.iconCategory === "all" || card.dataset.iconCategoryName === state.iconCategory;
      const matchesQuery = card.dataset.iconName.toLowerCase().includes(query);
      card.classList.toggle("hidden", !(matchesCategory && matchesQuery));
    });
  }

  function toggleSetting(path, target) {
    const parts = path.split(".");
    let cursor = state.settings;
    for (let index = 0; index < parts.length - 1; index += 1) {
      const part = parts[index];
      if (!cursor[part] || typeof cursor[part] !== "object") cursor[part] = {};
      cursor = cursor[part];
    }
    const key = parts[parts.length - 1];
    cursor[key] = !cursor[key];
    saveState();
    if (path.startsWith("accessibility.")) applyInterfacePreferences();
    target?.setAttribute("aria-pressed", cursor[key] ? "true" : "false");
    target?.querySelector(".switch")?.classList.toggle("is-on", cursor[key]);
    showToast("تنظیم ذخیره شد");
  }

  function handleChip(target) {
    const row = target.closest(".chip-row");
    row?.querySelectorAll(".chip").forEach((chip) => {
      chip.classList.toggle("is-active", chip === target);
      chip.setAttribute("aria-pressed", chip === target ? "true" : "false");
    });
    const group = target.dataset.filterGroup;
    const value = target.dataset.filterValue;
    if (!group || !value) return;
    document.querySelectorAll(`[data-filter-item="${group}"]`).forEach((item) => {
      const tags = (item.dataset.filterTags || "").split(" ");
      item.classList.toggle("hidden", value !== "all" && !tags.includes(value));
    });
  }

  function selectAddress(id) {
    if (!state.addresses.some((item) => item.id === id)) return;
    state.selectedAddressId = id;
    saveState();
    render();
    showToast("آدرس پیش‌فرض تغییر کرد");
  }

  function deleteAddress(id) {
    if (state.addresses.length <= 1) return showToast("حداقل یک آدرس باید باقی بماند");
    state.addresses = state.addresses.filter((item) => item.id !== id);
    if (state.selectedAddressId === id) state.selectedAddressId = state.addresses[0]?.id || "";
    saveState();
    render();
    showToast("آدرس حذف شد");
  }

  function setDefaultCard(id) {
    if (!state.paymentMethods.some((item) => item.id === id)) return;
    state.paymentMethods.forEach((item) => { item.isDefault = item.id === id; });
    saveState();
    render();
    showToast("کارت پیش‌فرض تغییر کرد");
  }

  function deleteCard(id) {
    const card = state.paymentMethods.find((item) => item.id === id);
    if (!card) return;
    state.paymentMethods = state.paymentMethods.filter((item) => item.id !== id);
    if (card.isDefault && state.paymentMethods[0]) state.paymentMethods[0].isDefault = true;
    saveState();
    render();
    showToast("کارت بانکی حذف شد");
  }

  async function logout(target) {
    setBusy(target, true, "در حال خروج...");
    try {
      await api.auth.logout();
      state.isAuthenticated = false;
      state.pendingPhone = "";
      saveState();
      navigate("/auth/login");
    } catch (error) {
      showToast(error.message || "خروج از حساب انجام نشد");
    } finally {
      setBusy(target, false);
    }
  }

  document.addEventListener("click", async (event) => {
    const target = event.target.closest("[data-route], [data-back], [data-add], [data-fav], [data-qty], [data-clear-cart], [data-cart-service], [data-pay], [data-permission], [data-theme-option], [data-theme-toggle], [data-toggle], [data-setting-toggle], [data-settings-save], [data-modal], [data-edit-address], [data-delete-address], [data-default-address], [data-delete-card], [data-default-card], [data-logout], [data-mark-read], [data-resend-otp], [data-close-modal], [data-close-modal-backdrop], [data-confirm-cancel], [data-confirm-delete-address], [data-confirm-delete-card], [data-icon-category], [data-copy-icon], [data-copy-value], [data-share], [data-amount], [data-refresh], [data-bill-type], [data-search-service], [data-ai-prompt], [data-ai-feedback], [data-toast], .chip");
    if (!target) return;

    if (target.hasAttribute("data-close-modal-backdrop") && event.target !== target) return;
    event.preventDefault();

    if (target.dataset.add) return addToCart(target.dataset.add);
    if (target.dataset.fav) return toggleFavorite(target.dataset.fav);
    if (target.dataset.qty) return changeQuantity(target.dataset.id, Number(target.dataset.qty));
    if (target.dataset.cartService) return switchCart(target.dataset.cartService);
    if (target.hasAttribute("data-clear-cart")) {
      state.cart = [];
      saveState();
      render();
      return showToast("سبد خرید خالی شد");
    }
    if (target.hasAttribute("data-pay")) {
      const pendingItems = state.cart.map((entry) => ({ ...entry }));
      setBusy(target, true, "در حال ثبت سفارش...");
      try {
        const order = await api.orders.create({ service: state.activeCartService, items: pendingItems });
        state.lastOrder = pendingItems;
        state.lastOrderId = order.id;
        state.cart = [];
        saveState();
        return navigate("/payment/result/success");
      } catch (error) {
        return showToast(error.message || "ثبت سفارش انجام نشد");
      } finally {
        setBusy(target, false);
      }
    }
    if (target.dataset.permission) {
      showToast("مجوز ثبت شد");
      return navigate(target.dataset.permission === "location" ? "/permissions/notifications" : "/home");
    }
    if (target.dataset.themeOption) {
      state.theme = target.dataset.themeOption;
      saveState();
      return applyTheme(state.theme, { transition: true, announce: true });
    }
    if (target.hasAttribute("data-theme-toggle")) {
      state.theme = resolvedTheme() === "dark" ? "light" : "dark";
      saveState();
      return applyTheme(state.theme, { transition: true, announce: true });
    }
    if (target.dataset.settingToggle) return toggleSetting(target.dataset.settingToggle, target);
    if (target.hasAttribute("data-settings-save")) return showToast("تنظیمات با موفقیت ذخیره شد");
    if (target.hasAttribute("data-toggle")) {
      const toggle = target.classList.contains("switch") ? target : target.querySelector(".switch");
      if (toggle) {
        const isOn = toggle.classList.toggle("is-on");
        target.setAttribute("aria-pressed", isOn ? "true" : "false");
      }
      return;
    }
    if (target.dataset.editAddress) return openModal("edit-address", target.dataset.editAddress);
    if (target.dataset.deleteAddress) return openModal("delete-address", target.dataset.deleteAddress);
    if (target.dataset.defaultAddress) return selectAddress(target.dataset.defaultAddress);
    if (target.dataset.deleteCard) return openModal("delete-card", target.dataset.deleteCard);
    if (target.dataset.defaultCard) return setDefaultCard(target.dataset.defaultCard);
    if (target.hasAttribute("data-logout")) return logout(target);
    if (target.hasAttribute("data-resend-otp")) {
      setBusy(target, true, "در حال ارسال...");
      try {
        await api.auth.requestOtp(state.pendingPhone || "9123456789");
        showToast("کد جدید ارسال شد");
      } catch (error) {
        showToast(error.message || "ارسال دوباره کد انجام نشد");
      } finally {
        setBusy(target, false);
      }
      startOtpCountdown();
      return;
    }
    if (target.hasAttribute("data-mark-read")) {
      state.notificationsRead = true;
      saveState();
      render();
      return showToast("همه اعلان‌ها خوانده شدند");
    }
    if (target.dataset.modal) return openModal(target.dataset.modal);
    if (target.hasAttribute("data-close-modal") || target.hasAttribute("data-close-modal-backdrop")) return closeModal();
    if (target.hasAttribute("data-confirm-cancel")) {
      closeModal();
      showToast("سفارش لغو شد");
      return navigate("/orders");
    }
    if (target.dataset.confirmDeleteAddress) {
      const id = target.dataset.confirmDeleteAddress;
      closeModal();
      return deleteAddress(id);
    }
    if (target.dataset.confirmDeleteCard) {
      const id = target.dataset.confirmDeleteCard;
      closeModal();
      return deleteCard(id);
    }
    if (target.dataset.iconCategory) {
      state.iconCategory = target.dataset.iconCategory;
      document.querySelectorAll("[data-icon-category]").forEach((chip) => chip.classList.toggle("is-active", chip === target));
      return filterIconGallery();
    }
    if (target.dataset.copyIcon) {
      const name = target.dataset.copyIcon;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(name).catch(() => undefined);
      return showToast(`نام فایل کپی شد: ${name}`);
    }
    if (target.dataset.copyValue) {
      const value = target.dataset.copyValue;
      if (navigator.clipboard?.writeText) navigator.clipboard.writeText(value).catch(() => undefined);
      return showToast("کد دعوت کپی شد");
    }
    if (target.hasAttribute("data-share")) {
      const shareData = { title: "دعوت به یولدا", text: "با کد YOLDA-SARA به یولدا بیا و اعتبار هدیه بگیر." };
      if (navigator.share) navigator.share(shareData).catch(() => undefined);
      else if (navigator.clipboard?.writeText) navigator.clipboard.writeText(shareData.text).catch(() => undefined);
      return showToast("متن دعوت آماده اشتراک‌گذاری شد");
    }
    if (target.dataset.amount) {
      const input = document.getElementById("topup-amount");
      if (input) input.value = target.dataset.amount;
      document.querySelectorAll("[data-amount]").forEach((button) => button.classList.toggle("is-active", button === target));
      return;
    }
    if (target.hasAttribute("data-refresh")) return window.location.reload();
    if (target.dataset.billType) {
      document.getElementById("bill-id")?.focus();
      return showToast(`${target.dataset.billType} انتخاب شد`);
    }
    if (target.dataset.searchService) {
      state.searchService = target.dataset.searchService;
      document.querySelectorAll("[data-search-service]").forEach((chip) => chip.classList.toggle("is-active", chip === target));
      return updateSearchResults();
    }
    if (target.dataset.aiPrompt) {
      const field = document.getElementById("ai-query");
      if (field) {
        field.value = target.dataset.aiPrompt;
        field.focus();
      } else {
        await runAiFromText(target.dataset.aiPrompt);
      }
      return;
    }
    if (target.dataset.aiFeedback) {
      const id = target.dataset.id;
      const value = target.dataset.aiFeedback === "up" ? 1 : -1;
      state.aiFeedback[id] = value;
      saveState();
      target.closest(".ai-feedback")?.querySelectorAll("button").forEach((button) => button.classList.remove("is-active"));
      target.classList.add("is-active");
      return showToast(value > 0 ? "سلیقه‌ات ثبت شد" : "این گزینه کمتر پیشنهاد می‌شود");
    }
    if (target.classList.contains("chip")) {
      handleChip(target);
      if (target.dataset.toast) showToast(target.dataset.toast);
      else if (!target.dataset.filterGroup) showToast(`فیلتر «${target.textContent.trim()}» اعمال شد`);
      return;
    }
    if (target.dataset.toast) {
      showToast(target.dataset.toast);
      if (!target.hasAttribute("data-back") && !target.dataset.route) return;
    }
    if (target.hasAttribute("data-back")) {
      return navigateBack();
    }
    if (target.dataset.route) navigate(target.dataset.route);
  });

  document.addEventListener("submit", async (event) => {
    const form = event.target.closest("[data-form]");
    if (!form) return;
    event.preventDefault();
    const type = form.dataset.form;
    const submitButton = form.querySelector("button[type='submit']");

    if (type === "login") {
      const rawDigits = toEnglishDigits(new FormData(form).get("phone")).replace(/\D/g, "");
      const digits = rawDigits.replace(/^98/, "").replace(/^0/, "");
      if (!/^9\d{9}$/.test(digits)) return showToast("شماره موبایل معتبر وارد کنید");
      setBusy(submitButton, true, "در حال ارسال کد...");
      try {
        await api.auth.requestOtp(digits);
        state.pendingPhone = digits;
        saveState();
        return navigate("/auth/otp");
      } catch (error) {
        return showToast(error.message || "ارسال کد انجام نشد");
      } finally {
        setBusy(submitButton, false);
      }
    }
    if (type === "otp") {
      const code = [...form.querySelectorAll(".otp-grid input")].map((input) => toEnglishDigits(input.value)).join("");
      if (code.length !== 4) return showToast("کد چهاررقمی را کامل وارد کنید");
      setBusy(submitButton, true, "در حال تأیید...");
      try {
        await api.auth.verifyOtp(state.pendingPhone || "09123456789", code);
        return navigate("/auth/profile");
      } catch (error) {
        return showToast(error.message || "کد تأیید نشد");
      } finally {
        setBusy(submitButton, false);
      }
    }
    if (type === "profile-setup") {
      const values = Object.fromEntries(new FormData(form).entries());
      state.user.displayName = values.displayName?.toString() || "کاربر یولدا";
      state.user.email = values.email?.toString() || "";
      if (state.pendingPhone) state.user.phone = formatIranPhone(state.pendingPhone);
      state.isAuthenticated = true;
      saveState();
      return navigate("/permissions/location");
    }
    if (type === "checkout-address") {
      const addressId = new FormData(form).get("address")?.toString();
      if (addressId && state.addresses.some((item) => item.id === addressId)) state.selectedAddressId = addressId;
      saveState();
      return navigate("/checkout/time");
    }
    if (type === "checkout-time") return navigate("/payment");
    if (type === "ai") {
      const query = new FormData(form).get("query")?.toString().trim() || "";
      if (query.length < 3) return showToast("کمی بیشتر درباره چیزی که می‌خواهی بنویس");
      return runAiFromText(query);
    }
    if (type === "ai-quiz") return runAiFromForm(form);
    if (type === "ai-preferences") {
      const values = Object.fromEntries(new FormData(form).entries());
      state.aiPreferences = { ...values, learning: new FormData(form).has("learning") };
      saveState();
      showToast("سلیقه غذایی ذخیره شد");
      return navigate("/ai");
    }
    if (type === "cancel-order-page") {
      setBusy(submitButton, true, "در حال لغو...");
      try {
        await api.orders.cancel(state.lastOrderId || "YL-2458", new FormData(form).get("reason"));
        showToast("سفارش لغو شد و بازگشت وجه آغاز شد");
        return navigate("/orders");
      } catch (error) {
        return showToast(error.message || "لغو سفارش انجام نشد");
      } finally {
        setBusy(submitButton, false);
      }
    }
    if (type === "review") {
      showToast("امتیاز شما ثبت شد؛ ممنونیم");
      return navigate("/order/details");
    }
    if (type === "profile-edit") {
      const values = Object.fromEntries(new FormData(form).entries());
      state.user = {
        ...state.user,
        displayName: values.displayName?.toString() || state.user.displayName,
        email: values.email?.toString() || "",
        birthday: values.birthday?.toString() || "",
        city: values.city?.toString() || "ارومیه"
      };
      saveState();
      showToast("پروفایل به‌روزرسانی شد");
      return navigate("/profile");
    }
    if (type === "address-page") {
      const values = Object.fromEntries(new FormData(form).entries());
      const id = `address-${Date.now()}`;
      const addressParts = [values.address?.toString().trim() || ""];
      if (values.floor?.toString().trim()) addressParts.push(`طبقه ${values.floor.toString().trim()}`);
      if (values.unit?.toString().trim()) addressParts.push(`واحد ${values.unit.toString().trim()}`);
      state.addresses.push({
        id,
        title: values.title?.toString() || "آدرس جدید",
        value: addressParts.filter(Boolean).join("، "),
        recipientPhone: values.phone?.toString().trim() ? formatIranPhone(values.phone) : "",
        kind: "other"
      });
      state.selectedAddressId = id;
      saveState();
      showToast("آدرس جدید ذخیره شد");
      return navigate("/addresses");
    }
    if (type === "wallet-topup") {
      const amount = Number(toEnglishDigits(new FormData(form).get("amount")).replace(/\D/g, ""));
      if (!Number.isFinite(amount) || amount < 10000) return showToast("مبلغ افزایش موجودی باید حداقل ۱۰ هزار تومان باشد");
      state.walletBalance += amount;
      state.transactions.unshift({
        id: `tx-${Date.now()}`,
        title: "افزایش موجودی",
        subtitle: "همین حالا",
        amount,
        kind: "deposit"
      });
      saveState();
      showToast("افزایش موجودی با موفقیت ثبت شد");
      return navigate("/wallet");
    }
    if (type === "settings-language") {
      state.settings.language = new FormData(form).get("language")?.toString() || "fa";
      saveState();
      return showToast("زبان برنامه ذخیره شد");
    }
    if (type === "support-ticket") {
      setBusy(submitButton, true, "در حال ارسال...");
      try {
        await api.support.createTicket(Object.fromEntries(new FormData(form).entries()));
        showToast("درخواست پشتیبانی ثبت شد");
        return navigate("/support/tickets");
      } catch (error) {
        return showToast(error.message || "ارسال درخواست انجام نشد");
      } finally {
        setBusy(submitButton, false);
      }
    }
    if (type === "ticket-reply") {
      form.reset();
      return showToast("پاسخ ارسال شد");
    }
    if (type === "delivery") {
      showToast("درخواست پیک ثبت شد");
      return navigate("/tracking");
    }
    if (type === "bill") return showToast("قبض استعلام شد؛ مبلغ ۲۳۸٬۰۰۰ تومان");
    if (["vendor-settings", "courier-profile", "ops-settings"].includes(type)) return showToast("تغییرات ذخیره شد");
    if (type === "discount") {
      closeModal();
      return showToast("کد تخفیف آزمایشی اعمال شد");
    }
    if (type === "address") {
      const values = Object.fromEntries(new FormData(form).entries());
      const existing = state.addresses.find((item) => item.id === values.id);
      if (existing) {
        existing.title = values.title?.toString() || existing.title;
        existing.value = values.address?.toString() || existing.value;
        existing.recipientPhone = values.phone?.toString().trim() ? formatIranPhone(values.phone) : "";
      } else {
        const id = `address-${Date.now()}`;
        state.addresses.push({
          id,
          title: values.title?.toString() || "آدرس جدید",
          value: values.address?.toString() || "",
          recipientPhone: values.phone?.toString().trim() ? formatIranPhone(values.phone) : "",
          kind: "other"
        });
        state.selectedAddressId = id;
      }
      saveState();
      closeModal();
      render();
      return showToast(existing ? "آدرس ویرایش شد" : "آدرس جدید ذخیره شد");
    }
    if (type === "payment-card") {
      const values = Object.fromEntries(new FormData(form).entries());
      const cardNumber = toEnglishDigits(values.cardNumber).replace(/\D/g, "");
      if (cardNumber.length !== 16) return showToast("شماره کارت باید ۱۶ رقم باشد");
      const expiryDigits = toEnglishDigits(values.expiry).replace(/\D/g, "");
      const expiryMonth = Number(expiryDigits.slice(0, 2));
      if (expiryDigits.length !== 4 || expiryMonth < 1 || expiryMonth > 12) return showToast("تاریخ انقضا را به‌صورت ماه/سال وارد کنید");
      if (state.paymentMethods.some((item) => item.last4 === cardNumber.slice(-4))) return showToast("این کارت قبلاً ذخیره شده است");
      const id = `card-${Date.now()}`;
      state.paymentMethods.push({
        id,
        bank: values.bank?.toString().trim() || "کارت بانکی",
        last4: cardNumber.slice(-4),
        expiry: `${expiryDigits.slice(0, 2)}/${expiryDigits.slice(2)}`,
        isDefault: state.paymentMethods.length === 0
      });
      saveState();
      closeModal();
      render();
      return showToast("کارت بانکی ذخیره شد");
    }
  }, true);

  document.addEventListener("change", (event) => {
    if (event.target.matches(".select-card input[type='radio']")) {
      const group = event.target.name;
      const scope = event.target.closest("form") || document;
      scope.querySelectorAll(`.select-card input[name="${group}"]`).forEach((input) => input.closest(".select-card")?.classList.toggle("is-selected", input.checked));
    }
    if (event.target.id === "prescription-file" && event.target.files?.length) {
      showToast(`فایل «${event.target.files[0].name}» انتخاب شد`);
    }
  });

  document.addEventListener("keydown", (event) => {
    const dialog = modalRoot.querySelector("[role='dialog']");
    if (event.key === "Escape" && dialog) {
      event.preventDefault();
      closeModal();
      return;
    }
    if (event.key === "Tab" && dialog) {
      const controls = [...dialog.querySelectorAll("button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [href], [tabindex]:not([tabindex='-1'])")]
        .filter((element) => !element.hidden && element.offsetParent !== null);
      if (controls.length) {
        const first = controls[0];
        const last = controls[controls.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      }
    }
    if ((event.key === "Enter" || event.key === " ") && event.target.matches("[data-route][tabindex]")) {
      event.preventDefault();
      navigate(event.target.dataset.route);
    }
  });

  window.addEventListener("hashchange", () => {
    const path = currentPath();
    if (!routeNavigationAction) {
      const knownIndex = routeTrail.lastIndexOf(path);
      if (knownIndex >= 0) routeTrail.splice(knownIndex + 1);
      else routeTrail.push(path);
    }
    routeNavigationAction = "";
    renderWithLoader();
  });
  window.addEventListener("offline", () => showToast("اتصال اینترنت قطع شد؛ داده‌های ذخیره‌شده در دسترس‌اند"));
  window.addEventListener("online", () => showToast("اتصال اینترنت دوباره برقرار شد"));
  themeMedia.addEventListener?.("change", () => {
    if (state.theme === "system") applyTheme("system", { transition: true });
  });

  if ("serviceWorker" in navigator && window.location.protocol.startsWith("http")) {
    window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js").catch(() => undefined));
  }

  configureLoaderVideo(pageLoader, config.assets?.pageLoader);
  configureLoaderVideo(aiLoader, config.assets?.aiLoader);
  configureBrandMetadata();
  if (!window.location.hash) window.location.hash = "/home";
  else renderWithLoader();
})();
