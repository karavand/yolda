(function () {
  "use strict";

  window.createYoldaPages = function createYoldaPages(context) {
    const { data, state, icon, money, number, isFavorite, recommender, cartTotal, cartCount } = context;

    const escapeHtml = (value) => String(value ?? "").replace(/[&<>"']/g, (character) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#039;"
    })[character]);
    const toFaDigits = (value) => String(value ?? "").replace(/\d/g, (digit) => "۰۱۲۳۴۵۶۷۸۹"[Number(digit)]);
    const page = (content, options = {}) => ({ content, ...options });
    const image = (name, alt = "") => {
      const source = String(name || "").includes("/") ? String(name) : icon(name);
      return `<img src="${escapeHtml(source)}" alt="${escapeHtml(alt)}" loading="lazy" decoding="async">`;
    };

    const serviceNames = {
      food: "غذا و رستوران",
      grocery: "سوپرمارکت",
      pharmacy: "داروخانه"
    };

    const transactionAmount = (amount) => `${amount >= 0 ? "+" : "−"} ${money(Math.abs(amount))}`;
    const transactionClass = (amount) => amount >= 0 ? "success" : "danger";

    const serviceHero = {
      food: {
        title: "۳۰٪ تخفیف اولین سفارش!",
        body: "بهترین رستوران‌های ارومیه، سریع و تازه در یولدا.",
        icon: "yld-food-pizza.webp",
        badge: "ویژه کاربران جدید"
      },
      grocery: {
        title: "خرید روزانه، بدون معطلی",
        body: "کالای تازه و ضروری را از نزدیک‌ترین فروشگاه بگیر.",
        icon: "yld-brand-service-grocery.webp",
        badge: "ارسال رایگان بالای ۵۰۰ هزار تومان"
      },
      pharmacy: {
        title: "سلامت، نزدیک‌تر از همیشه",
        body: "نسخه‌ات را بفرست یا محصولات سلامت را پیدا کن.",
        icon: "yld-discover-pharmacy.webp",
        badge: "بررسی نسخه توسط داروساز"
      }
    };

    function searchBox(placeholder, route = "/search") {
      return `
        <button type="button" class="search-box" data-route="${route}" aria-label="${escapeHtml(placeholder)}">
          ${image("yld-discover-vendor-search.webp")}
          <span class="search-placeholder">${escapeHtml(placeholder)}</span>
        </button>
      `;
    }

    function categoryStrip(type) {
      return `
        <div class="category-scroll" aria-label="دسته‌بندی‌ها">
          ${(data.categories[type] || []).map((item) => `
            <button class="category-item" data-route="${item.route || `/category/${type}/${item.id}`}">
              <span class="image-well">${image(item.icon)}</span>
              <span>${item.title}</span>
            </button>
          `).join("")}
        </div>
      `;
    }

    function vendorCard(vendor, service) {
      return `
        <article class="vendor-card" data-route="/vendor/${service}" tabindex="0">
          <button class="floating-fav ${isFavorite(`vendor-${vendor.id}`) ? "is-active" : ""}" data-fav="vendor-${vendor.id}" aria-label="افزودن ${vendor.name} به علاقه‌مندی‌ها">
            ${image("yld-ui-favorites.webp")}
          </button>
          <div class="image-well">${image(vendor.icon, vendor.name)}</div>
          <div class="vendor-body">
            <span class="badge danger">${vendor.discount}</span>
            <h3>${vendor.name}</h3>
            <p class="muted small">${vendor.subtitle}</p>
            <div class="vendor-meta">
              <span class="rating">★ ${number(vendor.rating)}</span>
              <span>${vendor.time}</span>
            </div>
          </div>
        </article>
      `;
    }

    function productRow(product) {
      return `
        <article class="product-row" data-product-id="${product.id}" data-route="/product/${product.id}" tabindex="0">
          <div class="image-well">${image(product.icon, product.name)}</div>
          <div>
            <span class="badge yellow">${product.tag}</span>
            <h3>${product.name}</h3>
            <p>${product.description}</p>
            <strong class="price">${money(product.price)}</strong>
          </div>
          <button class="add-button" data-add="${product.id}" aria-label="افزودن ${product.name}">+</button>
        </article>
      `;
    }

    function productCard(product) {
      return `
        <article class="product-card" data-route="/product/${product.id}" tabindex="0">
          <button class="floating-fav ${isFavorite(product.id) ? "is-active" : ""}" data-fav="${product.id}" aria-label="علاقه‌مندی">
            ${image("yld-ui-favorites.webp")}
          </button>
          <div class="image-well product-card-image">${image(product.icon, product.name)}</div>
          <div class="product-body">
            <span class="badge yellow">${product.tag}</span>
            <h3>${product.name}</h3>
            <div class="product-meta">
              <strong class="price">${money(product.price)}</strong>
              <button class="add-button" data-add="${product.id}" aria-label="افزودن ${product.name}">+</button>
            </div>
          </div>
        </article>
      `;
    }

    function login() {
      return page(`
        <main class="auth-layout" id="page-content">
          <div class="auth-art">${image("yld-auth-phone-entry.webp", "ورود با شماره موبایل")}</div>
          <form class="auth-panel" data-form="login">
            <p class="eyebrow">حساب یولدا</p>
            <h1>خوش آمدید!</h1>
            <p>برای ورود، شماره موبایل خود را وارد کنید.</p>
            <div class="field">
              <label for="phone">شماره موبایل</label>
              <div class="phone-field">
                <span>+98</span>
                <input id="phone" name="phone" inputmode="numeric" autocomplete="tel" maxlength="11" placeholder="912 345 6789" required>
              </div>
            </div>
            <button class="btn btn-primary btn-block" type="submit">دریافت کد ورود</button>
            <p class="form-note">با ثبت‌نام در یولدا، قوانین شرایط استفاده و حریم خصوصی را می‌پذیرید.</p>
            <button class="btn btn-ghost btn-block" type="button" data-route="/home">ورود به نسخه نمایشی</button>
          </form>
        </main>
      `, { header: false, bottom: false });
    }

    function otp() {
      const phone = state.pendingPhone ? `+۹۸ ${toFaDigits(state.pendingPhone)}` : "۰۹۱۲ ۳۴۵ ۶۷۸۹";
      return page(`
        <main class="auth-layout" id="page-content">
          <div class="auth-art">${image("yld-auth-otp-entry.webp", "تأیید کد یکبارمصرف")}</div>
          <form class="auth-panel" data-form="otp">
            <p class="eyebrow">مرحله دوم</p>
            <h1>تأیید کد یکبارمصرف</h1>
            <p>کد ارسال‌شده به شماره <b dir="ltr">${escapeHtml(phone)}</b> را وارد کنید.</p>
            <div class="otp-grid" role="group" aria-label="کد چهار رقمی">
              <input inputmode="numeric" autocomplete="one-time-code" maxlength="1" aria-label="رقم اول" required>
              <input inputmode="numeric" maxlength="1" aria-label="رقم دوم" required>
              <input inputmode="numeric" maxlength="1" aria-label="رقم سوم" required>
              <input inputmode="numeric" maxlength="1" aria-label="رقم چهارم" required>
            </div>
            <button class="btn btn-ghost btn-block otp-resend" type="button" data-resend-otp disabled>ارسال مجدد تا <b data-otp-countdown aria-live="polite">۰۰:۴۵</b></button>
            <button class="btn btn-primary btn-block" type="submit">تأیید و ورود</button>
            <button class="btn btn-ghost btn-block" type="button" data-route="/auth/login">تغییر شماره موبایل</button>
          </form>
        </main>
      `, { header: false, bottom: false });
    }

    function profileSetup() {
      return page(`
        <main class="auth-layout" id="page-content">
          <div class="auth-panel">
            <div class="avatar-picker">${image("yld-profile-avatar-add.webp", "افزودن تصویر پروفایل")}</div>
            <div class="text-center">
              <p class="eyebrow">آخرین مرحله</p>
              <h1>تکمیل پروفایل اولیه</h1>
              <p>اطلاعات پایه را وارد کنید؛ بعداً قابل ویرایش است.</p>
            </div>
            <form data-form="profile-setup">
              <div class="field">
                <label for="display-name">نام نمایشی</label>
                <input id="display-name" name="displayName" placeholder="نام شما" required>
              </div>
              <div class="field">
                <label for="email">ایمیل (اختیاری)</label>
                <input id="email" name="email" type="email" placeholder="name@example.com" dir="ltr">
              </div>
              <button class="btn btn-primary btn-block" type="submit">ذخیره و ادامه</button>
            </form>
          </div>
        </main>
      `, { header: false, bottom: false });
    }

    function permission(kind) {
      const isLocation = kind === "location";
      const config = isLocation ? {
        icon: "yld-auth-location-allowed.webp",
        title: "اجازه موقعیت و محدوده خدمت",
        badge: "محدوده خدمت در ارومیه",
        text: "برای نمایش فروشگاه‌های نزدیک، برآورد زمان تحویل و انتخاب پیک مناسب به موقعیت شما نیاز داریم.",
        primary: "اجازه دسترسی به موقعیت",
        secondary: "انتخاب دستی آدرس"
      } : {
        icon: "yld-auth-permission-notification.webp",
        title: "مجوز اعلان‌ها",
        badge: "از وضعیت سفارشت باخبر بمان",
        text: "پذیرش سفارش، حرکت پیک و رسیدن سفارش را به‌موقع اطلاع می‌دهیم.",
        primary: "فعال کردن اعلان‌ها",
        secondary: "بعداً تصمیم می‌گیرم"
      };

      return page(`
        <main class="permission-layout" id="page-content">
          <section class="permission-card">
            ${image(config.icon, config.title)}
            <h1>${config.title}</h1>
            <span class="badge">${config.badge}</span>
            <p>${config.text}</p>
            <div class="permission-actions">
              <button class="btn btn-primary btn-block" data-permission="${kind}">${config.primary}</button>
              <button class="btn btn-secondary btn-block" data-route="${isLocation ? "/addresses" : "/home"}">${config.secondary}</button>
            </div>
          </section>
        </main>
      `, { header: false, bottom: false });
    }

    function home() {
      const today = new Intl.DateTimeFormat("fa-IR", { weekday: "long", day: "numeric", month: "long" }).format(new Date());
      const firstName = escapeHtml((state.user?.displayName || "کاربر یولدا").split(" ")[0]);
      const activeCartProduct = data.products.find((product) => product.id === state.cart[0]?.id) || data.products[0];
      const activeCartLabel = serviceNames[state.activeCartService] || "خرید یولدا";
      const nearbyPopular = Object.entries(data.vendors).flatMap(([serviceType, vendors]) => vendors.map((vendorItem) => ({ ...vendorItem, serviceType }))).slice(0, 7);
      const quickGroceries = data.products.filter((product) => product.service === "grocery").slice(0, 8);
      const serviceMeta = {
        grocery: "ارسال سریع",
        food: "منتخب شهر",
        pharmacy: "نسخه آنلاین",
        courier: "پیک فوری",
        wallet: "پرداخت آسان",
        bills: "به‌زودی",
        reservation: "انتخاب تعاملی میز",
        more: "همه خدمات"
      };
      return page(`
        <main class="page-content home-page" id="page-content" data-cms-page="home">
          <section class="home-intro" aria-labelledby="home-title" data-cms-block="intro">
            <div class="home-greeting">
              <p class="eyebrow" data-cms-field="eyebrow">${today} · ارومیه</p>
              <h1 id="home-title" data-cms-field="title">سلام ${firstName}، امروز چه کاری برات انجام بدیم؟</h1>
              <p data-cms-field="body">از خرید روزانه تا یک غذای خوب؛ سریع‌ترین مسیر را برایت آماده کرده‌ایم.</p>
            </div>
            <div class="home-context-row" aria-label="وضعیت سرویس">
              <button type="button" class="home-context-pill" data-route="/nearby">${image("yld-map-locate-me.webp")}<span><strong>اطراف من</strong><small>۲۳ فروشنده فعال</small></span></button>
              <button type="button" class="home-context-pill" data-route="/offers">${image("yld-discover-discounted.webp")}<span><strong>پیشنهاد امروز</strong><small>تا ۳۰٪ تخفیف</small></span></button>
            </div>
          </section>

          <div class="home-search-row" data-cms-block="search">
            ${searchBox("جست‌وجوی غذا، کالا، داروخانه یا سرویس...").replace("class=\"search-box\"", "class=\"search-box\" data-cms-field=\"placeholder\" data-cms-attr=\"aria-label\"").replace("class=\"search-placeholder\"", "class=\"search-placeholder\" data-cms-field=\"placeholder\"")}
          </div>

          <section class="cms-render-block" data-cms-block="services">
          <div class="section-head home-section-head home-services-heading"><div><p class="eyebrow" data-cms-field="eyebrow">همه‌چیز در یک جا</p><h2 data-cms-field="title">سرویس‌های یولدا</h2></div><a data-route="/services" data-cms-field="cta">مشاهده همه</a></div>
          <section class="home-service-grid" aria-label="سرویس‌های یولدا">
            ${data.services.map((service) => `
              <button type="button" class="home-service-card home-service-${service.id} ${service.soon ? "coming-soon" : ""} ${service.id === "reservation" ? "is-featured" : ""}" ${service.soon ? "disabled aria-disabled=\"true\"" : `data-route="${service.route}"`}>
                <span class="home-service-icon" style="--service-color:${service.color}">${image(service.icon, service.title)}</span>
                <span class="home-service-copy"><strong>${service.title}</strong><small>${serviceMeta[service.id]}</small></span>
                ${service.soon ? `<span class="home-service-badge">به‌زودی</span>` : `<span class="home-service-arrow" aria-hidden="true">←</span>`}
              </button>
            `).join("")}
          </section>
          </section>

          <section class="home-top-grid" data-cms-block="smart-ai">
            <article class="home-ai-hero" aria-labelledby="home-ai-title">
              <div class="home-ai-copy">
                <span class="hero-badge" data-cms-field="badge">پیشنهاد هوشمند یولدا ✨</span>
                <h2 id="home-ai-title" data-cms-field="title">انتخاب سخت را بسپار به یولدا</h2>
                <p data-cms-field="body">بودجه، زمان و سلیقه‌ات را می‌فهمیم و بهترین گزینه‌های موجود همین اطراف را پیدا می‌کنیم.</p>
                <div class="home-ai-actions"><button type="button" class="btn btn-yellow" data-route="/ai" data-cms-field="cta">شروع پیشنهاد هوشمند</button><button type="button" class="home-ai-secondary" data-route="/ai/quiz">تنظیم دقیق سلیقه ←</button></div>
              </div>
              <div class="home-ai-visual" aria-hidden="true"><span class="home-ai-orbit orbit-one">AI</span><span class="home-ai-orbit orbit-two">★ ۴٫۹</span>${image("yld-food-pizza.webp")}</div>
            </article>
            ${cartCount() ? `
              <aside class="home-resume-card">
                <div class="home-resume-head"><span class="home-resume-icon">${image("yld-ui-cart.webp")}</span><span class="badge success">در انتظار شما</span></div>
                <p class="eyebrow">ادامه خرید</p>
                <h2>${activeCartLabel}</h2>
                <p>${number(cartCount())} کالا در سبدت آماده ثبت سفارش است.</p>
                <div class="home-resume-product"><span class="image-well">${image(activeCartProduct.icon, activeCartProduct.name)}</span><span><strong>${escapeHtml(activeCartProduct.name)}</strong><small>${money(cartTotal())}</small></span></div>
                <button type="button" class="btn btn-primary btn-block" data-route="/cart">مشاهده سبد و ادامه</button>
              </aside>
            ` : `
              <aside class="home-resume-card is-empty">
                <span class="home-resume-icon">${image("yld-discover-recently-viewed.webp")}</span><p class="eyebrow">شروع سریع</p><h2>دوباره سفارش بده</h2><p>انتخاب‌های قبلی‌ات را بدون جست‌وجوی دوباره ببین.</p><button type="button" class="btn btn-primary btn-block" data-route="/orders">سفارش‌های قبلی</button>
              </aside>
            `}
          </section>

          <section class="home-confidence" aria-label="مزیت‌های یولدا" data-cms-block="confidence">
            <div>${image("yld-discover-express-delivery.webp")}<span><strong>تحویل سریع</strong><small>میانگین ۲۸ دقیقه</small></span></div>
            <div>${image("yld-discover-verified.webp")}<span><strong>فروشنده معتبر</strong><small>کیفیت بررسی‌شده</small></span></div>
            <div>${image("yld-profile-about.webp")}<span><strong>پشتیبانی محلی</strong><small>همراه تا تحویل</small></span></div>
          </section>

          <section class="home-promo-grid" data-cms-block="promotions">
            <button type="button" class="home-promo-card is-delivery" data-route="/delivery"><span class="badge yellow">پیک فوری</span><strong>بسته‌ات را سریع بفرست</strong><small>دریافت از مبدأ در حدود ۱۰ دقیقه</small>${image("yld-brand-service-courier.webp")}</button>
            <button type="button" class="home-promo-card is-wallet" data-route="/wallet"><span class="badge success">پرداخت راحت</span><strong>کیف پول یولدا</strong><small>موجودی، بازگشت وجه و تراکنش‌ها</small>${image("yld-profile-transactions.webp")}</button>
          </section>

          <section class="cms-render-block" data-cms-block="nearby">
          <div class="section-head home-section-head"><div><p class="eyebrow" data-cms-field="eyebrow">نزدیک و خوش‌امتیاز</p><h2 data-cms-field="title">محبوب‌های اطراف شما</h2></div><div class="section-head-actions"><button class="text-link" data-route="/nearby">همه محبوب‌ها</button><button class="text-link" data-route="/food">رستوران‌ها</button></div></div>
          <section class="vendor-grid home-vendor-grid horizontal-carousel auto-carousel" data-auto-carousel="3000" aria-label="محبوب‌های اطراف شما">
            ${nearbyPopular.map((vendor) => vendorCard(vendor, vendor.serviceType)).join("")}
          </section>
          </section>

          <section class="cms-render-block" data-cms-block="quick-shop">
          <div class="section-head home-section-head"><div><p class="eyebrow" data-cms-field="eyebrow">تازه و روزمره</p><h2 data-cms-field="title">خرید سریع سوپرمارکتی</h2></div><a data-route="/grocery" data-cms-field="cta">مشاهده بیشتر</a></div>
          <section class="product-list home-product-list two-row-scroller" aria-label="خرید سریع سوپرمارکتی">
            ${quickGroceries.map(productRow).join("")}
          </section>
          </section>
        </main>
      `, { title: "خانه", bottom: true });
    }

    function service(type) {
      const hero = serviceHero[type];
      const vendors = data.vendors[type] || [];
      const products = data.products.filter((item) => item.service === type);
      return page(`
        <main class="page-content" id="page-content" data-cms-page="${type}">
          <div class="page-title-row" data-cms-block="intro">
            <div><p class="eyebrow" data-cms-field="eyebrow">یولدا ${serviceNames[type]}</p><h1 data-cms-field="title">امروز چی لازم داری؟</h1></div>
            <button class="icon-button" data-route="/favorites" aria-label="علاقه‌مندی‌ها">${image("yld-ui-favorites.webp")}</button>
          </div>
          <div class="service-search-full" data-cms-block="search">${searchBox(`جست‌وجو در ${serviceNames[type]}...`).replace("class=\"search-box\"", "class=\"search-box\" data-cms-field=\"placeholder\" data-cms-attr=\"aria-label\"").replace("class=\"search-placeholder\"", "class=\"search-placeholder\" data-cms-field=\"placeholder\"")}</div>
          <section class="hero-card" data-cms-block="hero">
            <div class="hero-content">
              <span class="hero-badge" data-cms-field="badge">${hero.badge}</span>
              <h2 data-cms-field="title">${hero.title}</h2>
              <p data-cms-field="body">${hero.body}</p>
              <button class="btn btn-yellow btn-sm" data-route="${type === "pharmacy" ? "/prescription" : `/vendor/${type}`}" data-cms-field="cta">${type === "pharmacy" ? "ارسال نسخه" : "سفارش بده"}</button>
            </div>
            <img class="hero-image" src="${icon(hero.icon)}" alt="${serviceNames[type]}">
          </section>

          <section class="cms-render-block" data-cms-block="categories">
          <div class="section-head"><h2 data-cms-field="title">دسته‌بندی‌ها</h2></div>
          ${categoryStrip(type)}
          <div class="chip-row" style="margin-top:1rem">
            <button class="chip is-active">همه</button>
            <button class="chip" data-toast="فیلتر نزدیک‌ترین فعال شد">نزدیک‌ترین</button>
            <button class="chip" data-toast="فیلتر ارسال سریع فعال شد">ارسال سریع</button>
            <button class="chip" data-toast="فیلتر تخفیف‌دار فعال شد">تخفیف‌دار</button>
          </div>
          </section>

          <section class="cms-render-block" data-cms-block="vendors">
          <div class="section-head"><h2 data-cms-field="title">${type === "food" ? "رستوران‌های محبوب" : type === "grocery" ? "فروشگاه‌های نزدیک" : "داروخانه‌های فعال"}</h2><a data-route="/stores/${type}" data-cms-field="cta">مشاهده همه</a></div>
          <section class="vendor-grid horizontal-carousel service-vendor-carousel">
            ${vendors.map((vendor) => vendorCard(vendor, type)).join("")}
          </section>
          </section>

          <section class="cms-render-block" data-cms-block="offers">
          <div class="section-head"><h2 data-cms-field="title">پیشنهادهای ویژه</h2></div>
          <section class="product-list two-row-scroller service-offers-scroller">
            ${products.map(productRow).join("")}
          </section>
          </section>
        </main>
      `, { title: serviceNames[type], bottom: true, cartBar: state.cart.length > 0 });
    }

    function allStores(type) {
      const vendors = data.vendors[type] || [];
      if (!serviceNames[type]) return notFound();
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">${serviceNames[type]}</p><h1>همه فروشگاه‌ها</h1></div><span class="badge success">${number(vendors.length)} فروشگاه فعال</span></div>
          <div class="service-search-full">${searchBox(`جست‌وجو بین فروشگاه‌های ${serviceNames[type]}...`)}</div>
          <div class="chip-row store-directory-filters"><button class="chip is-active">همه</button><button class="chip" data-toast="بر اساس نزدیک‌ترین مرتب شد">نزدیک‌ترین</button><button class="chip" data-toast="فروشگاه‌های باز نمایش داده شدند">باز الآن</button><button class="chip" data-toast="بر اساس امتیاز مرتب شد">بالاترین امتیاز</button></div>
          <section class="vendor-grid store-directory-grid">${vendors.map((vendorItem) => vendorCard(vendorItem, type)).join("")}</section>
        </main>
      `, { title: "همه فروشگاه‌ها", bottom: true });
    }

    function vendor(type) {
      const vendor = (data.vendors[type] || [])[0];
      const products = data.products.filter((item) => item.service === type);
      if (!vendor) return notFound();
      return page(`
        <main id="page-content">
          <section class="vendor-cover">
            <div class="mobile-header is-transparent">
              <button type="button" class="header-icon" data-back aria-label="بازگشت">${image("yld-ui-chevron-previous.webp")}</button>
              <div class="header-actions">
                <button class="header-icon" data-toast="لینک فروشگاه کپی شد" aria-label="اشتراک">${image("yld-ui-copy.webp")}</button>
                <button class="header-icon" data-fav="vendor-${vendor.id}" aria-label="ذخیره">${image("yld-ui-favorites.webp")}</button>
              </div>
            </div>
            ${image(vendor.icon, vendor.name)}
            <div class="vendor-cover-content">
              <span class="badge yellow">★ ${number(vendor.rating)}</span>
              <h1>${vendor.name}</h1>
              <div class="vendor-tags">
                <span>${vendor.subtitle}</span><span>حداقل سفارش ۵۰ هزار تومان</span><span>ارسال رایگان</span>
              </div>
            </div>
          </section>
          <div class="page-content">
            <section class="card" style="padding:1rem">
              <div class="section-head" style="margin-top:0"><h2>دسته‌بندی‌ها</h2></div>
              <div class="chip-row"><button class="chip is-active">همه</button><button class="chip">پرفروش</button><button class="chip">جدید</button><button class="chip">پیشنهاد یولدا</button></div>
            </section>
            <div class="section-head"><h2>پرطرفدارها</h2><span class="muted small">${number(products.length)} آیتم</span></div>
            <section class="product-grid">${products.slice(0, 2).map(productCard).join("")}</section>
            <div class="section-head"><h2>منو و محصولات</h2><span class="muted small">${number(products.length)} آیتم</span></div>
            <section class="product-list">${products.map(productRow).join("")}</section>
          </div>
        </main>
      `, { header: false, bottom: false, cartBar: state.cart.length > 0 });
    }

    function product(id) {
      const item = data.products.find((productItem) => productItem.id === id);
      if (!item) return notFound();
      return page(`
        <main class="page-content" id="page-content">
          <section class="card product-detail-card">
            <div class="image-well product-detail-visual">${image(item.icon, item.name)}</div>
            <div class="product-detail-body">
              <div class="page-title-row">
                <div><span class="badge yellow">${item.tag}</span><h1>${item.name}</h1></div>
                <button type="button" class="icon-button ${isFavorite(item.id) ? "is-active" : ""}" data-fav="${item.id}" aria-label="افزودن ${escapeHtml(item.name)} به علاقه‌مندی‌ها">${image("yld-ui-favorites.webp")}</button>
              </div>
              <p class="muted">${item.description}</p>
              <div class="summary-row"><strong class="price">${money(item.price)}</strong><span class="badge success">موجود</span></div>
              <div class="field"><label for="product-note">توضیحات برای فروشنده</label><textarea id="product-note" rows="3" placeholder="مثلاً سس جدا باشد"></textarea></div>
              <button type="button" class="btn btn-primary btn-block" data-add="${item.id}">افزودن به سبد خرید</button>
            </div>
          </section>
        </main>
      `, { title: item.name, bottom: false, cartBar: state.cart.length > 0 });
    }

    function search() {
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">جست‌وجوی سراسری</p><h1>چی می‌خوای پیدا کنی؟</h1></div></div>
          <div class="search-box">
            ${image("yld-discover-vendor-search.webp")}
            <input id="global-search" aria-label="جست‌وجوی یولدا" placeholder="نام غذا، محصول یا فروشگاه..." autofocus>
          </div>
          <div class="chip-row">
            <button class="chip is-active" data-search-service="all">همه</button>
            <button class="chip" data-search-service="food">غذا</button>
            <button class="chip" data-search-service="grocery">سوپرمارکت</button>
            <button class="chip" data-search-service="pharmacy">داروخانه</button>
          </div>
          <div class="section-head"><h2>نتایج</h2><span id="search-count" class="muted small">${number(data.products.length)} مورد</span></div>
          <section class="product-list" id="search-results">${data.products.map(productRow).join("")}</section>
        </main>
      `, { title: "جست‌وجو", bottom: true });
    }

    function aiFlowContext(stage) {
      const contexts = {
        1: {
          badge: "انتخاب شخصی",
          title: "یولدا از نیاز تو شروع می‌کند",
          text: "درخواستت را ساده بنویس؛ پیشنهادها فقط از گزینه‌های موجود ساخته می‌شوند.",
          icon: "yld-discover-recommended.webp",
          tags: ["کمتر از یک دقیقه", "نتیجه شفاف"]
        },
        2: {
          badge: "تنظیم هوشمند",
          title: "هر انتخاب، نتیجه را دقیق‌تر می‌کند",
          text: "پاسخ‌ها فقط برای همین پیشنهاد استفاده می‌شوند و هر زمان بخواهی قابل تغییرند.",
          icon: "yld-ui-settings.webp",
          tags: ["انتخاب آیکونی", "پاسخ قابل ویرایش"]
        },
        3: {
          badge: "آماده برای مقایسه",
          title: "بهترین گزینه‌های موجود برای تو",
          text: "رتبه‌بندی بر اساس بودجه، زمان، سلیقه و بازخوردهای واقعی انجام شده است.",
          icon: "yld-ui-check.webp",
          tags: ["توضیح‌پذیر", "بدون گزینه ساختگی"]
        }
      };
      const context = contexts[stage] || contexts[1];
      return `<section class="ai-context-banner ai-context-stage-${stage}" aria-label="${escapeHtml(context.title)}"><div class="ai-context-icon">${image(context.icon, "")}</div><div class="ai-context-copy"><span class="eyebrow">${context.badge}</span><strong>${context.title}</strong><p>${context.text}</p></div><div class="ai-context-tags">${context.tags.map((tag) => `<span>${tag}</span>`).join("")}</div></section>`;
    }

    function aiConstraintChips(profile) {
      const cuisineLabels = { iranian: "ایرانی", azerbaijani: "محلی ارومیه", italian: "ایتالیایی", fastfood: "فست‌فود" };
      const dietaryLabels = { vegetarian: "گیاهی", "high-protein": "پروتئین بالا", "low-calorie": "کم‌کالری" };
      const mealLabels = { breakfast: "صبحانه", lunch: "ناهار", snack: "میان‌وعده", dinner: "شام" };
      const serviceLabels = { food: "غذا و رستوران", grocery: "سوپرمارکت", pharmacy: "داروخانه" };
      const chips = [];
      if (profile?.service && serviceLabels[profile.service]) chips.push(serviceLabels[profile.service]);
      if (profile?.budget) chips.push(`تا ${money(profile.budget)}`);
      if (profile?.maxDelivery) chips.push(`حداکثر ${number(profile.maxDelivery)} دقیقه`);
      if (profile?.cuisine && cuisineLabels[profile.cuisine]) chips.push(cuisineLabels[profile.cuisine]);
      (profile?.dietary || []).forEach((item) => { if (dietaryLabels[item]) chips.push(dietaryLabels[item]); });
      if ((profile?.service || "food") === "food" && profile?.mealTime && mealLabels[profile.mealTime]) chips.push(mealLabels[profile.mealTime]);
      (profile?.exclusions || []).forEach((item) => chips.push(`بدون ${escapeHtml(item)}`));
      return (chips.length ? chips : ["کیفیت بالا", "موجود در ارومیه"]).map((label) => `<span class="ai-constraint-chip">${label}</span>`).join("");
    }

    function ai() {
      const preferenceCount = [state.aiPreferences?.cuisine, state.aiPreferences?.dietary, state.aiPreferences?.budget, state.aiPreferences?.allergy].filter(Boolean).length;
      const crossServicePrompts = [
        { service: "food", text: "یه غذای سریع و اقتصادی می‌خوام" },
        { service: "grocery", text: "خرید روزانه اقتصادی و سریع می‌خوام" },
        { service: "pharmacy", text: "محصول مراقبت روزانه تا ۵۰۰ هزار تومان" }
      ];
      const quickStarts = [
        ["سریع و اقتصادی", "غذای سریع و اقتصادی", "yld-discover-express-delivery.webp", "food"],
        ["سبک و سالم", "یک غذای سالم و سبک پیشنهاد کن", "yld-food-healthy.webp", "food"],
        ["خرید روزانه", "خرید روزانه اقتصادی و سریع", "yld-brand-service-grocery.webp", "grocery"],
        ["مراقبت روزانه", "محصول مراقبت روزانه", "yld-discover-pharmacy.webp", "pharmacy"]
      ];
      return page(`
        <main class="page-content" id="page-content" data-cms-page="ai">
          <div class="cms-render-block" data-cms-block="context">${aiFlowContext(1)}</div>
          <section class="ai-hero" data-cms-block="hero">
            <div class="ai-hero-copy">
              <span class="hero-badge" data-cms-field="badge">Yolda AI · جریان تازه</span>
              <h1 data-cms-field="title">برای همین لحظه، انتخاب مناسب پیدا کن.</h1>
              <p data-cms-field="body">نیازت را طبیعی بنویس؛ بودجه، زمان، سلیقه و محدودیت غذایی را از متن می‌فهمم و نتیجه را شفاف توضیح می‌دهم.</p>
            </div>
            <div class="ai-orbit">${image("yld-discover-recommended.webp", "هوش پیشنهاددهنده یولدا")}</div>
          </section>
          <form class="ai-composer card" data-form="ai" data-cms-block="composer">
            <div class="ai-composer-head"><label for="ai-query" data-cms-field="title">چه چیزی برایت مهم‌تر است؟</label><span class="badge">مرحله ۱ از ۳</span></div>
            <fieldset class="ai-service-picker"><legend>در کدام سرویس جست‌وجو کنم؟</legend><div>
              <label><input type="radio" name="service" value="food" checked><span>${image("yld-discover-restaurant.webp")}<b>غذا</b></span></label>
              <label><input type="radio" name="service" value="grocery"><span>${image("yld-brand-service-grocery.webp")}<b>سوپرمارکت</b></span></label>
              <label><input type="radio" name="service" value="pharmacy"><span>${image("yld-discover-pharmacy.webp")}<b>داروخانه</b></span></label>
            </div></fieldset>
            <textarea id="ai-query" name="query" rows="3" aria-label="توضیح درخواست برای پیشنهاد هوشمند" placeholder="مثلاً غذای سالم تا ۳۰۰ هزار تومان، بدون قارچ و زیر ۳۰ دقیقه..." required>${escapeHtml(state.aiDraft?.query || "")}</textarea>
            <div class="ai-hint-row" aria-label="نمونه درخواست‌ها">${crossServicePrompts.map(({ service, text }) => `<button type="button" data-ai-prompt="${escapeHtml(text)}" data-ai-service="${service}">${escapeHtml(text)}</button>`).join("")}</div>
            <div class="ai-composer-actions">
              <span class="muted small">${preferenceCount ? `${number(preferenceCount)} ترجیح ذخیره‌شده هم اعمال می‌شود` : "پاسخ بر اساس فروشگاه‌های فعال ارومیه"}</span>
              <button class="btn btn-yellow" type="submit" data-cms-field="cta">ادامه به مرحله تنظیم ←</button>
            </div>
          </form>
          <section class="cms-render-block" data-cms-block="quick-start">
          <div class="section-head"><div><p class="eyebrow" data-cms-field="eyebrow">شروع سریع</p><h2 data-cms-field="title">یا یکی از این درخواست‌ها را انتخاب کن</h2></div><a data-route="/ai/quiz">تنظیم دقیق‌تر</a></div>
          <div class="prompt-grid ai-quick-starts">${quickStarts.map(([label, prompt, promptIcon, serviceType]) => `<button class="prompt-card" data-ai-prompt="${escapeHtml(prompt)}" data-ai-service="${serviceType}">${image(promptIcon)}<span><strong>${label}</strong><small>${escapeHtml(prompt)}</small></span><b>←</b></button>`).join("")}</div>
          </section>
          <section class="ai-actions-grid" data-cms-block="actions">
            <button class="card ai-action-card" data-route="/ai/quiz">${image("yld-ui-filter.webp")}<span><strong>تنظیم مرحله‌به‌مرحله</strong><small>برای نتیجه دقیق‌تر به چند سؤال کوتاه پاسخ بده</small></span><b>←</b></button>
            <button class="card ai-action-card" data-route="/ai/history">${image("yld-discover-recently-viewed.webp")}<span><strong>پیشنهادهای قبلی</strong><small>${number(state.aiHistory.length)} جست‌وجوی ذخیره‌شده روی این دستگاه</small></span><b>←</b></button>
            <button class="card ai-action-card" data-route="/ai/preferences">${image("yld-ui-settings.webp")}<span><strong>سلیقه و حساسیت‌ها</strong><small>${preferenceCount ? `${number(preferenceCount)} ترجیح فعال` : "ترجیحات ثابت را یک‌بار تنظیم کن"}</small></span><b>←</b></button>
          </section>
          <section class="ai-transparency card" data-cms-block="transparency"><div>${image("yld-ui-info.webp")}<div><strong data-cms-field="title">چرا این پیشنهادها قابل اعتمادند؟</strong><p data-cms-field="body">امتیاز هر گزینه از شباهت معنایی، بودجه، زمان ارسال، امتیاز کاربران و تنوع انتخاب ساخته می‌شود؛ هیچ قیمت یا کالای ناموجودی ساخته نمی‌شود.</p></div></div></section>
        </main>
      `, { title: "یولدا AI", bottom: true });
    }

    function aiQuiz(step = 1) {
      const safeStep = Math.min(5, Math.max(1, Number(step) || 1));
      const draft = state.aiDraft || {};
      const saved = state.aiQuizSelections || {};
      const selections = {
        service: saved.service || draft.service || "food",
        mood: saved.mood || "comfort",
        goal: saved.goal || "fast",
        cuisine: saved.cuisine || "iranian",
        budget: saved.budget ?? "400000",
        maxDelivery: saved.maxDelivery ?? "35",
        dietary: saved.dietary || "none",
        spicy: saved.spicy || "any",
        mealTime: saved.mealTime || "",
        exclusions: Array.isArray(saved.exclusions) ? saved.exclusions.join("، ") : (saved.exclusions || "")
      };
      const iconChoice = (name, value, label, asset) => `<label class="choice-card choice-card-icon" title="${escapeHtml(label)}"><input type="radio" name="${escapeHtml(name)}" value="${escapeHtml(value)}" aria-label="${escapeHtml(label)}" data-ai-step-choice="${safeStep}" ${selections[name] === value ? "checked" : ""}><span data-choice-label="${escapeHtml(label)}">${image(asset)}</span></label>`;
      const questions = {
        1: {
          key: "service",
          eyebrow: "شروع انتخاب",
          title: "از کدام سرویس پیشنهاد می‌خواهی؟",
          hint: "یک آیکون را انتخاب کن؛ خودکار به سؤال بعد می‌روی.",
          choices: [["food", "غذا و رستوران", "yld-discover-restaurant.webp"], ["grocery", "سوپرمارکت", "yld-brand-service-grocery.webp"], ["pharmacy", "داروخانه", "yld-discover-pharmacy.webp"]]
        },
        2: {
          key: "mood",
          eyebrow: "حال‌وهوای سفارش",
          title: "الان چه حال‌وهوایی داری؟",
          hint: "نزدیک‌ترین حس را انتخاب کن.",
          choices: [["comfort", "آرام و خانگی", "yld-map-address-home.webp"], ["exciting", "تند و هیجان‌انگیز", "yld-food-fried-chicken.webp"], ["traditional", "سنتی و محلی", "yld-food-azerbaijani.webp"], ["social", "دونفره یا جمعی", "yld-discover-reservation-available.webp"]]
        },
        3: {
          key: "goal",
          eyebrow: "اولویت این سفارش",
          title: "مهم‌ترین اولویتت چیست؟",
          hint: "هوش یولدا نتایج را بر همین اساس مرتب می‌کند.",
          choices: [["fast", "ارسال سریع", "yld-discover-express-delivery.webp"], ["healthy", "سالم و سبک", "yld-food-healthy.webp"], ["filling", "سیرکننده", "yld-food-burger.webp"], ["popular", "محبوب کاربران", "yld-discover-popular.webp"]]
        },
        4: {
          key: "cuisine",
          eyebrow: "طعم مورد علاقه",
          title: "کدام سبک غذایی را ترجیح می‌دهی؟",
          hint: "بعداً هم می‌توانی این انتخاب را تغییر بدهی.",
          choices: [["iranian", "ایرانی", "yld-discover-restaurant.webp"], ["azerbaijani", "محلی ارومیه", "yld-food-azerbaijani.webp"], ["italian", "ایتالیایی", "yld-food-italian.webp"], ["fastfood", "فست‌فود", "yld-food-burger.webp"]]
        }
      };
      const progress = `<section class="ai-wizard-progress" aria-label="سؤال ${number(safeStep)} از ۵"><div><span>سؤال ${number(safeStep)} از ۵</span><strong>${number(safeStep * 20)}٪</strong></div><div class="progress"><span style="width:${safeStep * 20}%"></span></div></section>`;
      const draftSummary = draft.query ? `<section class="ai-draft-summary card">${image("yld-discover-recommended.webp")}<div><span class="muted small">درخواست مرحله اول</span><strong>${escapeHtml(draft.query)}</strong></div><button type="button" class="text-link" data-route="/ai">ویرایش</button></section>` : "";
      const previousRoute = safeStep === 1 ? "/ai" : safeStep === 2 ? "/ai/quiz" : `/ai/quiz/${safeStep - 1}`;

      if (safeStep < 5) {
        const question = questions[safeStep];
        return page(`
          <main class="page-content ai-wizard-page" id="page-content">
            ${aiFlowContext(2)}
            ${progress}
            <div class="page-title-row ai-wizard-title"><div><p class="eyebrow">${question.eyebrow}</p><h1>${question.title}</h1><p class="muted small">${question.hint}</p></div><span class="badge">مرحله‌به‌مرحله</span></div>
            ${draftSummary}
            <form class="ai-quiz ai-quiz-wizard" data-ai-quiz-step="${safeStep}">
              <fieldset class="card quiz-step ai-wizard-question"><legend class="sr-only">${question.title}</legend><div class="choice-grid">${question.choices.map(([value, label, asset]) => iconChoice(question.key, value, label, asset)).join("")}</div></fieldset>
              <div class="ai-wizard-nav"><button type="button" class="btn btn-ghost" data-route="${previousRoute}">← مرحله قبل</button><span class="muted small">با انتخاب آیکون، مرحله بعد باز می‌شود</span></div>
            </form>
          </main>
        `, { title: `پرسش ${number(safeStep)} از ۵`, bottom: true });
      }

      const selected = (key, value) => selections[key] === value ? "selected" : "";
      return page(`
        <main class="page-content ai-wizard-page" id="page-content">
          ${aiFlowContext(2)}
          ${progress}
          <div class="page-title-row ai-wizard-title"><div><p class="eyebrow">آخرین مرحله</p><h1>جزئیات نهایی را تنظیم کن</h1><p class="muted small">این موارد اختیاری‌اند؛ بعد از تأیید، پیشنهادهای شخصی تو ساخته می‌شوند.</p></div><span class="badge success">تقریباً تمام شد</span></div>
          ${draftSummary}
          <form class="ai-quiz ai-quiz-wizard" data-form="ai-quiz" data-ai-quiz-step="5">
            <section class="card quiz-step ai-wizard-details"><div class="quiz-step-heading"><span>۵</span><div><strong>محدودیت‌ها و جزئیات</strong><small>هر فیلد را می‌توانی بدون تغییر رها کنی.</small></div></div><div class="form-grid"><div class="field"><label for="ai-budget">حداکثر بودجه</label><select id="ai-budget" name="budget"><option value="250000" ${selected("budget", "250000")}>۲۵۰ هزار تومان</option><option value="400000" ${selected("budget", "400000")}>۴۰۰ هزار تومان</option><option value="600000" ${selected("budget", "600000")}>۶۰۰ هزار تومان</option><option value="" ${selected("budget", "")}>بدون محدودیت</option></select></div><div class="field"><label for="ai-time">حداکثر زمان ارسال</label><select id="ai-time" name="maxDelivery"><option value="25" ${selected("maxDelivery", "25")}>۲۵ دقیقه</option><option value="35" ${selected("maxDelivery", "35")}>۳۵ دقیقه</option><option value="50" ${selected("maxDelivery", "50")}>۵۰ دقیقه</option><option value="" ${selected("maxDelivery", "")}>مهم نیست</option></select></div><div class="field"><label for="ai-diet">رژیم غذایی</label><select id="ai-diet" name="dietary"><option value="none" ${selected("dietary", "none")}>بدون محدودیت</option><option value="vegetarian" ${selected("dietary", "vegetarian")}>گیاهی</option><option value="high-protein" ${selected("dietary", "high-protein")}>پروتئین بالا</option><option value="low-calorie" ${selected("dietary", "low-calorie")}>کم‌کالری</option></select></div><div class="field"><label for="ai-spicy">میزان تندی</label><select id="ai-spicy" name="spicy"><option value="any" ${selected("spicy", "any")}>مهم نیست</option><option value="low" ${selected("spicy", "low")}>بدون تندی</option><option value="high" ${selected("spicy", "high")}>تند</option></select></div><div class="field"><label for="ai-meal-time">وعده</label><select id="ai-meal-time" name="mealTime"><option value="" ${selected("mealTime", "")}>بر اساس ساعت فعلی</option><option value="breakfast" ${selected("mealTime", "breakfast")}>صبحانه</option><option value="lunch" ${selected("mealTime", "lunch")}>ناهار</option><option value="snack" ${selected("mealTime", "snack")}>میان‌وعده</option><option value="dinner" ${selected("mealTime", "dinner")}>شام</option></select></div><div class="field"><label for="ai-exclusions">مواد نامطلوب</label><input id="ai-exclusions" name="exclusions" value="${escapeHtml(selections.exclusions)}" placeholder="مثلاً قارچ، لبنیات"></div></div></section>
            <div class="ai-submit-bar"><button type="button" class="btn btn-ghost ai-wizard-back" data-route="/ai/quiz/4">← مرحله قبل</button><span><strong>آماده ساخت پیشنهاد</strong><small>فقط گزینه‌های موجود بررسی می‌شوند.</small></span><button class="btn btn-yellow" type="submit">دیدن پیشنهادهای من ✨</button></div>
          </form>
        </main>
      `, { title: "مرحله نهایی پیشنهاد هوشمند", bottom: true });
    }

    function aiResultCard(result, index) {
      const item = result.product;
      return `<article class="ai-result-card card ${index === 0 ? "is-top-pick" : ""}">${index === 0 ? `<span class="ai-top-pick">بهترین تطابق</span>` : ""}<div class="ai-result-rank">${number(index + 1)}</div><div class="image-well">${image(item.icon, item.name)}</div><div class="ai-result-body"><div class="summary-row"><div><span class="badge success">${number(result.score)}٪ تطابق</span><h3>${item.name}</h3></div><strong class="price">${money(item.price)}</strong></div><p class="muted small">${item.description}</p><ul class="reason-list">${result.reasons.map((reason) => `<li>✓ ${reason}</li>`).join("")}</ul><div class="ai-result-footer"><span class="muted small">${number(item.deliveryMinutes)} دقیقه · ★ ${number(item.rating)}</span><div class="ai-feedback" aria-label="بازخورد پیشنهاد"><button data-ai-feedback="up" data-id="${item.id}" aria-label="پیشنهاد خوب بود">👍</button><button data-ai-feedback="down" data-id="${item.id}" aria-label="پیشنهاد مناسب نبود">👎</button></div><button class="btn btn-primary btn-sm" data-add="${item.id}">افزودن به سبد</button></div></div></article>`;
    }

    function aiResults() {
      const fallbackProfile = recommender.parseNaturalLanguage("یه غذای محبوب و سریع می‌خوام");
      const result = state.aiResult || recommender.recommend(data.products, fallbackProfile, { service: "food", limit: 6, feedback: state.aiFeedback });
      const profile = result.profile || fallbackProfile;
      const latestQuery = state.aiHistory[0]?.query;
      return page(`
        <main class="page-content" id="page-content">
          ${aiFlowContext(3)}
          <section class="ai-result-summary"><div><p class="eyebrow">تحلیل سلیقه تکمیل شد</p><h1>پیشنهادهای مخصوص تو</h1><p>${result.summary}</p>${latestQuery ? `<small class="ai-result-query">درخواست: «${escapeHtml(latestQuery)}»</small>` : ""}</div><div class="confidence-ring"><strong>${number(result.confidence)}٪</strong><span>اطمینان</span></div></section>
          <section class="ai-constraint-panel"><div><strong>فیلترهای فعال</strong><div class="ai-constraint-list">${aiConstraintChips(profile)}</div></div><div class="ai-result-actions"><button class="btn btn-secondary btn-sm" data-route="/ai/quiz">اصلاح جزئیات</button><button class="btn btn-ghost btn-sm" data-route="/ai">درخواست جدید</button></div></section>
          <section class="ai-refine-bar" aria-label="اصلاح سریع پیشنهادها"><div><strong>نتیجه را بهتر کن</strong><small>بدون شروع دوباره، اولویت را تغییر بده.</small></div><div><button type="button" data-ai-refine="cheaper">اقتصادی‌تر</button><button type="button" data-ai-refine="faster">سریع‌تر</button><button type="button" data-ai-refine="healthier">سالم‌تر</button><button type="button" data-ai-refine="popular">محبوب‌تر</button></div></section>
          <div class="ai-result-toolbar"><span class="badge success">${number(result.results.length)} گزینه موجود</span><span class="badge">رتبه‌بندی توضیح‌پذیر</span><span class="badge">محدوده ارومیه</span></div>
          <section class="ai-results-list">${result.results.length ? result.results.map(aiResultCard).join("") : `<div class="empty-state">${image("yld-discover-vendor-search.webp")}<h2>گزینه دقیقی پیدا نشد</h2><p>یکی از محدودیت‌ها را بازتر کن یا یک درخواست تازه بنویس.</p><div class="action-grid"><button class="btn btn-primary" data-route="/ai/quiz">ویرایش فیلترها</button><button class="btn btn-secondary" data-route="/ai">درخواست جدید</button></div></div>`}</section>
          <section class="ai-transparency card"><div>${image("yld-ui-info.webp")}<div><strong>این رتبه‌بندی چطور ساخته شد؟</strong><p>مدل محلی یولدا شباهت برداری سلیقه تو را با ویژگی‌های واقعی منو ترکیب و سپس نتایج تکراری را با الگوریتم تنوع‌ساز حذف می‌کند.</p></div></div></section>
        </main>
      `, { title: "نتایج هوشمند", bottom: true, cartBar: state.cart.length > 0 });
    }

    function aiHistory() {
      return page(`
        <main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow">حافظه روی همین دستگاه</p><h1>پیشنهادهای قبلی</h1></div><span class="badge">${number(state.aiHistory.length)} جست‌وجو</span></div>${state.aiHistory.length ? `<section class="card menu-list">${state.aiHistory.map((entry) => `<button class="menu-item" data-ai-prompt="${escapeHtml(entry.query)}" data-ai-service="${escapeHtml(entry.service || "food")}">${image("yld-discover-recently-viewed.webp")}<span class="menu-item-content"><strong>${escapeHtml(entry.query)}</strong><span>${number(entry.productIds.length)} پیشنهاد · اطمینان ${number(entry.confidence)}٪</span></span><span class="chevron">‹</span></button>`).join("")}</section>` : `<section class="empty-state">${image("yld-discover-recently-viewed.webp")}<h2>هنوز پیشنهادی نساختی</h2><p>اولین درخواستت را به یولدا AI بگو.</p><button class="btn btn-primary" data-route="/ai">شروع پیشنهاد</button></section>`}</main>
      `, { title: "تاریخچه پیشنهادها", bottom: true });
    }

    function aiPreferences() {
      const preferences = state.aiPreferences || {};
      return page(`
        <main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow">کنترل کامل با توست</p><h1>سلیقه غذایی من</h1></div></div><form class="card form-card" data-form="ai-preferences"><div class="form-grid"><div class="field"><label for="favorite-cuisine">سبک غذایی محبوب</label><select id="favorite-cuisine" name="cuisine"><option value="">بدون ترجیح ثابت</option><option value="iranian" ${preferences.cuisine === "iranian" ? "selected" : ""}>ایرانی</option><option value="azerbaijani" ${preferences.cuisine === "azerbaijani" ? "selected" : ""}>محلی ارومیه</option><option value="italian" ${preferences.cuisine === "italian" ? "selected" : ""}>ایتالیایی</option><option value="fastfood" ${preferences.cuisine === "fastfood" ? "selected" : ""}>فست‌فود</option></select></div><div class="field"><label for="default-dietary">رژیم غذایی</label><select id="default-dietary" name="dietary"><option value="">بدون محدودیت</option><option value="vegetarian" ${preferences.dietary === "vegetarian" ? "selected" : ""}>گیاهی</option><option value="high-protein" ${preferences.dietary === "high-protein" ? "selected" : ""}>پروتئین بالا</option><option value="low-calorie" ${preferences.dietary === "low-calorie" ? "selected" : ""}>کم‌کالری</option></select></div><div class="field"><label for="allergy">حساسیت یا ماده نامطلوب</label><input id="allergy" name="allergy" value="${escapeHtml(preferences.allergy || "")}" placeholder="مثلاً قارچ یا لبنیات"></div><div class="field"><label for="default-budget">بودجه معمول هر سفارش</label><select id="default-budget" name="budget"><option value="300000" ${preferences.budget === "300000" ? "selected" : ""}>تا ۳۰۰ هزار تومان</option><option value="500000" ${!preferences.budget || preferences.budget === "500000" ? "selected" : ""}>تا ۵۰۰ هزار تومان</option><option value="" ${preferences.budget === "" ? "selected" : ""}>بدون محدودیت</option></select></div></div><label class="select-card"><input type="checkbox" name="learning" value="on" ${preferences.learning === false ? "" : "checked"}><img src="${icon("yld-ui-info.webp")}" alt=""><span><strong>یادگیری از بازخوردها</strong><br><span class="muted small">پسندیدن یا رد کردن پیشنهادها روی رتبه‌بندی بعدی اثر بگذارد.</span></span></label><button class="btn btn-primary btn-block" style="margin-top:1rem" type="submit">ذخیره سلیقه</button></form></main>
      `, { title: "سلیقه غذایی", bottom: true });
    }

    function favorites() {
      const favorites = data.products.filter((item) => state.favorites.includes(item.id));
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><h1>علاقه‌مندی‌ها</h1><span class="badge">${number(favorites.length)} مورد</span></div>
          ${favorites.length ? `<section class="product-list">${favorites.map(productRow).join("")}</section>` : `
            <section class="empty-state">${image("yld-ui-favorites.webp", "علاقه‌مندی‌ها")}<h2>هنوز چیزی ذخیره نکردی</h2><p>محصول‌ها و فروشگاه‌های موردعلاقه‌ات اینجا می‌مانند.</p><button class="btn btn-primary" data-route="/home">شروع جست‌وجو</button></section>
          `}
        </main>
      `, { title: "علاقه‌مندی‌ها", bottom: true });
    }

    function cart() {
      const items = state.cart.map((entry) => ({ ...entry, product: data.products.find((item) => item.id === entry.id) })).filter((entry) => entry.product);
      const subtotal = items.reduce((sum, entry) => sum + entry.product.price * entry.qty, 0);
      const cartTabs = [
        ["food", "غذا", "yld-discover-restaurant.webp"],
        ["grocery", "سوپرمارکت", "yld-brand-service-grocery.webp"],
        ["pharmacy", "داروخانه", "yld-discover-pharmacy.webp"]
      ];
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><h1>سبد خرید</h1>${items.length ? `<button class="btn btn-ghost" data-clear-cart>حذف همه</button>` : ""}</div>
          <nav class="cart-tabs" aria-label="سبدهای جداگانه سرویس‌ها">
            ${cartTabs.map(([service, label, tabIcon]) => {
              const count = state.carts[service].reduce((sum, entry) => sum + entry.qty, 0);
              return `<button class="cart-tab ${state.activeCartService === service ? "is-active" : ""}" data-cart-service="${service}">${image(tabIcon)}<span>${label}</span>${count ? `<b>${number(count)}</b>` : ""}</button>`;
            }).join("")}
          </nav>
          ${items.length ? `
            <section class="cart-checkout-grid">
              <section class="card cart-products-card">
                ${items.map(({ product: item, qty }) => `
                  <div class="cart-item">
                    <div class="image-well">${image(item.icon, item.name)}</div>
                    <div><strong>${item.name}</strong><div class="price small">${money(item.price)}</div></div>
                    <div class="quantity"><button data-qty="-1" data-id="${item.id}" aria-label="کم‌کردن ${item.name}">−</button><b>${number(qty)}</b><button data-qty="1" data-id="${item.id}" aria-label="افزودن ${item.name}">+</button></div>
                  </div>
                `).join("")}
              </section>
              <aside class="card cart-overview-card">
                <div class="cart-overview-head">${image("yld-pay-cart-filled.webp", "سبد آماده ثبت سفارش")}<div><span class="badge success">آماده ادامه</span><strong>${number(items.length)} انتخاب در این سبد</strong></div></div>
                <div class="summary-row"><span>جمع کالاها</span><span>${money(subtotal)}</span></div>
                <div class="summary-row"><span>هزینه ارسال</span><span class="price">رایگان</span></div>
                <div class="summary-row total"><span>مبلغ قابل پرداخت</span><span>${money(subtotal)}</span></div>
                <button class="btn btn-primary btn-block" data-route="/checkout">ادامه فرایند خرید</button>
                <small class="cart-safe-note">قیمت و موجودی تا پایان پرداخت برایت نگه داشته می‌شود.</small>
              </aside>
            </section>
          ` : `
            <section class="empty-state">${image("f7a944f4-3c73-4cf4-9afe-a9269806a251.webp", "سبد خالی")}<h2>این سبد هنوز خالی است</h2><p>هر سرویس سبد و تسویه‌حساب مستقل خودش را دارد.</p><button class="btn btn-primary" data-route="/${state.activeCartService}">انتخاب محصول</button></section>
          `}
        </main>
      `, { title: "سبد خرید", bottom: true });
    }

    function payment() {
      const total = context.cartTotal();
      const defaultCard = state.paymentMethods.find((item) => item.isDefault) || state.paymentMethods[0];
      return page(`
        <main class="page-content payment-page" id="page-content">
          <div class="checkout-steps"><span class="is-done">✓ آدرس</span><span class="is-done">✓ زمان</span><span class="is-active">۳. پرداخت</span></div>
          <section class="flow-status-hero payment-flow-hero">
            <div><p class="eyebrow">مرحله آخر خرید</p><h1>پرداخت امن و سریع</h1><p>روش پرداختت را انتخاب کن؛ رسید سفارش بلافاصله در یولدا ذخیره می‌شود.</p><span class="flow-secure-pill">✓ اتصال رمزنگاری‌شده</span></div>
            ${image("yld-pay-bank-card.webp", "پرداخت امن با کارت بانکی")}
          </section>
          <section class="payment-layout">
            <div><div class="section-head compact-section-head"><h2>روش پرداخت</h2><strong class="price">${money(total)}</strong></div><div class="option-list payment-options">
              <label class="select-card is-selected"><input type="radio" name="payment" checked><img src="${icon("yld-profile-transactions.webp")}" alt=""><span><strong>کیف پول یولدا</strong><br><span class="muted small">موجودی: ${money(state.walletBalance)}</span></span><span class="badge success">پیشنهادی</span></label>
              ${defaultCard ? `<label class="select-card"><input type="radio" name="payment"><img src="${icon("yld-profile-saved-cards.webp")}" alt=""><span><strong>کارت بانکی ذخیره‌شده</strong><br><span class="muted small" dir="ltr">${escapeHtml(defaultCard.bank)} · **** ${escapeHtml(defaultCard.last4)}</span></span></label>` : ""}
              <label class="select-card"><input type="radio" name="payment"><img src="${icon("yld-auth-secure-login.webp")}" alt=""><span><strong>درگاه پرداخت آنلاین</strong><br><span class="muted small">پرداخت امن با تمام کارت‌های بانکی</span></span></label>
            </div></div>
            <aside class="card payment-summary-card">
              <div class="payment-summary-title">${image("yld-pay-coupon-apply.webp")}<div><strong>خلاصه پرداخت</strong><small>همه هزینه‌ها شفاف محاسبه شده‌اند</small></div></div>
              <div class="summary-row"><span>جمع سفارش</span><span>${money(total)}</span></div>
              <div class="summary-row"><span>ارسال سریع</span><span class="price">رایگان</span></div>
              <div class="summary-row"><span>کد تخفیف</span><button class="btn btn-secondary btn-sm" data-modal="discount">افزودن کد</button></div>
              <div class="summary-row total"><span>مبلغ نهایی</span><span>${money(total)}</span></div>
              <button class="btn btn-primary btn-block" data-pay>پرداخت و ثبت سفارش</button>
              <p class="form-note">تا ۵ دقیقه پس از ثبت سفارش امکان لغو دارید.</p>
            </aside>
          </section>
        </main>
      `, { title: "پرداخت", bottom: false });
    }

    function success() {
      return page(`
        <main class="page-content" id="page-content">
          <section class="success-hero order-success-hero">
            ${image("yld-order-finding-courier.webp", "در حال یافتن پیک برای سفارش")}
            <span class="badge success">پرداخت موفق</span>
            <h1>سفارشت ثبت شد!</h1>
            <p>رستوران سفارش را دریافت کرده و یولدا در حال هماهنگی سریع‌ترین پیک نزدیک است.</p>
            <button class="btn btn-primary btn-block" data-route="/tracking">پیگیری زنده سفارش</button>
            <button class="btn btn-secondary btn-block" data-route="/home">بازگشت به خانه</button>
          </section>
        </main>
      `, { title: "ثبت سفارش", bottom: false });
    }

    function orders() {
      const orderData = [
        { name: "پیتزا رومانو", status: "در حال آماده‌سازی", filter: "active", statusClass: "yellow", price: 749000, icon: "yld-food-pizza.webp", stateIcon: "yld-order-finding-courier.webp", route: "/tracking" },
        { name: "سوپرمارکت رفاه", status: "تحویل داده شده", filter: "completed", statusClass: "success", price: 1280000, icon: "yld-brand-service-grocery.webp", stateIcon: "yld-order-delivered.webp", route: "/order/details" },
        { name: "داروخانه دکتر یزدان", status: "لغو شده", filter: "cancelled", statusClass: "danger", price: 520000, icon: "yld-discover-pharmacy.webp", stateIcon: "yld-order-cancel.webp", route: "/order/details" }
      ];
      return page(`
        <main class="page-content orders-page" id="page-content">
          <section class="flow-status-hero orders-overview-hero"><div><p class="eyebrow">همه‌چیز تحت کنترل</p><h1>سفارش‌های من</h1><p>وضعیت سفارش فعال را زنده ببین و سفارش‌های قبلی را دوباره تکرار کن.</p><div class="order-overview-stats"><span><strong>۱</strong> فعال</span><span><strong>۱۲</strong> تکمیل‌شده</span><span><strong>۴٫۸</strong> میانگین امتیاز</span></div></div>${image("yld-order-history.webp", "تاریخچه سفارش‌های یولدا")}</section>
          <div class="chip-row" style="margin-bottom:1rem" aria-label="فیلتر سفارش‌ها"><button type="button" class="chip is-active" data-filter-group="orders" data-filter-value="all" aria-pressed="true">همه</button><button type="button" class="chip" data-filter-group="orders" data-filter-value="active" aria-pressed="false">فعال</button><button type="button" class="chip" data-filter-group="orders" data-filter-value="completed" aria-pressed="false">تکمیل‌شده</button><button type="button" class="chip" data-filter-group="orders" data-filter-value="cancelled" aria-pressed="false">لغوشده</button></div>
          <section class="orders-grid">${orderData.map((order) => `
            <article class="card order-card" data-filter-item="orders" data-filter-tags="${order.filter}">
              <div class="order-state-art">${image(order.stateIcon, order.status)}<span class="badge ${order.statusClass}">${order.status}</span></div>
              <div class="order-card-body"><div class="order-head"><div class="order-vendor"><span class="image-well">${image(order.icon)}</span><div><strong>${order.name}</strong><div class="muted small">۲۹ شهریور · ۲ آیتم</div></div></div></div>
              <div class="summary-row"><strong class="price">${money(order.price)}</strong><button class="btn btn-secondary btn-sm" data-route="${order.route}">جزئیات سفارش</button></div></div>
            </article>
          `).join("")}</section>
        </main>
      `, { title: "سفارش‌ها", bottom: true });
    }

    function tracking() {
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">سفارش #YL-2458</p><h1>پیک در مسیر شماست</h1></div><span class="badge success">حدود ۱۲ دقیقه</span></div>
          <section class="tracking-status-banner"><div><span class="badge yellow">مرحله ۳ از ۴</span><h2>سفارش تحویل پیک شد</h2><p>علی سفارشت را سالم تحویل گرفته و از مسیر پیشنهادی یولدا به سمت شما می‌آید.</p></div>${image("yld-order-picked-up.webp", "سفارش تحویل پیک شد")}</section>
          <section class="tracking-map" aria-label="نقشه نمایشی مسیر سفارش">
            <div class="map-marker start">${image("yld-discover-restaurant.webp")}</div>
            <div class="map-marker courier">${image("yld-map-marker-courier.webp")}</div>
          </section>
          <section class="card" style="padding:1rem;margin-top:1rem">
            <div class="order-head"><div class="order-vendor"><span class="profile-avatar" style="width:3.4rem;height:3.4rem">${image("yld-brand-service-courier.webp")}</span><div><strong>علی رضایی</strong><div class="muted small">پیک یولدا · موتور سفید</div></div></div><button class="btn btn-secondary btn-sm" data-toast="تماس آزمایشی با پیک">تماس</button></div>
            <div class="progress"><span style="width:76%"></span></div>
            <div class="timeline">
              <div class="timeline-item is-done"><span class="timeline-dot"></span><h3>سفارش پذیرفته شد</h3><p class="muted small">۱۸:۱۰</p></div>
              <div class="timeline-item is-done"><span class="timeline-dot"></span><h3>آماده‌سازی کامل شد</h3><p class="muted small">۱۸:۲۶</p></div>
              <div class="timeline-item is-current"><span class="timeline-dot"></span><h3>پیک در مسیر شماست</h3><p class="muted small">۱۸:۳۴</p></div>
              <div class="timeline-item"><span class="timeline-dot"></span><h3>تحویل سفارش</h3><p class="muted small">پیش‌بینی ۱۸:۴۶</p></div>
            </div>
          </section>
          <button class="btn btn-danger btn-block" style="margin-top:1rem" data-route="/order/cancel">لغو سفارش در بازه ۵ دقیقه‌ای</button>
        </main>
      `, { title: "رهگیری سفارش", bottom: false });
    }

    function orderDetails() {
      return page(`
        <main class="page-content order-details-page" id="page-content">
          <section class="order-detail-hero"><div><p class="eyebrow">سفارش #YL-2319</p><h1>سفارش با موفقیت تحویل شد</h1><p>۲۷ شهریور، ساعت ۱۷:۱۰ · تحویل در ۲۸ دقیقه</p><span class="badge success">تحویل‌شده</span></div>${image("yld-order-delivered.webp", "تحویل موفق سفارش")}</section>
          <section class="card summary-card">
            <div class="summary-row"><span>فروشگاه</span><b>سوپرمارکت رفاه</b></div>
            <div class="summary-row"><span>زمان ثبت</span><span>۲۷ شهریور، ۱۶:۴۲</span></div>
            <div class="summary-row"><span>آدرس</span><span>خانه · خیابان دانشگاه</span></div>
            <div class="summary-row"><span>شیوه پرداخت</span><span>کیف پول یولدا</span></div>
            <div class="summary-row total"><span>مبلغ پرداخت‌شده</span><span>${money(1280000)}</span></div>
          </section>
          <div class="action-grid" style="margin-top:1rem"><button class="btn btn-primary" data-toast="اقلام سفارش دوباره به سبد اضافه شدند">سفارش دوباره</button><button class="btn btn-secondary" data-route="/order/review">ثبت امتیاز و نظر</button></div>
        </main>
      `, { title: "جزئیات سفارش", bottom: true });
    }

    function profile() {
      const menu = [
        ["سفارش‌های من", "آخرین وضعیت و سفارش‌های قبلی", "yld-ui-orders.webp", "/orders"],
        ["آدرس‌های من", "خانه، محل کار و آدرس‌های دیگر", "yld-map-address-home.webp", "/addresses"],
        ["روش‌های پرداخت", "کارت‌ها و پرداخت در محل", "yld-profile-saved-cards.webp", "/payments"],
        ["کیف پول یولدا", "موجودی و تراکنش‌ها", "yld-profile-transactions.webp", "/wallet"],
        ["باشگاه یولدا", "امتیازها و پاداش‌ها", "yld-brand-service-loyalty.webp", "/rewards"],
        ["دعوت دوستان", "اعتبار هدیه برای هر دو نفر", "yld-profile-invite-friends.webp", "/invite"],
        ["علاقه‌مندی‌ها", "محصول‌ها و فروشگاه‌های ذخیره‌شده", "yld-ui-favorites.webp", "/favorites"],
        ["تنظیمات", "زبان، اعلان‌ها و ظاهر", "yld-ui-settings.webp", "/settings"],
        ["پشتیبانی", "گفت‌وگو و پرسش‌های متداول", "yld-profile-about.webp", "/support"]
      ];
      return page(`
        <main class="page-content profile-page" id="page-content">
          <section class="card profile-head">
            <div class="profile-avatar">${image("yld-profile-avatar-edit.webp", "تصویر پروفایل")}</div>
            <div class="profile-identity"><span class="badge success">حساب فعال</span><h1>${escapeHtml(state.user.displayName || "سارا محمدی")}</h1><span class="muted small" dir="ltr">${escapeHtml(state.user.phone || "۰۹۱۲ ۳۴۵ ۶۷۸۹")}</span></div>
            <button type="button" class="profile-edit-button" data-route="/profile/edit">${image("yld-ui-edit.webp")}<span>ویرایش پروفایل</span></button>
          </section>
          <section class="profile-glance" aria-label="خلاصه حساب">
            <article><strong>${number(state.addresses.length)}</strong><span>آدرس ذخیره‌شده</span></article>
            <article><strong>${number(state.paymentMethods.length)}</strong><span>روش پرداخت</span></article>
            <article><strong>${number(state.favorites.length)}</strong><span>علاقه‌مندی</span></article>
          </section>
          <div class="section-head profile-section-head"><div><p class="eyebrow">دسترسی سریع</p><h2>مدیریت حساب</h2></div><span class="badge">${number(menu.length)} بخش</span></div>
          <section class="profile-action-grid">
            ${menu.map(([title, subtitle, itemIcon, route]) => `<button type="button" class="profile-action-card" data-route="${route}"><span class="profile-action-icon">${image(itemIcon)}</span><span class="profile-action-copy"><strong>${title}</strong><small>${subtitle}</small></span><span class="profile-action-arrow" aria-hidden="true">←</span></button>`).join("")}
          </section>
          <section class="profile-session-card">
            <div><strong>حساب و نشست</strong><span>اطلاعات این نسخه روی همین دستگاه نگه‌داری می‌شود.</span></div>
            <button type="button" class="profile-logout-button" data-logout><span aria-hidden="true">↪</span> خروج از حساب</button>
          </section>
        </main>
      `, { title: "پروفایل", bottom: true });
    }

    function addresses() {
      const iconForAddress = (kind) => kind === "home" ? "yld-map-address-home.webp" : kind === "work" ? "yld-map-address-work.webp" : "yld-map-address-other.webp";
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><h1>آدرس‌های من</h1></div>
          <div class="option-list">
            ${state.addresses.map((entry) => {
              const selected = entry.id === state.selectedAddressId;
              return `<article class="select-card account-address ${selected ? "is-selected" : ""}">${image(iconForAddress(entry.kind))}<span class="account-address-copy"><strong>${escapeHtml(entry.title)}</strong><span class="muted small">${escapeHtml(entry.value)}</span>${entry.recipientPhone ? `<span class="muted small account-address-phone">شماره تحویل‌گیرنده: <b dir="ltr">${escapeHtml(entry.recipientPhone)}</b></span>` : ""}</span><div class="account-row-actions">${selected ? `<span class="badge success">پیش‌فرض</span>` : `<button type="button" class="btn btn-ghost btn-sm" data-default-address="${escapeHtml(entry.id)}">انتخاب</button>`}<button type="button" class="icon-button" data-edit-address="${escapeHtml(entry.id)}" aria-label="ویرایش ${escapeHtml(entry.title)}">${image("yld-ui-edit.webp")}</button><button type="button" class="icon-button danger-icon" data-delete-address="${escapeHtml(entry.id)}" aria-label="حذف ${escapeHtml(entry.title)}">${image("yld-ui-delete.webp")}</button></div></article>`;
            }).join("")}
          </div>
          <button type="button" class="btn btn-primary btn-block" style="margin-top:1rem" data-modal="new-address">+ افزودن آدرس جدید</button>
        </main>
      `, { title: "آدرس‌ها", bottom: true });
    }

    function payments() {
      const defaultCard = state.paymentMethods.find((item) => item.isDefault) || state.paymentMethods[0];
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><h1>روش‌های پرداخت</h1></div>
          ${defaultCard ? `<section class="wallet-card"><span class="badge yellow">کارت پیش‌فرض</span><div class="wallet-balance" dir="ltr">**** **** **** ${escapeHtml(defaultCard.last4)}</div><div class="summary-row"><span>${escapeHtml(defaultCard.bank)}</span><span>انقضا: ${escapeHtml(defaultCard.expiry)}</span></div></section>` : `<section class="empty-inline card"><strong>هنوز کارتی ذخیره نشده</strong><span class="muted small">برای پرداخت سریع یک کارت اضافه کن.</span></section>`}
          <section class="card menu-list payment-list" style="margin-top:1rem">
            ${state.paymentMethods.map((card) => `<div class="menu-item payment-row">${image("yld-profile-saved-cards.webp")}<span class="menu-item-content"><strong>${escapeHtml(card.bank)}</strong><span dir="ltr">**** **** **** ${escapeHtml(card.last4)} · ${escapeHtml(card.expiry)}</span></span><div class="account-row-actions">${card.isDefault ? `<span class="badge success">پیش‌فرض</span>` : `<button type="button" class="btn btn-ghost btn-sm" data-default-card="${escapeHtml(card.id)}">پیش‌فرض</button>`}<button type="button" class="btn btn-danger btn-sm" data-delete-card="${escapeHtml(card.id)}">حذف</button></div></div>`).join("")}
            <button type="button" class="menu-item" data-setting-toggle="cashOnDelivery" aria-pressed="${state.settings.cashOnDelivery ? "true" : "false"}">${image("yld-brand-service-courier.webp")}<span class="menu-item-content"><strong>پرداخت در محل</strong><span>نقدی یا کارت‌خوان</span></span><span class="switch ${state.settings.cashOnDelivery ? "is-on" : ""}" aria-hidden="true"></span></button>
          </section>
          <button type="button" class="btn btn-secondary btn-block" style="margin-top:1rem" data-modal="new-card">+ افزودن کارت جدید</button>
        </main>
      `, { title: "پرداخت‌ها", bottom: true });
    }

    function wallet() {
      const transactions = state.transactions.slice(0, 3);
      return page(`
        <main class="page-content" id="page-content">
          <h1 class="sr-only">کیف پول یولدا</h1>
          <section class="wallet-card"><span class="badge yellow">کیف پول یولدا</span><div class="wallet-balance">${money(state.walletBalance)}</div><button type="button" class="btn btn-yellow btn-sm" data-route="/wallet/topup">افزایش موجودی</button><span class="wallet-card-mark">${image("yld-profile-wallet.webp", "کیف پول یولدا")}</span></section>
          <div class="section-head"><h2>تراکنش‌های اخیر</h2><a data-route="/transactions">همه تراکنش‌ها</a></div>
          <section class="card menu-list">${transactions.map((entry) => `<div class="menu-item">${image("yld-profile-transactions.webp")}<span class="menu-item-content"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.subtitle)}</span></span><b class="transaction-${transactionClass(entry.amount)}">${transactionAmount(entry.amount)}</b></div>`).join("")}</section>
        </main>
      `, { title: "کیف پول", bottom: true });
    }

    function notifications() {
      const items = [
        ["delivery", "پیک در مسیر شماست", "علی سفارش را تحویل گرفته و تا ۱۲ دقیقه دیگر می‌رسد.", "yld-map-courier-moving.webp", "۲ دقیقه پیش"],
        ["payment", "پرداخت موفق", "پرداخت سفارش #YL-2458 با موفقیت انجام شد.", "yld-auth-phone-verified.webp", "۱۸ دقیقه پیش"],
        ["offer", "تخفیف مخصوص شما", "تا پایان امشب روی سفارش غذا ۲۰٪ تخفیف داری.", "yld-discover-discounted.webp", "۳ ساعت پیش"]
      ];
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">مرکز پیام یولدا</p><h1>اعلان‌ها</h1></div><span class="badge ${state.notificationsRead ? "success" : "yellow"}" data-notification-status>${state.notificationsRead ? "همه دیده شده" : "۳ پیام تازه"}</span></div>
          <section class="card notification-list">${items.map(([id, title, body, itemIcon, time]) => `<button type="button" class="notification-item ${state.notificationsRead ? "is-read" : ""}" data-modal="notification" data-id="${id}"><span class="image-well">${image(itemIcon)}</span><span class="notification-copy"><span class="summary-row"><strong>${title}</strong><span class="muted small">${time}</span></span><span class="muted small">${body}</span></span><span class="chevron" aria-hidden="true">‹</span></button>`).join("")}</section>
        </main>
      `, { title: "اعلان‌ها", bottom: true });
    }

    const themeLabels = { light: "روشن", dark: "تیره", system: "خودکار" };

    function themeSelector(compact = false) {
      const selectedTheme = ["light", "dark", "system"].includes(state.theme) ? state.theme : "system";
      const options = [
        ["light", "روشن", "برای محیط‌های پرنور"],
        ["dark", "تیره", "آرام‌تر برای شب"],
        ["system", "خودکار", "هماهنگ با دستگاه"]
      ];
      return `<div class="theme-choice-grid ${compact ? "is-compact" : ""}" role="group" aria-label="انتخاب ظاهر">${options.map(([value, title, subtitle]) => `
        <button type="button" class="theme-choice ${selectedTheme === value ? "is-selected" : ""}" data-theme-option="${value}" aria-pressed="${selectedTheme === value ? "true" : "false"}">
          <span class="theme-choice-preview is-${value}" aria-hidden="true"><i></i><b></b><em></em></span>
          <span><strong>${title}</strong>${compact ? "" : `<small>${subtitle}</small>`}</span>
          <span class="theme-choice-check" aria-hidden="true">✓</span>
        </button>
      `).join("")}</div>`;
    }

    function settings() {
      const currentTheme = themeLabels[state.theme] || themeLabels.system;
      const rows = [
        ["ظاهر و پوسته", `${currentTheme} · رنگ و حالت نمایش`, "yld-profile-theme-light.webp", "/settings/appearance"],
        ["دسترس‌پذیری", "اندازه متن، کنتراست و حرکت", "yld-ui-settings.webp", "/settings/accessibility"],
        ["تنظیمات اعلان‌ها", "سفارش، پیشنهادها و پیام‌های پشتیبانی", "yld-profile-notification-settings.webp", "/settings/notifications"],
        ["زبان", state.settings.language === "fa" ? "فارسی" : "English", state.settings.language === "fa" ? "yld-profile-language-fa.webp" : "yld-profile-language-en.webp", "/settings/language"],
        ["امنیت حساب", "دستگاه‌های فعال و ورود امن", "yld-auth-secure-login.webp", "/settings/security"],
        ["درباره یولدا", "نسخه، قابلیت‌ها و اطلاعات محصول", "yld-profile-about.webp", "/about"]
      ];
      return page(`
        <main class="page-content settings-page" id="page-content">
          <section class="settings-hero">
            <div><p class="eyebrow">شخصی‌سازی یولدا</p><h1>تنظیمات</h1><p>ظاهر و رفتار برنامه را برای همین دستگاه تنظیم کن.</p><span class="settings-status"><i aria-hidden="true"></i><span data-current-theme>${currentTheme}</span></span></div>
            ${image("yld-ui-settings.webp", "تنظیمات یولدا")}
          </section>
          <section class="settings-quick-theme card"><div class="section-head"><div><p class="eyebrow">تغییر سریع</p><h2>ظاهر برنامه</h2></div><button type="button" class="text-link" data-route="/settings/appearance">جزئیات</button></div>${themeSelector(true)}</section>
          <div class="section-head settings-section-title"><h2>همه تنظیمات</h2></div>
          <section class="settings-menu-grid">${rows.map(([title, subtitle, itemIcon, route]) => `<button type="button" class="settings-menu-card" data-route="${route}"><span class="settings-menu-icon">${image(itemIcon)}</span><span class="menu-item-content"><strong>${title}</strong><span>${subtitle}</span></span><span class="chevron">‹</span></button>`).join("")}</section>
        </main>
      `, { title: "تنظیمات", bottom: true });
    }

    function appearanceSettings() {
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">تنظیمات یولدا</p><h1>ظاهر و پوسته</h1></div><span class="badge" data-current-theme>${themeLabels[state.theme] || themeLabels.system}</span></div>
          <section class="appearance-layout">
            <div class="appearance-controls">
              <section class="card appearance-picker"><div class="section-head"><div><h2>حالت نمایش</h2><p class="muted small">انتخاب شما روی همین دستگاه ذخیره می‌شود.</p></div></div>${themeSelector()}</section>
              <section class="card appearance-note"><span class="appearance-note-icon">◐</span><div><strong>حالت خودکار</strong><p>با تغییر ظاهر سیستم‌عامل، یولدا هم بدون بارگذاری مجدد بین روشن و تیره جابه‌جا می‌شود.</p></div></section>
              <button type="button" class="btn btn-secondary btn-block" data-route="/settings/accessibility">تنظیم اندازه متن و کنتراست</button>
            </div>
            <section class="theme-live-preview" aria-label="پیش‌نمایش زنده ظاهر">
              <div class="theme-preview-top"><span></span><strong>یولدا</strong><i></i></div>
              <div class="theme-preview-body"><div class="theme-preview-greeting"><span></span><div><b></b><i></i></div></div><div class="theme-preview-banner"><span></span><i></i><b></b></div><div class="theme-preview-cards"><span></span><span></span><span></span></div></div>
              <div class="theme-preview-nav"><span></span><span></span><span class="is-active"></span><span></span></div>
            </section>
          </section>
        </main>
      `, { title: "ظاهر و پوسته", bottom: true });
    }

    function accessibilitySettings() {
      const preferences = state.settings.accessibility || { reduceMotion: false, highContrast: false, largeText: false };
      const items = [
        ["largeText", "متن درشت‌تر", "خوانایی بیشتر در همه صفحه‌ها", "Aa"],
        ["highContrast", "کنتراست بیشتر", "مرزها و کنترل‌های واضح‌تر", "◐"],
        ["reduceMotion", "کاهش حرکت", "حذف حرکت‌ها و انتقال‌های غیرضروری", "◌"]
      ];
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">تجربه راحت‌تر</p><h1>دسترس‌پذیری</h1></div><span class="accessibility-mark" aria-hidden="true">Aa</span></div>
          <section class="accessibility-intro card"><div><strong>یولدا برای همه</strong><p>این گزینه‌ها بلافاصله روی کل برنامه اعمال و برای همین دستگاه ذخیره می‌شوند.</p></div><span aria-hidden="true">✓</span></section>
          <section class="card menu-list accessibility-list">${items.map(([key, title, subtitle, symbol]) => `<button type="button" class="menu-item" data-setting-toggle="accessibility.${key}" aria-pressed="${preferences[key] ? "true" : "false"}"><span class="accessibility-option-icon" aria-hidden="true">${symbol}</span><span class="menu-item-content"><strong>${title}</strong><span>${subtitle}</span></span><span class="switch ${preferences[key] ? "is-on" : ""}" aria-hidden="true"></span></button>`).join("")}</section>
          <section class="card accessibility-sample"><span class="badge">پیش‌نمایش</span><h2>سفارش روزانه، ساده و خوانا</h2><p>اندازه متن، کنتراست و حرکت را طوری تنظیم کن که استفاده از یولدا برایت راحت‌تر باشد.</p><button type="button" class="btn btn-primary btn-sm" data-route="/home">دیدن صفحه خانه</button></section>
        </main>
      `, { title: "دسترس‌پذیری", bottom: true });
    }

    function about() {
      const capabilities = [["۹۱", "صفحه و جریان"], ["۶", "سرویس شهری"], ["۲۴/۷", "دسترسی آنلاین"]];
      return page(`
        <main class="page-content" id="page-content" data-cms-page="about">
          <section class="about-hero" data-cms-block="hero"><span class="about-logo">${image("assets/brand/yolda-logo.png", "لوگوی یولدا")}</span><div><span class="badge yellow" data-cms-field="badge">نسخه وب ۳.۱.۲</span><h1 data-cms-field="title">یولدا؛ شهر در دست تو</h1><p data-cms-field="body">یک تجربه یکپارچه برای سفارش، خرید، سلامت، پرداخت و خدمات روزمره ارومیه.</p></div></section>
          <section class="about-stats" data-cms-block="stats">${capabilities.map(([value, label]) => `<article><strong>${value}</strong><span>${label}</span></article>`).join("")}</section>
          <section class="card about-story" data-cms-block="story"><p class="eyebrow" data-cms-field="eyebrow">چرا یولدا؟</p><h2 data-cms-field="title">ساخته‌شده برای زندگی شهری واقعی</h2><p data-cms-field="body">یولدا سرویس‌های محلی را در یک رابط سریع، فارسی، دسترس‌پذیر و قابل‌نصب کنار هم می‌آورد؛ با تمرکز بر شفافیت، انتخاب و پشتیبانی نزدیک.</p><div class="about-values"><span>✓ تجربه کاملاً فارسی</span><span>✓ پشتیبانی از حالت آفلاین</span><span>✓ ظاهر روشن، تیره و خودکار</span><span>✓ پیشنهاددهنده هوشمند و توضیح‌پذیر</span></div></section>
          <div class="settings-menu-grid about-links" data-cms-block="links"><button type="button" class="settings-menu-card" data-route="/support"><span class="settings-menu-icon">${image("yld-profile-about.webp")}</span><span class="menu-item-content"><strong>پشتیبانی</strong><span>پاسخ پرسش‌ها و درخواست‌ها</span></span><span class="chevron">‹</span></button></div>
        </main>
      `, { title: "درباره یولدا", bottom: true });
    }

    function support() {
      return page(`
        <main class="page-content" id="page-content" data-cms-page="support">
          <section class="hero-card" data-cms-block="hero"><div class="hero-content"><span class="hero-badge" data-cms-field="badge">پشتیبانی یولدا</span><h1 data-cms-field="title">چطور کمکت کنیم؟</h1><p data-cms-field="body">برای سفارش فعال، سریع‌تر به پشتیبان وصل می‌شوی.</p><button class="btn btn-yellow btn-sm" data-route="/support/new-ticket" data-cms-field="cta">ثبت درخواست</button></div><img class="hero-image" src="${icon("yld-profile-about.webp")}" alt="پشتیبانی"></section>
          <div class="quick-actions" data-cms-block="actions"><button class="quick-action" data-route="/support/tickets">${image("yld-ui-orders.webp")}<span>درخواست‌های من</span></button><button class="quick-action" data-toast="اتصال به گفت‌وگوی آنلاین برقرار شد">${image("yld-ui-notifications.webp")}<span>گفت‌وگوی آنلاین</span></button></div>
          <section class="cms-render-block" data-cms-block="faq"><div class="section-head"><h2 data-cms-field="title">پرسش‌های متداول</h2></div>
          <section class="card menu-list"><button class="menu-item" data-modal="faq" data-id="cancel"><span class="menu-item-content"><strong>چطور سفارش را لغو کنم؟</strong><span>قوانین بازه پنج‌دقیقه‌ای</span></span><span class="chevron">‹</span></button><button class="menu-item" data-modal="faq" data-id="refund"><span class="menu-item-content"><strong>بازگشت وجه چقدر طول می‌کشد؟</strong><span>کیف پول و پرداخت بانکی</span></span><span class="chevron">‹</span></button><button class="menu-item" data-modal="faq" data-id="zone"><span class="menu-item-content"><strong>آیا آدرس من در محدوده است؟</strong><span>محدوده فعال شهر ارومیه</span></span><span class="chevron">‹</span></button></section></section>
        </main>
      `, { title: "پشتیبانی", bottom: true });
    }

    function prescription() {
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">داروخانه یولدا</p><h1>ارسال نسخه</h1></div><span class="badge success">بررسی توسط داروساز</span></div>
          <label class="upload-zone" for="prescription-file">${image("yld-pharm-prescription-camera.webp", "بارگذاری نسخه")}<strong>تصویر نسخه را اضافه کن</strong><span class="muted small">JPG، PNG یا PDF تا ۱۰ مگابایت</span><input id="prescription-file" type="file" accept="image/*,.pdf" hidden></label>
          <section class="card summary-card" style="margin-top:1rem"><div class="summary-row"><span>۱. بارگذاری نسخه</span><span class="badge">الان</span></div><div class="summary-row"><span>۲. بررسی داروساز</span><span class="muted small">حدود ۱۵ دقیقه</span></div><div class="summary-row"><span>۳. تأیید قیمت و پرداخت</span><span class="muted small">پس از بررسی</span></div></section>
          <button class="btn btn-primary btn-block" style="margin-top:1rem" data-toast="برای ادامه یک فایل نسخه انتخاب کنید">ارسال برای بررسی</button>
        </main>
      `, { title: "ارسال نسخه", bottom: true });
    }

    function welcome() {
      return page(`
        <main class="welcome-page" id="page-content">
          <section class="welcome-copy">
            <span class="hero-badge">همه شهر، در یک اپ</span>
            <h1>یولدا؛ همراه روزمره‌ی تو در ارومیه</h1>
            <p>غذا، خرید روزانه، داروخانه، پرداخت و ارسال را از فروشنده‌های محلی، سریع و قابل‌پیگیری انجام بده.</p>
            <div class="welcome-actions"><button class="btn btn-yellow" data-route="/auth/login">ورود و ثبت‌نام</button><button class="btn btn-secondary" data-route="/home">مشاهده بدون ورود</button></div>
            <div class="trust-row"><span>✓ پرداخت امن</span><span>✓ رهگیری زنده</span><span>✓ پشتیبانی محلی</span></div>
          </section>
          <section class="welcome-visual"><div class="welcome-phone"><div class="service-grid">${data.services.slice(0, 6).map((serviceItem) => `<span class="service-card"><span class="icon-orb" style="background:${serviceItem.color}">${image(serviceItem.icon)}</span><span>${serviceItem.title}</span></span>`).join("")}</div></div>${image("yld-brand-service-courier.webp", "ارسال یولدا")}</section>
        </main>
      `, { title: "خوش آمدید", header: false, bottom: false });
    }

    function allServices() {
      const active = data.services.filter((item) => !item.soon);
      const upcoming = [
        ...data.services.filter((item) => item.soon),
        { id: "taxi", title: "تاکسی اینترنتی", icon: "yld-map-navigation.webp", color: "#e3f3ff", soon: true }
      ];
      return page(`
        <main class="page-content" id="page-content" data-cms-page="services">
          <div class="page-title-row" data-cms-block="intro"><div><p class="eyebrow" data-cms-field="eyebrow">سوپراپلیکیشن یولدا</p><h1 data-cms-field="title">همه سرویس‌ها</h1></div><span class="badge success">ارومیه</span></div>
          <section class="cms-render-block" data-cms-block="active"><div class="section-head"><h2 data-cms-field="title">فعال</h2><span class="muted small">سرویس‌های قابل استفاده</span></div>
          <section class="service-directory">${active.map((item) => `<button class="service-directory-card" data-route="${item.route}"><span class="icon-orb" style="background:${item.color}">${image(item.icon)}</span><span><strong>${item.title}</strong><small>${item.id === "food" ? "رستوران‌های نزدیک و غذای محلی" : item.id === "grocery" ? "خرید روزانه از فروشگاه‌های اطراف" : item.id === "pharmacy" ? "محصولات سلامت و ارسال نسخه" : "سرویس مالی و شهری یولدا"}</small></span><b>←</b></button>`).join("")}</section>
          </section><section class="cms-render-block" data-cms-block="upcoming"><div class="section-head"><h2 data-cms-field="title">به‌زودی</h2><span class="muted small">در نقشه راه یولدا</span></div>
          <section class="service-directory">${upcoming.map((item) => `<article class="service-directory-card is-disabled"><span class="icon-orb" style="background:${item.color}">${image(item.icon)}</span><span><strong>${item.title}</strong><small>در حال آماده‌سازی برای ارومیه</small></span><span class="badge yellow">به‌زودی</span></article>`).join("")}</section>
          </section>
        </main>
      `, { title: "سرویس‌ها", bottom: true });
    }

    function offers() {
      const deals = [...data.products].sort((a, b) => a.price - b.price).slice(0, 10).map((product, index) => {
        const tags = [index < 4 ? "discount" : "", product.service === "grocery" || ["food-2", "food-6"].includes(product.id) ? "free-delivery" : "", index % 2 === 0 ? "wallet" : ""].filter(Boolean);
        return { product, tags, discount: [30, 25, 20, 18, 15][index % 5] };
      });
      return page(`
        <main class="page-content offers-page" id="page-content" data-cms-page="offers">
          <section class="promo-strip offers-hero" data-cms-block="hero"><div><span class="badge yellow" data-cms-field="badge">پیشنهادهای امروز</span><h1 data-cms-field="title">کمتر پرداخت کن، بیشتر انتخاب کن</h1><p data-cms-field="body">تخفیف‌های فعال فروشنده‌های ارومیه، با قیمت شفاف و امکان افزودن مستقیم به سبد.</p><div class="offers-hero-stats"><span><strong>تا ۳۰٪</strong> تخفیف</span><span><strong>۶</strong> ارسال رایگان</span><span><strong>امروز</strong> آخرین فرصت</span></div><button type="button" class="btn btn-yellow offers-hero-cta" data-scroll-to="offers-grid" data-cms-field="cta">دیدن پیشنهادهای امروز</button></div><div class="offers-hero-art">${image("yld-discover-discounted.webp", "پیشنهادهای ویژه یولدا")}</div></section>
          <div class="offers-toolbar" data-cms-block="filters"><div class="chip-row" aria-label="فیلتر پیشنهادها"><button type="button" class="chip is-active" data-filter-group="offers" data-filter-value="all" aria-pressed="true">همه</button><button type="button" class="chip" data-filter-group="offers" data-filter-value="free-delivery" aria-pressed="false">ارسال رایگان</button><button type="button" class="chip" data-filter-group="offers" data-filter-value="discount" aria-pressed="false">تا ۳۰٪</button><button type="button" class="chip" data-filter-group="offers" data-filter-value="wallet" aria-pressed="false">ویژه کیف پول</button></div><span class="muted small" data-filter-count="offers" aria-live="polite">${number(deals.length)} پیشنهاد</span></div>
          <section class="cms-render-block" data-cms-block="products"><section class="product-grid offers-grid" id="offers-grid">${deals.map(({ product, tags, discount }) => `<article class="product-card offer-card" data-route="/product/${product.id}" data-filter-item="offers" data-filter-tags="${tags.join(" ")}" tabindex="0"><span class="offer-discount">${number(discount)}٪</span><button class="floating-fav ${isFavorite(product.id) ? "is-active" : ""}" data-fav="${product.id}" aria-label="افزودن ${escapeHtml(product.name)} به علاقه‌مندی‌ها">${image("yld-ui-favorites.webp")}</button><div class="image-well product-card-image">${image(product.icon, product.name)}</div><div class="product-body"><div class="offer-card-labels"><span class="badge yellow">${product.tag}</span>${tags.includes("free-delivery") ? `<span class="badge success">ارسال رایگان</span>` : ""}</div><h3>${product.name}</h3><p class="muted small">${product.description}</p><div class="product-meta"><strong class="price">${money(product.price)}</strong><button class="add-button" data-add="${product.id}" aria-label="افزودن ${escapeHtml(product.name)}">+</button></div></div></article>`).join("")}</section>
          <section class="empty-state offers-empty" data-filter-empty="offers" hidden>${image("yld-discover-vendor-search.webp")}<h2>پیشنهادی در این فیلتر نیست</h2><p>فیلتر دیگری را امتحان کن.</p></section></section>
        </main>
      `, { title: "پیشنهادها", bottom: true, cartBar: state.cart.length > 0 });
    }

    function nearby() {
      const nearbyVendors = Object.entries(data.vendors).flatMap(([serviceType, list]) => list.map((item) => ({ ...item, serviceType })));
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">بر اساس آدرس خانه</p><h1>نزدیک من</h1></div><button class="btn btn-secondary btn-sm" data-route="/addresses">تغییر آدرس</button></div>
          <section class="nearby-map"><span class="map-pulse">${image("yld-map-locate-me.webp")}</span>${nearbyVendors.slice(0, 5).map((item, index) => `<button class="nearby-pin pin-${index + 1}" data-route="/vendor/${item.serviceType}">${image(item.serviceType === "food" ? "yld-map-marker-restaurant.webp" : item.serviceType === "grocery" ? "yld-map-marker-grocery.webp" : "yld-map-pin.webp")}</button>`).join("")}</section>
          <div class="section-head"><h2>فروشنده‌های اطراف</h2><span class="muted small">مرتب‌شده بر اساس زمان رسیدن</span></div>
          <section class="vendor-grid">${nearbyVendors.slice(0, 6).map((item) => vendorCard(item, item.serviceType)).join("")}</section>
        </main>
      `, { title: "نزدیک من", bottom: true });
    }

    function categoryPage(serviceType, categoryId) {
      const category = (data.categories[serviceType] || []).find((item) => item.id === categoryId);
      if (!category) return notFound();
      let results = data.products.filter((item) => item.service === serviceType && (item.category === categoryId || item.tag.includes(category.title) || item.name.includes(category.title)));
      if (!results.length) results = data.products.filter((item) => item.service === serviceType);
      return page(`
        <main class="page-content" id="page-content">
          <section class="category-hero"><span class="icon-orb">${image(category.icon, category.title)}</span><div><p class="eyebrow">${serviceNames[serviceType]}</p><h1>${category.title}</h1><p>محبوب‌ترین گزینه‌های موجود در محدوده فعلی.</p></div></section>
          <div class="section-head"><h2>${number(results.length)} انتخاب موجود</h2><button class="btn btn-secondary btn-sm" data-toast="مرتب‌سازی بر اساس محبوب‌ترین">مرتب‌سازی</button></div>
          <section class="product-list">${results.map(productRow).join("")}</section>
        </main>
      `, { title: category.title, bottom: true, cartBar: state.cart.length > 0 });
    }

    function checkoutAddress() {
      if (!state.cart.length) return cart();
      const iconForAddress = (kind) => kind === "home" ? "yld-map-address-home.webp" : kind === "work" ? "yld-map-address-work.webp" : "yld-map-address-other.webp";
      return page(`
        <main class="page-content checkout-flow" id="page-content"><div class="checkout-steps"><span class="is-active">۱. آدرس</span><span>۲. زمان</span><span>۳. پرداخت</span></div><div class="page-title-row"><h1>آدرس تحویل</h1><button type="button" class="btn btn-secondary btn-sm" data-route="/address/new">آدرس جدید</button></div><form data-form="checkout-address"><div class="option-list">${state.addresses.map((entry, index) => `<label class="select-card ${entry.id === state.selectedAddressId || (!state.selectedAddressId && index === 0) ? "is-selected" : ""}"><input type="radio" name="address" value="${escapeHtml(entry.id)}" ${entry.id === state.selectedAddressId || (!state.selectedAddressId && index === 0) ? "checked" : ""}>${image(iconForAddress(entry.kind))}<span><strong>${escapeHtml(entry.title)}</strong><br><span class="muted small">${escapeHtml(entry.value)}</span></span></label>`).join("")}</div><button class="btn btn-primary btn-block" style="margin-top:1rem" type="submit">ادامه و انتخاب زمان</button></form></main>
      `, { title: "آدرس تحویل", bottom: false });
    }

    function checkoutTime() {
      if (!state.cart.length) return cart();
      return page(`
        <main class="page-content checkout-flow" id="page-content"><div class="checkout-steps"><span class="is-done">✓ آدرس</span><span class="is-active">۲. زمان</span><span>۳. پرداخت</span></div><div class="page-title-row"><h1>زمان تحویل</h1></div><form data-form="checkout-time"><div class="option-list"><label class="select-card is-selected"><input type="radio" name="time" value="express" checked>${image("yld-pay-free-delivery.webp")}<span><strong>سریع‌ترین زمان</strong><br><span class="muted small">حدود ۳۰ تا ۴۰ دقیقه</span></span><b class="price">رایگان</b></label><label class="select-card"><input type="radio" name="time" value="scheduled">${image("yld-pay-standard-delivery.webp")}<span><strong>زمان‌بندی‌شده</strong><br><span class="muted small">امروز، ساعت ۱۸ تا ۱۹</span></span></label></div><div class="field"><label for="time-note">یادداشت برای پیک</label><textarea id="time-note" name="note" rows="3" placeholder="پلاک، طبقه یا نحوه تحویل"></textarea></div><button class="btn btn-primary btn-block" type="submit">ادامه به پرداخت</button></form></main>
      `, { title: "زمان تحویل", bottom: false });
    }

    function paymentResult(kind) {
      const successState = kind !== "failed";
      return page(`<main class="page-content" id="page-content"><section class="success-hero payment-result-hero ${successState ? "is-success" : "is-failed"}">${image(successState ? "yld-pay-bank-card.webp" : "yld-pay-payment-failed.webp")}<span class="badge ${successState ? "success" : "danger"}">${successState ? "پرداخت تأیید شد" : "پرداخت ناموفق"}</span><h1>${successState ? "پرداخت با موفقیت انجام شد" : "پرداخت کامل نشد"}</h1><p>${successState ? "رسید در کیف پول و جزئیات سفارش ذخیره شد." : "مبلغی کسر نشده است؛ دوباره تلاش کن یا روش دیگری انتخاب کن."}</p><div class="payment-result-actions"><button class="btn btn-primary btn-block" data-route="${successState ? "/tracking" : "/payment"}">${successState ? "پیگیری سفارش" : "تلاش دوباره"}</button><button class="btn btn-secondary btn-block" data-route="/home">بازگشت به خانه</button></div></section></main>`, { title: successState ? "پرداخت موفق" : "پرداخت ناموفق", bottom: false });
    }

    function cancelOrder() {
      return page(`
        <main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow">سفارش #YL-2458</p><h1>لغو سفارش</h1></div><span class="badge danger">۰۳:۲۴ باقی‌مانده</span></div><section class="card warning-card cancel-warning-card">${image("yld-order-cancel.webp", "لغو سفارش")}<div><strong>لغو بدون هزینه تا ۵ دقیقه</strong><p>پس از پایان این بازه، هزینه آماده‌سازی فروشنده ممکن است کسر شود.</p></div></section><form class="card form-card" data-form="cancel-order-page"><div class="field"><label for="cancel-page-reason">دلیل لغو</label><select id="cancel-page-reason" name="reason" required><option value="">انتخاب کنید</option><option>تغییر نظرم</option><option>آدرس اشتباه است</option><option>اقلام را اشتباه انتخاب کردم</option><option>زمان ارسال طولانی است</option></select></div><div class="field"><label for="cancel-page-note">توضیحات (اختیاری)</label><textarea id="cancel-page-note" name="note" rows="3"></textarea></div><button class="btn btn-danger btn-block" type="submit">تأیید لغو سفارش</button><button class="btn btn-ghost btn-block" type="button" data-route="/tracking">انصراف و بازگشت</button></form></main>
      `, { title: "لغو سفارش", bottom: false });
    }

    function orderReview() {
      return page(`
        <main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow">سفارش #YL-2319</p><h1>تجربه‌ات چطور بود؟</h1></div></div><form class="card form-card" data-form="review"><div class="review-vendor">${image("yld-brand-service-grocery.webp")}<div><strong>سوپرمارکت رفاه</strong><span class="muted small">تحویل در ۲۸ دقیقه</span></div></div><fieldset class="rating-field"><legend>امتیاز کلی</legend><div class="star-rating"><label><input type="radio" name="rating" value="1">★</label><label><input type="radio" name="rating" value="2">★</label><label><input type="radio" name="rating" value="3">★</label><label><input type="radio" name="rating" value="4">★</label><label><input type="radio" name="rating" value="5" checked>★</label></div></fieldset><div class="field"><label for="review-text">نظر شما</label><textarea id="review-text" name="review" rows="4" placeholder="کیفیت کالا، بسته‌بندی و رفتار پیک..."></textarea></div><button class="btn btn-primary btn-block" type="submit">ثبت امتیاز</button></form></main>
      `, { title: "امتیاز سفارش", bottom: true });
    }

    function profileEdit() {
      return page(`
          <main class="page-content" id="page-content"><div class="page-title-row"><h1>ویرایش پروفایل</h1></div><form class="card form-card profile-edit-form" data-form="profile-edit"><button type="button" class="avatar-picker profile-avatar-picker" data-toast="انتخاب تصویر پروفایل باز شد" aria-label="افزودن یا تغییر تصویر پروفایل">${image("yld-profile-avatar-add.webp")}<span>تغییر تصویر</span></button><div class="form-grid"><div class="field"><label for="edit-name">نام و نام خانوادگی</label><input id="edit-name" name="displayName" value="${escapeHtml(state.user.displayName || "سارا محمدی")}" required></div><div class="field"><label for="edit-email">ایمیل</label><input id="edit-email" name="email" type="email" value="${escapeHtml(state.user.email || "")}" dir="ltr"></div><div class="field"><label for="edit-birthday">تاریخ تولد</label><input id="edit-birthday" name="birthday" value="${escapeHtml(state.user.birthday || "")}"></div><div class="field select-field"><label for="edit-city">شهر</label><select id="edit-city" name="city"><option selected>${escapeHtml(state.user.city || "ارومیه")}</option></select></div></div><button class="btn btn-primary btn-block" type="submit">ذخیره تغییرات</button></form></main>
      `, { title: "ویرایش پروفایل", bottom: true });
    }

    function addressNew() {
      return page(`
        <main class="page-content" id="page-content"><div class="page-title-row"><h1>افزودن آدرس</h1><span class="badge success">داخل محدوده ارومیه</span></div><section class="address-map address-location-picker">${image("yld-map-pin.webp")}<div><strong>نقطه تحویل را روی نقشه انتخاب کن</strong><span class="muted small">موقعیت انتخابی: خیابان دانشگاه، ارومیه</span></div><button type="button" class="btn btn-secondary btn-sm" data-toast="موقعیت فعلی روی نقشه انتخاب شد">استفاده از موقعیت من</button></section><form class="card form-card" data-form="address-page"><div class="form-grid"><div class="field"><label for="new-title">عنوان آدرس</label><input id="new-title" name="title" placeholder="خانه یا محل کار" required></div><div class="field"><label for="new-phone">شماره تحویل‌گیرنده</label><input id="new-phone" name="phone" inputmode="tel" autocomplete="tel" value="${escapeHtml(state.user.phone || "")}"></div></div><div class="field"><label for="new-address">نشانی کامل</label><textarea id="new-address" name="address" rows="3" placeholder="محله، خیابان و کوچه" required></textarea></div><div class="form-grid address-detail-grid"><div class="field"><label for="new-plaque">پلاک</label><input id="new-plaque" name="plaque" inputmode="numeric" required></div><div class="field"><label for="new-floor">طبقه</label><input id="new-floor" name="floor" inputmode="numeric"></div><div class="field"><label for="new-unit">واحد</label><input id="new-unit" name="unit" inputmode="numeric"></div><div class="field"><label for="new-postal">کد پستی</label><input id="new-postal" name="postal" inputmode="numeric" maxlength="10"></div></div><div class="field"><label for="new-note">توضیحات برای پیدا کردن آدرس</label><input id="new-note" name="note" placeholder="مثلاً درِ ورودی کنار داروخانه"></div><button class="btn btn-primary btn-block" type="submit">ذخیره آدرس</button></form></main>
      `, { title: "آدرس جدید", bottom: true });
    }

    function walletTopup() {
      return page(`
        <main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow">موجودی فعلی ${money(state.walletBalance)}</p><h1>افزایش موجودی</h1></div></div><form class="card form-card" data-form="wallet-topup"><div class="amount-grid"><button type="button" class="amount-chip" data-amount="200000">۲۰۰ هزار</button><button type="button" class="amount-chip is-active" data-amount="500000">۵۰۰ هزار</button><button type="button" class="amount-chip" data-amount="1000000">۱ میلیون</button></div><div class="field"><label for="topup-amount">مبلغ دلخواه (تومان)</label><input id="topup-amount" name="amount" inputmode="numeric" value="500000" dir="ltr" required></div><label class="select-card is-selected"><input type="radio" name="gateway" checked>${image("yld-auth-secure-login.webp")}<span><strong>درگاه امن بانکی</strong><br><span class="muted small">پشتیبانی از همه کارت‌های شتاب</span></span></label><button class="btn btn-primary btn-block" style="margin-top:1rem" type="submit">ادامه پرداخت</button></form></main>
      `, { title: "افزایش موجودی", bottom: true });
    }

    function transactions() {
      return page(`<main class="page-content" id="page-content"><div class="page-title-row"><h1>تراکنش‌ها</h1><button type="button" class="btn btn-secondary btn-sm" data-toast="فایل گزارش آماده دانلود است">دریافت گزارش</button></div><div class="chip-row" style="margin-bottom:1rem" aria-label="فیلتر تراکنش‌ها"><button type="button" class="chip is-active" data-filter-group="transactions" data-filter-value="all" aria-pressed="true">همه</button><button type="button" class="chip" data-filter-group="transactions" data-filter-value="deposit" aria-pressed="false">واریز</button><button type="button" class="chip" data-filter-group="transactions" data-filter-value="payment" aria-pressed="false">پرداخت</button><button type="button" class="chip" data-filter-group="transactions" data-filter-value="refund" aria-pressed="false">بازگشت وجه</button></div><section class="card menu-list">${state.transactions.map((entry) => `<div class="menu-item" data-filter-item="transactions" data-filter-tags="${escapeHtml(entry.kind)}">${image("yld-profile-transactions.webp")}<span class="menu-item-content"><strong>${escapeHtml(entry.title)}</strong><span>${escapeHtml(entry.subtitle)}</span></span><b class="transaction-${transactionClass(entry.amount)}">${transactionAmount(entry.amount)}</b></div>`).join("")}</section></main>`, { title: "تراکنش‌ها", bottom: true });
    }

    function rewards() {
      return page(`
        <main class="page-content" id="page-content"><section class="rewards-hero"><div><span class="badge yellow">باشگاه یولدا</span><h1>۱٬۸۴۰ امتیاز</h1><p>تا سطح طلایی فقط ۶۶۰ امتیاز مانده.</p><div class="progress"><span style="width:74%"></span></div></div>${image("yld-brand-service-loyalty.webp")}</section><div class="section-head"><h2>پاداش‌های قابل دریافت</h2></div><section class="reward-grid"><article class="card reward-card"><span class="badge success">۸۰۰ امتیاز</span>${image("yld-discover-discounted.webp")}<h3>ارسال رایگان غذا</h3><button class="btn btn-secondary btn-sm" data-toast="پاداش فعال شد">دریافت</button></article><article class="card reward-card"><span class="badge success">۱۲۰۰ امتیاز</span>${image("yld-profile-transactions.webp")}<h3>۱۰۰ هزار تومان اعتبار</h3><button class="btn btn-secondary btn-sm" data-toast="پاداش فعال شد">دریافت</button></article></section><button class="btn btn-primary btn-block" style="margin-top:1rem" data-route="/invite">امتیاز بیشتر با معرفی دوستان</button></main>
      `, { title: "باشگاه یولدا", bottom: true });
    }

    function invite() {
      return page(`<main class="page-content" id="page-content"><section class="success-hero invite-hero">${image("yld-profile-invite-friends.webp")}<span class="badge yellow">برای هر دوست ۱۰۰ هزار تومان</span><h1>یولدا را به دوستات معرفی کن</h1><p>بعد از اولین سفارش دوستت، برای هر دوی شما اعتبار کیف پول ثبت می‌شود.</p><div class="invite-code"><span>کد دعوت تو</span><strong dir="ltr">YOLDA-SARA</strong><button class="icon-button" data-copy-value="YOLDA-SARA">${image("yld-ui-copy.webp")}</button></div><button class="btn btn-primary btn-block" data-share>اشتراک‌گذاری دعوت</button></section></main>`, { title: "دعوت دوستان", bottom: true });
    }

    function settingsPage(type) {
      if (type === "language") {
        const english = state.settings.language === "en";
        return page(`<main class="page-content language-page" id="page-content"><div class="page-title-row"><div><p class="eyebrow">${english ? "Yolda settings" : "تنظیمات یولدا"}</p><h1>${english ? "Language" : "زبان"}</h1></div>${image(english ? "yld-profile-language-en.webp" : "yld-profile-language-fa.webp")}</div><form data-form="settings-language"><div class="option-list"><label class="select-card ${english ? "" : "is-selected"}"><input type="radio" name="language" value="fa" ${english ? "" : "checked"}>${image("yld-profile-language-fa.webp")}<span><strong>فارسی</strong><br><span class="muted small">${english ? "Persian interface" : "رابط فارسی"}</span></span></label><label class="select-card ${english ? "is-selected" : ""}"><input type="radio" name="language" value="en" ${english ? "checked" : ""}>${image("yld-profile-language-en.webp")}<span><strong>English</strong><br><span class="muted small">${english ? "Current interface language" : "رابط انگلیسی"}</span></span><span class="badge success">${english ? "Active" : "فعال"}</span></label></div><button class="btn btn-primary btn-block" style="margin-top:1rem" type="submit">${english ? "Save language" : "ذخیره زبان"}</button></form></main>`, { title: english ? "Language" : "زبان", bottom: true });
      }
      const configs = {
        security: { title: "امنیت حساب", icon: "yld-auth-secure-login.webp", body: `<section class="card menu-list"><button type="button" class="menu-item" data-setting-toggle="security.biometric" aria-pressed="${state.settings.security.biometric ? "true" : "false"}">${image("yld-auth-fingerprint.webp")}<span class="menu-item-content"><strong>ورود با اثر انگشت</strong><span>ورود سریع روی این دستگاه</span></span><span class="switch ${state.settings.security.biometric ? "is-on" : ""}" aria-hidden="true"></span></button><button type="button" class="menu-item" data-setting-toggle="security.twoFactor" aria-pressed="${state.settings.security.twoFactor ? "true" : "false"}">${image("yld-auth-secure-login.webp")}<span class="menu-item-content"><strong>تأیید دو مرحله‌ای</strong><span>کد اضافی برای ورودهای جدید</span></span><span class="switch ${state.settings.security.twoFactor ? "is-on" : ""}" aria-hidden="true"></span></button><button type="button" class="menu-item" data-modal="active-devices">${image("yld-profile-active-devices.webp")}<span class="menu-item-content"><strong>دستگاه‌های فعال</strong><span>۲ دستگاه · مشاهده جزئیات و آخرین فعالیت</span></span><span class="chevron">‹</span></button></section>` },
        notifications: { title: "تنظیمات اعلان‌ها", icon: "yld-profile-notification-settings.webp", body: `<section class="card menu-list">${[["orders", "وضعیت سفارش", "لحظه‌ای"], ["offers", "پیشنهادها و تخفیف‌ها", "حداکثر روزی یک پیام"], ["wallet", "یادآوری کیف پول", "موجودی کم و بازگشت وجه"], ["support", "پشتیبانی", "پاسخ درخواست‌ها"]].map(([key, title, subtitle]) => `<button type="button" class="menu-item" data-setting-toggle="notifications.${key}" aria-pressed="${state.settings.notifications[key] ? "true" : "false"}"><span class="menu-item-content"><strong>${title}</strong><span>${subtitle}</span></span><span class="switch ${state.settings.notifications[key] ? "is-on" : ""}" aria-hidden="true"></span></button>`).join("")}</section>` }
      };
      const config = configs[type] || configs.notifications;
      return page(`<main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow">تنظیمات یولدا</p><h1>${config.title}</h1></div>${image(config.icon)}</div>${config.body}<button type="button" class="btn btn-primary btn-block" style="margin-top:1rem" data-settings-save>ذخیره تغییرات</button></main>`, { title: config.title, bottom: true });
    }

    function supportTickets() {
      const tickets = [["#SUP-1042", "تأخیر در سفارش غذا", "در حال بررسی", "yellow"], ["#SUP-1018", "بازگشت وجه", "پاسخ داده شد", "success"], ["#SUP-0984", "ویرایش آدرس", "بسته شده", ""]];
      return page(`<main class="page-content" id="page-content"><div class="page-title-row"><h1>درخواست‌های پشتیبانی</h1><button class="btn btn-primary btn-sm" data-route="/support/new-ticket">درخواست جدید</button></div><section class="card menu-list">${tickets.map(([id, title, status, kind]) => `<button class="menu-item" data-route="/support/ticket/${id.replace("#", "")}">${image("yld-profile-about.webp")}<span class="menu-item-content"><strong>${title}</strong><span dir="ltr">${id}</span></span><span class="badge ${kind}">${status}</span></button>`).join("")}</section></main>`, { title: "درخواست‌های من", bottom: true });
    }

    function supportNewTicket() {
      return page(`<main class="page-content" id="page-content"><div class="page-title-row"><h1>درخواست جدید</h1><span class="badge success">پاسخ زیر ۱۰ دقیقه</span></div><form class="card form-card support-ticket-form" data-form="support-ticket"><div class="field select-field"><label for="ticket-topic">موضوع</label><select id="ticket-topic" name="topic" required><option value="">انتخاب موضوع</option>${data.supportTopics.map((topic) => `<option value="${topic.id}">${topic.title}</option>`).join("")}</select></div><div class="field select-field"><label for="ticket-order">سفارش مرتبط</label><select id="ticket-order" name="order"><option>#YL-2458 · رومانو</option><option>بدون سفارش مرتبط</option></select></div><div class="field"><label for="ticket-message">شرح درخواست</label><textarea id="ticket-message" name="message" rows="5" required placeholder="مشکل را با جزئیات بنویس..."></textarea></div><label class="upload-zone compact" for="ticket-file">${image("yld-ui-upload.webp")}<strong>افزودن تصویر یا فایل</strong><input id="ticket-file" type="file" hidden></label><button class="btn btn-primary btn-block" type="submit">ارسال درخواست</button></form></main>`, { title: "درخواست پشتیبانی", bottom: true });
    }

    function supportTicket(id) {
      return page(`<main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow" dir="ltr">#${escapeHtml(id || "SUP-1042")}</p><h1>تأخیر در سفارش غذا</h1></div><span class="badge yellow">در حال بررسی</span></div><section class="chat-thread"><article class="chat-message is-user"><p>سفارشم بیشتر از زمان اعلام‌شده طول کشیده. لطفاً بررسی کنید.</p><span>۱۸:۳۸</span></article><article class="chat-message is-support"><strong>پشتیبان یولدا</strong><p>سلام سارا، با فروشنده و پیک هماهنگ کردیم؛ سفارش تا حدود ۱۲ دقیقه دیگر می‌رسد.</p><span>۱۸:۴۱</span></article></section><form class="chat-composer" data-form="ticket-reply"><input name="reply" aria-label="پاسخ به پشتیبانی" placeholder="پاسخ بنویس..." required><button class="btn btn-primary" type="submit">ارسال</button></form></main>`, { title: "گفت‌وگوی پشتیبانی", bottom: false });
    }

    function prescriptionStatus() {
      return page(`<main class="page-content" id="page-content"><div class="page-title-row"><div><p class="eyebrow">نسخه #RX-1842</p><h1>وضعیت نسخه</h1></div><span class="badge yellow">در حال بررسی</span></div><section class="card"><div class="timeline"><div class="timeline-item is-done"><span class="timeline-dot"></span><h3>نسخه دریافت شد</h3><p class="muted small">امروز، ۱۷:۲۵</p></div><div class="timeline-item is-current"><span class="timeline-dot"></span><h3>بررسی توسط داروساز</h3><p class="muted small">حدود ۸ دقیقه باقی مانده</p></div><div class="timeline-item"><span class="timeline-dot"></span><h3>تأیید اقلام و قیمت</h3><p class="muted small">پس از بررسی</p></div><div class="timeline-item"><span class="timeline-dot"></span><h3>پرداخت و ارسال</h3></div></div></section><section class="card summary-card" style="margin-top:1rem"><div class="summary-row"><span>داروخانه</span><b>دکتر یزدان</b></div><div class="summary-row"><span>زمان تقریبی پاسخ</span><b>تا ۱۷:۴۵</b></div></section><button class="btn btn-secondary btn-block" style="margin-top:1rem" data-route="/support/new-ticket">ارتباط با پشتیبانی</button></main>`, { title: "پیگیری نسخه", bottom: true });
    }

    function offline() {
      return page(`<main class="page-content" id="page-content"><section class="empty-state offline-state">${image("yld-map-location-off.webp")}<h1>اتصال اینترنت قطع است</h1><p>صفحه‌های بازشده قبلی و سبدهای خرید روی دستگاهت باقی می‌مانند. با وصل‌شدن اینترنت دوباره تلاش کن.</p><button class="btn btn-primary" data-refresh>تلاش دوباره</button><button class="btn btn-secondary" data-route="/home">مشاهده خانه آفلاین</button></section></main>`, { title: "حالت آفلاین", bottom: false });
    }

    function delivery() {
      return page(`
        <main class="page-content" id="page-content"><section class="coming-soon-page">${image("yld-brand-service-courier.webp", "ارسال بسته یولدا")}<span class="badge yellow">به‌زودی</span><h1>ارسال بسته در حال آماده‌سازی است</h1><p>محاسبه قیمت بر اساس مسافت، وزن و نوع مرسوله از پنل مدیریت تنظیم می‌شود. به‌محض فعال‌شدن سرویس خبرت می‌کنیم.</p><div class="coming-soon-features"><span>✓ قیمت‌گذاری شفاف</span><span>✓ رهگیری زنده پیک</span><span>✓ پوشش خسارت مرسوله</span></div><button class="btn btn-primary" data-route="/home">بازگشت به خانه</button></section></main>
      `, { title: "ارسال بسته", bottom: true });
    }

    function bills() {
      return page(`
        <main class="page-content" id="page-content"><section class="coming-soon-page">${image("yld-pay-tax.webp", "پرداخت قبض")}<span class="badge yellow">به‌زودی</span><h1>پرداخت قبض و خدمات شهری</h1><p>استعلام امن قبض‌های آب، برق، گاز، تلفن و اینترنت به‌زودی در یولدا فعال می‌شود.</p><button class="btn btn-primary" data-route="/home">بازگشت به خانه</button></section></main>
      `, { title: "پرداخت قبض", bottom: true });
    }

    function reservation() {
      return page(`
        <main class="page-content" id="page-content">
          <section class="reservation-hero">${image("yld-brand-service-reservation-3d.webp", "رزرو سه‌بعدی رستوران")}<div><span class="badge success">فعال در رستوران‌های منتخب</span><h1>رزرو سه‌بعدی میز رستوران</h1><p>چیدمان سالن را ببین، میز مناسب را انتخاب کن و رزروت را همان لحظه قطعی کن.</p></div></section>
          <form class="card form-card reservation-form" data-form="reservation"><div class="form-grid"><div class="field select-field"><label for="reservation-restaurant">رستوران</label><select id="reservation-restaurant" name="restaurant"><option>رستوران شاندیز</option><option>پیتزا رومانو</option></select></div><div class="field"><label for="reservation-date">تاریخ</label><input id="reservation-date" name="date" value="امروز"></div><div class="field select-field"><label for="reservation-guests">تعداد مهمان</label><select id="reservation-guests" name="guests"><option>۲ نفر</option><option>۴ نفر</option><option>۶ نفر</option></select></div><div class="field select-field"><label for="reservation-time">ساعت</label><select id="reservation-time" name="time"><option>۲۰:۰۰</option><option>۲۰:۳۰</option><option>۲۱:۰۰</option></select></div></div><section class="table-map" aria-label="انتخاب میز"><button type="button" class="table-seat" data-toast="میز ۲ انتخاب شد">۲</button><button type="button" class="table-seat is-selected" data-toast="میز ۴ انتخاب شد">۴</button><button type="button" class="table-seat" data-toast="میز ۶ انتخاب شد">۶</button></section><button class="btn btn-primary btn-block" type="submit">ثبت رزرو میز ۴</button></form>
        </main>
      `, { title: "رزرو رستوران", bottom: true });
    }

    function panelTabs(items, active, variant = "") {
      return `<nav class="panel-tabs ${variant ? `panel-tabs-${variant}` : ""}" aria-label="بخش‌های پنل">${items.map(([id, label, route, itemIcon]) => `<button class="panel-tab ${id === active ? "is-active" : ""}" data-route="${route}">${image(itemIcon)}<span>${label}</span></button>`).join("")}</nav>`;
    }

    const vendorPanelNav = [
      ["overview", "داشبورد", "/vendor-panel", "yld-ui-view-grid.webp"],
      ["orders", "سفارش‌ها", "/vendor-panel/orders", "yld-ui-orders.webp"],
      ["catalog", "منو", "/vendor-panel/catalog", "yld-ui-categories.webp"],
      ["inventory", "موجودی", "/vendor-panel/inventory", "yld-grocery-fruits.webp"],
      ["finance", "مالی", "/vendor-panel/finance", "yld-profile-transactions.webp"],
      ["reviews", "نظرات", "/vendor-panel/reviews", "yld-ui-favorites.webp"],
      ["settings", "تنظیمات", "/vendor-panel/settings", "yld-ui-settings.webp"]
    ];

    function vendorPanel(section = "overview") {
      const vendorProducts = data.products.filter((item) => item.vendor === "romano");
      const orderRows = [["#YL-2462", "۲ آیتم", "جدید", "۱۲:۴۲", "۷۹۸٬۰۰۰"], ["#YL-2461", "۳ آیتم", "در حال آماده‌سازی", "۱۲:۳۶", "۱٬۰۹۵٬۰۰۰"], ["#YL-2459", "۱ آیتم", "آماده تحویل", "۱۲:۱۸", "۴۲۰٬۰۰۰"]];
      const content = {
        overview: `<div class="page-title-row"><div><p class="eyebrow">پیتزا رومانو · شعبه حسنی</p><h1>داشبورد فروشنده</h1></div><span class="badge success">فروشگاه باز است</span></div><section class="stat-grid"><article class="card stat-card"><span class="muted small">سفارش امروز</span><span class="stat-value">۴۲</span><span class="badge success">+۱۸٪</span></article><article class="card stat-card"><span class="muted small">فروش امروز</span><span class="stat-value">۲۸٫۶M</span><span class="small">تومان</span></article><article class="card stat-card"><span class="muted small">میانگین آماده‌سازی</span><span class="stat-value">۱۸</span><span class="small">دقیقه</span></article><article class="card stat-card"><span class="muted small">امتیاز</span><span class="stat-value">۴٫۸</span><span class="small">از ۵</span></article></section><div class="dashboard-grid" style="margin-top:1rem"><section><div class="section-head"><h2>سفارش‌های نیازمند اقدام</h2><a data-route="/vendor-panel/orders">مشاهده همه</a></div>${orderRows.map((row) => `<article class="card compact-order"><div><strong dir="ltr">${row[0]}</strong><span class="muted small">${row[1]} · ${row[3]}</span></div><span class="badge yellow">${row[2]}</span><b>${row[4]} تومان</b><button class="btn btn-primary btn-sm" data-toast="سفارش پذیرفته شد">پذیرش</button></article>`).join("")}</section><aside><div class="section-head"><h2>عملکرد امروز</h2></div><section class="card summary-card"><div><div class="summary-row"><span>پذیرش زیر ۳ دقیقه</span><b>۹۴٪</b></div><div class="progress"><span style="width:94%"></span></div></div><div><div class="summary-row"><span>آماده‌سازی به‌موقع</span><b>۸۷٪</b></div><div class="progress"><span style="width:87%"></span></div></div></section></aside></div>`,
        orders: `<div class="page-title-row"><div><p class="eyebrow">مدیریت لحظه‌ای</p><h1>سفارش‌ها</h1></div><span class="badge yellow">۳ نیازمند اقدام</span></div><div class="chip-row" style="margin-bottom:1rem"><button class="chip is-active">همه</button><button class="chip">جدید</button><button class="chip">در حال آماده‌سازی</button><button class="chip">آماده تحویل</button></div><div class="table-wrap"><table class="data-table"><thead><tr><th>شناسه</th><th>اقلام</th><th>وضعیت</th><th>زمان</th><th>مبلغ</th><th>اقدام</th></tr></thead><tbody>${orderRows.concat([["#YL-2458", "۲ آیتم", "تحویل پیک", "۱۱:۵۵", "۷۴۹٬۰۰۰"]]).map((row) => `<tr><td dir="ltr">${row[0]}</td><td>${row[1]}</td><td><span class="badge">${row[2]}</span></td><td>${row[3]}</td><td>${row[4]} تومان</td><td><button class="btn btn-secondary btn-sm" data-modal="vendor-order" data-id="${row[0]}">مدیریت</button></td></tr>`).join("")}</tbody></table></div>`,
        catalog: `<div class="page-title-row"><div><p class="eyebrow">منوی رومانو</p><h1>کاتالوگ محصولات</h1></div><button class="btn btn-primary btn-sm" data-modal="vendor-product">+ محصول جدید</button></div><section class="catalog-list">${vendorProducts.map((item) => `<article class="card catalog-row"><span class="image-well">${image(item.icon)}</span><div><strong>${item.name}</strong><span class="muted small">${item.description}</span></div><b class="price">${money(item.price)}</b><span class="badge success">فعال</span><button class="icon-button" data-modal="vendor-product" data-id="${item.id}" aria-label="ویرایش ${escapeHtml(item.name)}">${image("yld-ui-edit.webp")}</button></article>`).join("")}</section>`,
        inventory: `<div class="page-title-row"><div><p class="eyebrow">آخرین همگام‌سازی: همین حالا</p><h1>موجودی و دسترس‌پذیری</h1></div><button type="button" class="btn btn-secondary btn-sm" data-toast="موجودی همگام شد">همگام‌سازی</button></div><section class="card menu-list">${vendorProducts.map((item, index) => `<div class="menu-item">${image(item.icon)}<span class="menu-item-content"><strong>${item.name}</strong><span>${index === 2 ? "مواد اولیه رو به اتمام" : "موجود و قابل سفارش"}</span></span><span class="badge ${index === 2 ? "yellow" : "success"}">${index === 2 ? "کم" : "موجود"}</span><button type="button" class="inventory-toggle" data-toggle aria-label="تغییر وضعیت ${escapeHtml(item.name)}" aria-pressed="${index !== 2 ? "true" : "false"}"><span class="switch ${index !== 2 ? "is-on" : ""}" aria-hidden="true"></span></button></div>`).join("")}</section>`,
        finance: `<div class="page-title-row"><div><p class="eyebrow">تسویه بعدی: دوشنبه</p><h1>گزارش مالی</h1></div><button class="btn btn-secondary btn-sm" data-toast="گزارش مالی دانلود شد">خروجی اکسل</button></div><section class="stat-grid"><article class="card stat-card"><span>فروش این ماه</span><span class="stat-value">۶۸۴M</span><span>تومان</span></article><article class="card stat-card"><span>کمیسیون یولدا</span><span class="stat-value">۸۲M</span><span>تومان</span></article><article class="card stat-card"><span>قابل تسویه</span><span class="stat-value">۱۴۶M</span><span>تومان</span></article><article class="card stat-card"><span>بازگشت وجه</span><span class="stat-value">۱٫۸٪</span><span>از فروش</span></article></section><section class="card chart-placeholder" style="margin-top:1rem"><div class="section-head"><h2>روند فروش هفتگی</h2><span class="badge success">+۱۲٪</span></div><div class="bar-chart labeled-chart">${[42, 68, 54, 78, 64, 92, 84].map((value, index) => `<span style="height:${value}%"><i>${["۴۲", "۶۸", "۵۴", "۷۸", "۶۴", "۹۲", "۸۴"][index]}M</i><b>${["ش", "ی", "د", "س", "چ", "پ", "ج"][index]}</b></span>`).join("")}</div></section>`,
        reviews: `<div class="page-title-row"><div><p class="eyebrow">میانگین ۴٫۸ از ۵</p><h1>نظرهای مشتریان</h1></div><span class="badge success">۹۳٪ رضایت</span></div><section class="review-list">${[["سارا محمدی", "غذا گرم و بسته‌بندی عالی بود.", 5], ["امیر شریفی", "طعم خوب بود، فقط کمی دیر رسید.", 4], ["مهسا نوری", "پیتزا رومانو همیشه باکیفیته.", 5]].map(([name, text, rating]) => `<article class="card review-card"><div class="summary-row"><strong>${name}</strong><span class="rating">★ ${number(rating)}</span></div><p>${text}</p><button class="btn btn-ghost btn-sm" data-toast="پاسخ برای مشتری ثبت شد">پاسخ فروشنده</button></article>`).join("")}</section>`,
        settings: `<div class="page-title-row"><h1>تنظیمات فروشگاه</h1><span class="badge success">تأییدشده</span></div><form class="card form-card" data-form="vendor-settings"><div class="form-grid"><div class="field"><label for="vendor-name">نام فروشگاه</label><input id="vendor-name" name="name" value="پیتزا رومانو"></div><div class="field"><label for="vendor-phone">شماره تماس</label><input id="vendor-phone" name="phone" value="۰۴۴۳۲۲۲۱۱۰۰" inputmode="tel"></div><div class="field"><label for="vendor-prep">زمان آماده‌سازی پایه</label><select id="vendor-prep" name="prep"><option>۱۵ تا ۲۵ دقیقه</option><option>۲۵ تا ۳۵ دقیقه</option></select></div><div class="field"><label for="vendor-minimum">حداقل سفارش</label><input id="vendor-minimum" name="minimum" value="۱۵۰۰۰۰" inputmode="numeric"></div></div><button class="menu-item" type="button" data-toggle aria-pressed="true"><span class="menu-item-content"><strong>دریافت خودکار سفارش</strong><span>سفارش‌های پرداخت‌شده مستقیماً وارد صف شوند</span></span><span class="switch is-on" aria-hidden="true"></span></button><button class="btn btn-primary btn-block" type="submit">ذخیره تنظیمات</button></form>`
      }[section] || "";
      return page(`<main class="page-content panel-page" id="page-content">${panelTabs(vendorPanelNav, section, "vendor")}${content}</main>`, { title: "پنل فروشنده", bottom: false, wide: true });
    }

    const courierPanelNav = [
      ["overview", "خانه", "/courier", "yld-ui-view-grid.webp"], ["orders", "پیشنهادها", "/courier/orders", "yld-ui-orders.webp"], ["active", "ارسال فعال", "/courier/active", "yld-map-route.webp"], ["earnings", "درآمد", "/courier/earnings", "yld-profile-transactions.webp"], ["history", "تاریخچه", "/courier/history", "yld-discover-branches.webp"], ["profile", "پروفایل", "/courier/profile", "yld-profile-personal-info.webp"]
    ];

    function courierPanel(section) {
      if (!section || section === "overview") return courier();
      const deliveryCards = `<section class="delivery-grid"><article class="card delivery-card"><div class="summary-row"><b>پیتزا رومانو</b><span class="price">۱۱۰٬۰۰۰ تومان</span></div><div class="delivery-route"><span class="delivery-point">خیابان حسنی</span><span class="delivery-point">خیابان دانشگاه</span></div><div class="summary-row"><span>۴٫۲ کیلومتر · ۲۲ دقیقه</span><button class="btn btn-primary btn-sm" data-toast="سفارش پذیرفته شد">قبول</button></div></article><article class="card delivery-card"><div class="summary-row"><b>سوپرمارکت رفاه</b><span class="price">۹۵٬۰۰۰ تومان</span></div><div class="delivery-route"><span class="delivery-point">شهید بهشتی</span><span class="delivery-point">بلوار باهنر</span></div><div class="summary-row"><span>۳٫۸ کیلومتر · ۱۸ دقیقه</span><button class="btn btn-primary btn-sm" data-toast="سفارش پذیرفته شد">قبول</button></div></article></section>`;
      const content = {
        orders: `<div class="page-title-row"><div><p class="eyebrow">شعاع ۶ کیلومتری</p><h1>سفارش‌های پیشنهادی</h1></div><span class="badge success">آنلاین</span></div><div class="chip-row" style="margin-bottom:1rem"><button class="chip is-active">همه</button><button class="chip">نزدیک‌تر</button><button class="chip">درآمد بیشتر</button></div>${deliveryCards}`,
        active: `<div class="page-title-row"><div><p class="eyebrow">ارسال #DL-7814</p><h1>تحویل به مشتری</h1></div><span class="badge yellow">گام ۲ از ۳</span></div><section class="tracking-map courier-map"><div class="map-marker start">${image("yld-map-marker-restaurant.webp")}</div><div class="map-marker courier">${image("yld-map-marker-courier.webp")}</div></section><section class="card summary-card" style="margin-top:1rem"><div class="summary-row"><span>مبدأ</span><b>پیتزا رومانو، حسنی</b></div><div class="summary-row"><span>مقصد</span><b>خیابان دانشگاه</b></div><div class="summary-row"><span>کد تحویل</span><b dir="ltr">۴ ۸ ۱ ۲</b></div><div class="summary-row total"><span>درآمد این ارسال</span><span>۱۱۰٬۰۰۰ تومان</span></div></section><div class="action-grid" style="margin-top:1rem"><button class="btn btn-secondary" data-toast="مسیریابی باز شد">مسیریابی</button><button class="btn btn-primary" data-toast="رسیدن به مقصد ثبت شد">رسیدم به مقصد</button></div>`,
        earnings: `<div class="page-title-row"><div><p class="eyebrow">هفته جاری</p><h1>درآمد من</h1></div><button class="btn btn-secondary btn-sm" data-toast="درخواست تسویه ثبت شد">درخواست تسویه</button></div><section class="wallet-card"><span class="badge yellow">قابل برداشت</span><div class="wallet-balance">۴٬۸۲۰٬۰۰۰ تومان</div><span class="wallet-card-mark">${image("yld-profile-wallet.webp", "کیف پول درآمد")}</span></section><section class="stat-grid" style="margin-top:1rem"><article class="card stat-card"><span>ارسال موفق</span><span class="stat-value">۳۸</span></article><article class="card stat-card"><span>پاداش</span><span class="stat-value">۶۴۰K</span></article><article class="card stat-card"><span>مسافت</span><span class="stat-value">۲۱۸</span><span>کیلومتر</span></article></section><section class="card chart-placeholder" style="margin-top:1rem"><h2>درآمد روزانه</h2><div class="bar-chart labeled-chart">${[42, 55, 48, 72, 88, 64, 80].map((value, index) => `<span style="height:${value}%"><i>${["۴۲۰", "۵۵۰", "۴۸۰", "۷۲۰", "۸۸۰", "۶۴۰", "۸۰۰"][index]}K</i><b>${["ش", "ی", "د", "س", "چ", "پ", "ج"][index]}</b></span>`).join("")}</div></section>`,
        history: `<div class="page-title-row"><h1>تاریخچه ارسال‌ها</h1><button class="btn btn-secondary btn-sm" data-toast="فیلترها باز شد">فیلتر</button></div><section class="card menu-list">${[["DL-7814", "رومانو ← دانشگاه", "امروز ۱۲:۴۰", "۱۱۰٬۰۰۰"], ["DL-7813", "رفاه ← باهنر", "امروز ۱۱:۵۵", "۹۵٬۰۰۰"], ["DL-7804", "داروخانه یزدان ← استادان", "دیروز ۲۰:۱۸", "۱۲۵٬۰۰۰"], ["DL-7798", "شاندیز ← شهرچای", "دیروز ۱۸:۴۲", "۱۴۰٬۰۰۰"]].map(([id, title, time, amount]) => `<button class="menu-item courier-history-row" data-modal="courier-history" data-id="${id}">${image("yld-order-history.webp")}<span class="menu-item-content"><strong>${title}</strong><span>${time} · ${id}</span></span><b class="price">${amount}</b><span class="chevron">‹</span></button>`).join("")}</section>`,
        profile: `<div class="page-title-row"><h1>پروفایل پیک</h1><span class="badge success">مدارک تأییدشده</span></div><form class="card form-card" data-form="courier-profile"><div class="profile-head courier-profile-head"><div class="profile-avatar">${image("yld-profile-avatar-edit.webp")}</div><div class="courier-profile-identity"><strong>علی رضایی</strong><span class="muted small">نام نمایشی</span><code dir="ltr">شناسه پیک: YD-142</code></div></div><div class="form-grid"><div class="field"><label for="courier-phone">شماره موبایل</label><input id="courier-phone" name="phone" value="۰۹۱۴۱۲۳۴۵۶۷" inputmode="tel"></div><div class="field"><label for="courier-vehicle">وسیله نقلیه</label><input id="courier-vehicle" name="vehicle" value="موتورسیکلت سفید"></div><div class="field"><label for="courier-plate">پلاک</label><input id="courier-plate" name="plate" value="۱۲۳ ایران ۱۷"></div><div class="field select-field"><label for="courier-zone">محدوده ترجیحی</label><select id="courier-zone" name="zone"><option>مرکز ارومیه</option><option>همه محدوده‌ها</option></select></div></div><button class="btn btn-primary btn-block" type="submit">ذخیره تغییرات</button></form>`
      }[section] || "";
      return page(`<main class="page-content panel-page" id="page-content">${panelTabs(courierPanelNav, section, "courier")}${content}</main>`, { title: "پنل پیک", bottom: false, wide: true });
    }

    function courier() {
      return page(`
        <main class="page-content" id="page-content">
          ${panelTabs(courierPanelNav, "overview", "courier")}
          <section class="courier-hero"><div><span class="badge success">آنلاین</span><h1>سلام علی!</h1><p style="margin:0;color:rgba(255,255,255,.7)">امروز ۶ ارسال موفق داشتی.</p></div>${image("yld-brand-service-courier.webp", "پیک یولدا")}</section>
          <section class="stat-grid" style="margin-top:1rem"><article class="card stat-card"><span class="muted small">درآمد امروز</span><span class="stat-value">۸۴۰٬۰۰۰</span><span class="small">تومان</span></article><article class="card stat-card"><span class="muted small">مسافت امروز</span><span class="stat-value">۳۸٫۲</span><span class="small">کیلومتر</span></article></section>
          <div class="section-head"><h2>سفارش‌های نزدیک</h2><span class="badge">۲ مورد</span></div>
          <section class="card delivery-card"><div class="summary-row"><b>رستوران رومانو</b><span class="price">۱۱۰٬۰۰۰ تومان</span></div><div class="delivery-route"><span class="delivery-point">رومانو، خیابان حسنی</span><span class="delivery-point">خیابان دانشگاه، کوچه سوم</span></div><div class="summary-row"><span class="muted small">۴٫۲ کیلومتر · حدود ۲۲ دقیقه</span><button class="btn btn-primary btn-sm" data-toast="سفارش به پیک اختصاص یافت">قبول سفارش</button></div></section>
          <section class="card delivery-card" style="margin-top:1rem"><div class="summary-row"><b>سوپرمارکت رفاه</b><span class="price">۹۵٬۰۰۰ تومان</span></div><div class="delivery-route"><span class="delivery-point">خیابان شهید بهشتی</span><span class="delivery-point">بلوار باهنر، پلاک ۸۴</span></div><div class="summary-row"><span class="muted small">۳٫۸ کیلومتر · حدود ۱۸ دقیقه</span><button class="btn btn-primary btn-sm" data-toast="سفارش به پیک اختصاص یافت">قبول سفارش</button></div></section>
        </main>
      `, { title: "پنل پیک", bottom: false, wide: true });
    }

    function cmsEditor() {
      const activePage = data.cmsPages.find((pageItem) => pageItem.id === state.cmsActivePage) || data.cmsPages[0];
      const savedPage = state.cms?.pages?.[activePage.id] || {};
      const defaultOrder = activePage.blocks.map((block) => block.id);
      const savedOrder = Array.isArray(savedPage.order) ? savedPage.order.filter((id) => defaultOrder.includes(id)) : [];
      const order = [...savedOrder, ...defaultOrder.filter((id) => !savedOrder.includes(id))];
      const blocks = order.map((id) => activePage.blocks.find((block) => block.id === id)).filter(Boolean);
      const hiddenCount = blocks.filter((block) => savedPage.blocks?.[block.id]?.visible === false).length;
      const customizedCount = blocks.filter((block) => Object.keys(savedPage.blocks?.[block.id]?.fields || {}).length).length;
      const recentAudit = (state.cms?.audit || []).slice(0, 5);
      const auditTime = (value) => {
        try { return new Intl.DateTimeFormat("fa-IR", { hour: "2-digit", minute: "2-digit", day: "numeric", month: "short" }).format(new Date(value)); }
        catch (error) { return "همین حالا"; }
      };
      return `
        <section class="cms-admin-shell" aria-labelledby="cms-admin-title">
          <header class="cms-admin-hero">
            <div><span class="cms-admin-kicker">Yolda Content Studio</span><h1 id="cms-admin-title">سوپرادمین محتوا</h1><p>محتوای صفحات را ویرایش کن، ترتیب بخش‌ها را تغییر بده و نتیجه را مستقیم در اپ ببین.</p></div>
            <div class="cms-admin-hero-actions"><span class="cms-publish-status"><i></i> تغییرات روی همین دستگاه منتشر می‌شوند</span><button type="button" class="btn btn-yellow" data-cms-preview="${activePage.route}">پیش‌نمایش صفحه</button></div>
          </header>

          <nav class="cms-page-picker horizontal-scroll" aria-label="انتخاب صفحه برای مدیریت">
            ${data.cmsPages.map((pageItem) => `<button type="button" class="cms-page-tab ${pageItem.id === activePage.id ? "is-active" : ""}" data-cms-select="${pageItem.id}" aria-pressed="${pageItem.id === activePage.id ? "true" : "false"}">${image(pageItem.icon)}<span><strong>${pageItem.title}</strong><small>${pageItem.route}</small></span></button>`).join("")}
          </nav>

          <section class="cms-overview-grid" aria-label="خلاصه صفحه انتخاب‌شده">
            <article><span>صفحه فعال</span><strong>${activePage.title}</strong><small>${activePage.route}</small></article>
            <article><span>بخش‌ها</span><strong>${number(blocks.length)}</strong><small>قابل جابه‌جایی</small></article>
            <article><span>ویرایش‌شده</span><strong>${number(customizedCount)}</strong><small>دارای محتوای سفارشی</small></article>
            <article><span>مخفی</span><strong>${number(hiddenCount)}</strong><small>در خروجی نمایش داده نمی‌شود</small></article>
          </section>

          <div class="cms-workspace-grid">
            <section class="cms-block-manager card">
              <div class="cms-manager-head"><div><p class="eyebrow">چیدمان زنده</p><h2>بخش‌های ${activePage.title}</h2><p>برای تغییر ترتیب بکش و رها کن؛ در موبایل از فلش‌ها استفاده کن.</p></div><button type="button" class="btn btn-ghost btn-sm" data-modal="cms-reset" data-id="${activePage.id}">${image("yld-ui-refresh.webp")} بازنشانی صفحه</button></div>
              <div class="cms-block-list" data-cms-sort-list="${activePage.id}">
                ${blocks.map((block, index) => {
                  const blockState = savedPage.blocks?.[block.id] || { visible: true, fields: {} };
                  const isVisible = blockState.visible !== false;
                  const editedFields = Object.keys(blockState.fields || {}).length;
                  return `<article class="cms-block-card ${isVisible ? "" : "is-hidden"}" draggable="true" data-cms-drag="${block.id}" data-cms-page-id="${activePage.id}">
                    <button type="button" class="cms-drag-handle" data-cms-handle aria-label="کشیدن برای جابه‌جایی" title="بکش و جابه‌جا کن"><span></span><span></span><span></span><span></span><span></span><span></span></button>
                    <span class="cms-block-icon">${image(block.icon)}</span>
                    <div class="cms-block-copy"><div><strong>${block.label}</strong><span class="badge ${isVisible ? "success" : ""}">${isVisible ? "نمایش" : "مخفی"}</span>${editedFields ? `<span class="badge yellow">${number(editedFields)} تغییر</span>` : ""}</div><p>${block.description}</p></div>
                    <div class="cms-block-controls">
                      <button type="button" class="icon-button" data-cms-move="up" data-cms-page-id="${activePage.id}" data-cms-block-id="${block.id}" aria-label="انتقال ${block.label} به بالا" ${index === 0 ? "disabled" : ""}>↑</button>
                      <button type="button" class="icon-button" data-cms-move="down" data-cms-page-id="${activePage.id}" data-cms-block-id="${block.id}" aria-label="انتقال ${block.label} به پایین" ${index === blocks.length - 1 ? "disabled" : ""}>↓</button>
                      <button type="button" class="btn btn-secondary btn-sm" data-modal="cms-block" data-id="${activePage.id}:${block.id}">${image("yld-ui-edit.webp")} ویرایش</button>
                      <button type="button" class="btn btn-ghost btn-sm" data-cms-toggle="${block.id}" data-cms-page-id="${activePage.id}">${image(isVisible ? "yld-ui-eye-hide.webp" : "yld-ui-eye-show.webp")} ${isVisible ? "مخفی‌کردن" : "نمایش‌دادن"}</button>
                    </div>
                  </article>`;
                }).join("")}
              </div>
            </section>

            <aside class="cms-side-column">
              <section class="card cms-preview-card"><span class="cms-preview-icon">${image(activePage.icon)}</span><p class="eyebrow">خروجی زنده</p><h2>${activePage.title}</h2><p>همه تغییرات محتوا، ترتیب و نمایش بخش‌ها بلافاصله روی مسیر اصلی اعمال می‌شود.</p><button type="button" class="btn btn-primary btn-block" data-cms-preview="${activePage.route}">باز کردن ${activePage.title}</button></section>
              <section class="card cms-audit-card"><div class="section-head"><h2>آخرین تغییرات</h2><span class="badge">${number((state.cms?.audit || []).length)}</span></div>${recentAudit.length ? `<ol>${recentAudit.map((entry) => `<li><span>${image("yld-order-history.webp")}</span><div><strong>${entry.action}</strong><small>${entry.pageTitle}${entry.blockTitle ? ` · ${entry.blockTitle}` : ""}</small></div><time>${auditTime(entry.at)}</time></li>`).join("")}</ol>` : `<div class="cms-empty-audit">${image("yld-order-history.webp")}<p>هنوز تغییری ثبت نشده است.</p></div>`}</section>
            </aside>
          </div>
        </section>
      `;
    }

    const opsPanelNav = [
      ["overview", "داشبورد", "/ops", "yld-ui-view-grid.webp"], ["orders", "سفارش‌ها", "/ops/orders", "yld-ui-orders.webp"], ["couriers", "پیک‌ها", "/ops/couriers", "yld-brand-service-courier.webp"], ["vendors", "فروشندگان", "/ops/vendors", "yld-brand-service-grocery.webp"], ["customers", "مشتریان", "/ops/customers", "yld-profile-personal-info.webp"], ["finance", "مالی", "/ops/finance", "yld-profile-wallet.webp"], ["support", "پشتیبانی", "/ops/support", "yld-profile-about.webp"], ["reports", "گزارش‌ها", "/ops/reports", "yld-discover-recommended.webp"], ["content", "محتوا", "/ops/content", "yld-ui-edit.webp"], ["settings", "تنظیمات", "/ops/settings", "yld-ui-settings.webp"], ["audit", "رویدادها", "/ops/audit", "yld-order-history.webp"]
    ];

    function opsPanel(section) {
      if (!section || section === "overview") return ops();
      const orderRows = [["#YL-2458", "رومانو", "سارا محمدی", "در حال ارسال", "۷۴۹٬۰۰۰"], ["#YL-2457", "سوپرمارکت رفاه", "امیر شریفی", "آماده‌سازی", "۱٬۲۸۰٬۰۰۰"], ["#YL-2456", "داروخانه یزدان", "مریم کریمی", "نیازمند تأیید", "۵۲۰٬۰۰۰"], ["#YL-2455", "برگر بار", "رضا محمدی", "تحویل‌شده", "۴۳۸٬۰۰۰"]];
      const table = (headers, rows) => `<div class="table-wrap"><table class="data-table"><thead><tr>${headers.map((header) => `<th>${header}</th>`).join("")}</tr></thead><tbody>${rows.map((row) => `<tr data-search-row data-search-text="${escapeHtml(row.map((cell) => String(cell).replace(/<[^>]*>/g, " ")).join(" "))}">${row.map((cell, index) => `<td ${index === 0 ? "dir=\"ltr\"" : ""}>${cell}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
      const title = (eyebrow, heading, action = "") => `<div class="page-title-row"><div><p class="eyebrow">${eyebrow}</p><h1>${heading}</h1></div>${action}</div>`;
      const content = {
        orders: `${title("مرکز عملیات ارومیه", "مدیریت سفارش‌ها", `<button class="btn btn-primary btn-sm" data-modal="ops-new-order">+ سفارش دستی</button>`)}<div class="filter-bar"><div class="search-box">${image("yld-discover-vendor-search.webp")}<input id="ops-order-search" data-table-search aria-label="جست‌وجو در سفارش‌ها" placeholder="شناسه، مشتری یا فروشنده"></div><div class="chip-row"><button class="chip is-active">همه ۴۸</button><button class="chip">نیازمند اقدام ۵</button><button class="chip">با تأخیر ۳</button></div></div><p class="search-empty-message" data-table-search-empty hidden>سفارشی با این عبارت پیدا نشد.</p>${table(["شناسه", "فروشنده", "مشتری", "وضعیت", "مبلغ", "عملیات"], orderRows.map((row) => [...row, `<button class="btn btn-secondary btn-sm" data-modal="ops-order" data-id="${row[0]}">مشاهده سفارش</button>`]))}`,
        couriers: `${title("۲۳ پیک آنلاین از ۳۱", "مدیریت پیک‌ها", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="courier-new">ثبت پیک</button>`)}<section class="stat-grid"><article class="card stat-card"><span>آنلاین</span><span class="stat-value">۲۳</span></article><article class="card stat-card"><span>در ارسال</span><span class="stat-value">۱۷</span></article><article class="card stat-card"><span>میانگین پذیرش</span><span class="stat-value">۲٫۴</span><span>دقیقه</span></article><article class="card stat-card"><span>رضایت</span><span class="stat-value">۹۴٪</span></article></section>${table(["شناسه", "نام", "وضعیت", "ارسال امروز", "امتیاز", "عملیات"], [["YD-142", "علی رضایی", `<span class="badge success">در ارسال</span>`, "۶", "۴٫۹", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="courier-location">موقعیت</button>`], ["YD-118", "محمد کریمی", `<span class="badge success">آماده</span>`, "۴", "۴٫۸", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="courier-detail">جزئیات</button>`], ["YD-095", "رضا امینی", `<span class="badge yellow">استراحت</span>`, "۵", "۴٫۷", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="courier-detail">جزئیات</button>`]])}`,
        vendors: `${title("۷۲ فروشنده فعال", "فروشندگان", `<button class="btn btn-primary btn-sm" data-modal="ops-action" data-id="vendor-new">فروشنده جدید</button>`)}${table(["شناسه", "فروشنده", "سرویس", "وضعیت", "فروش امروز", "کیفیت"], [["VN-204", "پیتزا رومانو", "غذا", `<span class="badge success">فعال</span>`, "۲۸٫۶M", "۹۴٪"], ["VN-182", "سوپرمارکت رفاه", "سوپرمارکت", `<span class="badge success">فعال</span>`, "۳۴٫۱M", "۹۱٪"], ["VN-091", "داروخانه یزدان", "داروخانه", `<span class="badge yellow">بررسی نسخه</span>`, "۱۲٫۸M", "۹۷٪"]])}`,
        customers: `${title("۱۲٬۴۸۰ مشتری ثبت‌شده", "مشتریان", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="customer-export">خروجی</button>`)}<section class="stat-grid"><article class="card stat-card"><span>فعال ماهانه</span><span class="stat-value">۷٫۸K</span></article><article class="card stat-card"><span>کاربر جدید امروز</span><span class="stat-value">۱۲۸</span></article><article class="card stat-card"><span>نرخ بازگشت</span><span class="stat-value">۶۸٪</span></article><article class="card stat-card"><span>میانگین سفارش</span><span class="stat-value">۳٫۶</span></article></section>${table(["مشتری", "شماره", "سفارش‌ها", "آخرین فعالیت", "وضعیت"], [["سارا محمدی", "۰۹۱۲•••۶۷۸۹", "۲۸", "امروز", `<span class="badge success">فعال</span>`], ["امیر شریفی", "۰۹۱۴•••۱۲۳۴", "۱۲", "امروز", `<span class="badge success">فعال</span>`], ["مریم کریمی", "۰۹۳۵•••۹۸۷۶", "۷", "دیروز", `<span class="badge">عادی</span>`]])}`,
        finance: `${title("امور مالی و تسویه", "مرکز مالی", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="finance-export">خروجی تسویه</button>`)}<section class="stat-grid"><article class="card stat-card"><span>GMV امروز</span><span class="stat-value">۸۶٫۴M</span><span>تومان</span></article><article class="card stat-card"><span>درآمد یولدا</span><span class="stat-value">۱۰٫۸M</span></article><article class="card stat-card"><span>قابل تسویه</span><span class="stat-value">۱۲۸M</span></article><article class="card stat-card"><span>بازگشت وجه</span><span class="stat-value">۲٫۱M</span></article></section><section class="card chart-placeholder" style="margin-top:1rem"><div class="section-head"><h2>گردش مالی هفتگی</h2><span class="badge success">+۱۴٪</span></div><div class="bar-chart labeled-chart">${[52, 62, 58, 74, 68, 96, 88].map((value, index) => `<span style="height:${value}%"><i>${["۵۲", "۶۲", "۵۸", "۷۴", "۶۸", "۹۶", "۸۸"][index]}M</i><b>${["ش", "ی", "د", "س", "چ", "پ", "ج"][index]}</b></span>`).join("")}</div></section>${table(["دوره", "تعداد سفارش", "فروش ناخالص", "کمیسیون", "قابل تسویه"], [["امروز", "۲۳۸", "۸۶٬۴۰۰٬۰۰۰", "۱۰٬۸۰۰٬۰۰۰", "۷۵٬۶۰۰٬۰۰۰"], ["دیروز", "۲۱۲", "۷۹٬۲۰۰٬۰۰۰", "۹٬۹۰۰٬۰۰۰", "۶۹٬۳۰۰٬۰۰۰"], ["این هفته", "۱٬۴۸۶", "۵۴۸٬۰۰۰٬۰۰۰", "۶۸٬۵۰۰٬۰۰۰", "۴۷۹٬۵۰۰٬۰۰۰"]])}` ,
        support: `${title("۵ گفت‌وگوی باز", "مرکز پشتیبانی", `<span class="badge success">میانگین پاسخ ۴:۱۸</span>`)}<section class="support-queue">${[["SUP-1042", "سارا محمدی", "تأخیر سفارش رومانو", "فوری"], ["SUP-1041", "امیر شریفی", "بازگشت وجه", "مالی"], ["SUP-1039", "مریم کریمی", "تأیید نسخه", "داروخانه"]].map(([id, customer, topic, badge]) => `<article class="card queue-card"><span class="profile-avatar">${image("yld-profile-personal-info.webp")}</span><div><strong>${customer}</strong><span>${topic}</span></div><span class="badge yellow">${badge}</span><button class="btn btn-primary btn-sm" data-modal="ops-chat" data-id="${id}">پاسخ</button></article>`).join("")}</section>`,
        reports: `${title("بینش عملیاتی", "گزارش‌ها", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="report-new">ساخت گزارش</button>`)}<section class="report-grid">${[["فروش و درآمد", "روند GMV، کمیسیون و تسویه", "yld-profile-transactions.webp"], ["عملکرد ارسال", "زمان پذیرش و تحویل پیک", "yld-brand-service-courier.webp"], ["کیفیت فروشندگان", "لغو، تأخیر و امتیاز مشتری", "yld-discover-verified.webp"], ["رفتار مشتری", "بازگشت، سبد و کانال جذب", "yld-profile-personal-info.webp"]].map(([reportTitle, body, reportIcon]) => `<button class="card report-card" data-modal="ops-action" data-id="report-detail">${image(reportIcon)}<span><strong>${reportTitle}</strong><small>${body}</small></span><b>←</b></button>`).join("")}</section>` ,
        content: cmsEditor(),
        settings: `${title("پیکربندی شهر ارومیه", "تنظیمات عملیات")}<form class="card form-card" data-form="ops-settings"><div class="form-grid"><div class="field select-field"><label for="ops-radius">حداکثر شعاع خدمت</label><select id="ops-radius" name="radius"><option>۱۲ کیلومتر</option><option>۱۵ کیلومتر</option></select></div><div class="field select-field"><label for="ops-cancel-window">بازه لغو رایگان</label><select id="ops-cancel-window" name="cancelWindow"><option>۵ دقیقه</option><option>۳ دقیقه</option></select></div><div class="field"><label for="ops-wallet-minimum">حداقل موجودی کیف پول</label><input id="ops-wallet-minimum" name="walletMinimum" value="۵۰۰۰۰" inputmode="numeric"></div><div class="field select-field"><label for="ops-support-time">زمان پاسخ پشتیبانی</label><select id="ops-support-time" name="supportTime"><option>زیر ۱۰ دقیقه</option></select></div></div><fieldset class="ops-pricing-settings"><legend>محاسبه هزینه ارسال بسته</legend><div class="form-grid"><div class="field"><label for="package-base-price">هزینه پایه (تومان)</label><input id="package-base-price" name="packageBasePrice" value="۵۵۰۰۰" inputmode="numeric"></div><div class="field"><label for="package-per-km">هزینه هر کیلومتر</label><input id="package-per-km" name="packagePerKm" value="۸۵۰۰" inputmode="numeric"></div><div class="field select-field"><label for="package-weight-factor">ضریب وزن</label><select id="package-weight-factor" name="packageWeightFactor"><option>هر ۲ کیلو +۱۵٪</option><option>هر ۵ کیلو +۲۰٪</option></select></div><div class="field select-field"><label for="package-fragile-factor">مرسوله شکستنی</label><select id="package-fragile-factor" name="packageFragileFactor"><option>+۲۵٪ هزینه پوشش</option><option>غیرفعال</option></select></div></div></fieldset><button class="btn btn-primary btn-block" type="submit">ذخیره پیکربندی</button></form>`,
        audit: `${title("قابل پیگیری و امن", "رویدادهای سیستمی", `<button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="audit-filter">فیلتر</button>`)}<section class="audit-heading-card card">${image("yld-order-history.webp")}<div><strong>گزارش کامل رویدادها</strong><span class="muted small">همه تغییرات مهم با زمان و منبع ثبت می‌شوند.</span></div></section>${table(["زمان", "کاربر", "رویداد", "منبع", "نتیجه"], [["۱۲:۴۸:۱۱", "ops.sara", "تغییر وضعیت سفارش YL-2458", "پنل عملیات", `<span class="badge success">موفق</span>`], ["۱۲:۴۱:۰۸", "vendor.romano", "پذیرش سفارش YL-2462", "پنل فروشنده", `<span class="badge success">موفق</span>`], ["۱۲:۳۸:۵۲", "system", "اختصاص پیک YD-142", "موتور تخصیص", `<span class="badge success">موفق</span>`], ["۱۲:۳۵:۲۶", "ops.admin", "ویرایش محدوده خدمت", "تنظیمات", `<span class="badge yellow">بازبینی</span>`]])}`
      }[section] || "";
      return page(`<main class="page-content panel-page ${section === "content" ? "cms-admin-page" : ""}" id="page-content">${panelTabs(opsPanelNav, section)}${content}</main>`, { title: section === "content" ? "سوپرادمین محتوا" : "پنل عملیات", bottom: false, wide: true });
    }

    function ops() {
      const rows = [
        ["#YL-2458", "پیتزا رومانو", "سارا محمدی", "در حال ارسال", "۷۴۹٬۰۰۰"],
        ["#YL-2457", "سوپرمارکت رفاه", "امیر شریفی", "در حال آماده‌سازی", "۱٬۲۸۰٬۰۰۰"],
        ["#YL-2456", "داروخانه یزدان", "مریم کریمی", "نیازمند تأیید", "۵۲۰٬۰۰۰"],
        ["#YL-2455", "برگر بار", "رضا محمدی", "تحویل‌شده", "۴۳۸٬۰۰۰"]
      ];
      return page(`
        <main class="page-content" id="page-content">
          ${panelTabs(opsPanelNav, "overview")}
          <div class="page-title-row"><div><p class="eyebrow">عملیات شهر ارومیه</p><h1>داشبورد یولدا</h1></div><div class="header-actions"><button class="btn btn-secondary btn-sm" data-modal="ops-action" data-id="overview-export">خروجی گزارش</button><button class="btn btn-primary btn-sm" data-modal="ops-new-order">+ سفارش جدید</button></div></div>
          <section class="stat-grid"><article class="card stat-card"><span class="muted small">سفارش فعال</span><span class="stat-value">۴۸</span><span class="badge success">+۱۲٪ امروز</span></article><article class="card stat-card"><span class="muted small">فروش امروز</span><span class="stat-value">۸۶٫۴M</span><span class="small">تومان</span></article><article class="card stat-card"><span class="muted small">پیک آنلاین</span><span class="stat-value">۲۳</span><span class="small">از ۳۱ پیک</span></article><article class="card stat-card"><span class="muted small">میانگین تحویل</span><span class="stat-value">۳۲</span><span class="small">دقیقه</span></article></section>
          <div class="dashboard-grid ops-overview-grid" style="margin-top:1rem">
            <section class="ops-live-orders"><div class="section-head"><h2>سفارش‌های لحظه‌ای</h2><div class="chip-row"><button class="chip is-active">همه</button><button class="chip">نیازمند اقدام</button></div></div><div class="table-wrap"><table class="data-table"><thead><tr><th>شناسه</th><th>فروشنده</th><th>مشتری</th><th>وضعیت</th><th>مبلغ</th><th>عملیات</th></tr></thead><tbody>${rows.map((row) => `<tr><td dir="ltr">${row[0]}</td><td>${row[1]}</td><td>${row[2]}</td><td><span class="badge">${row[3]}</span></td><td>${row[4]} تومان</td><td><button class="btn btn-secondary btn-sm" data-modal="ops-order" data-id="${row[0]}">مشاهده</button></td></tr>`).join("")}</tbody></table></div></section>
            <aside class="ops-health-alerts"><section class="ops-health-block"><div class="section-head"><h2>سلامت عملیات</h2></div><section class="card summary-card"><div><div class="summary-row"><span>پذیرش زیر ۳ دقیقه</span><b>۸۹٪</b></div><div class="progress"><span style="width:89%"></span></div></div><div><div class="summary-row"><span>تحویل به‌موقع</span><b>۹۳٪</b></div><div class="progress"><span style="width:93%"></span></div></div><div><div class="summary-row"><span>موجودی همگام</span><b>۷۸٪</b></div><div class="progress"><span style="width:78%"></span></div></div></section></section><section class="ops-alert-block"><div class="section-head"><h2>هشدارها</h2></div><section class="card menu-list"><button class="menu-item" data-modal="ops-action" data-id="stock-alert">${image("yld-discover-temporarily-unavailable.webp")}<span class="menu-item-content"><strong>۳ محصول ناموجود</strong><span>نیازمند بررسی اپراتور</span></span><span class="chevron">‹</span></button><button class="menu-item" data-modal="ops-action" data-id="zone-alert">${image("yld-map-location-error.webp")}<span class="menu-item-content"><strong>۱ ارسال خارج محدوده</strong><span>هماهنگی با پیک</span></span><span class="chevron">‹</span></button></section></section></aside>
          </div>
        </main>
      `, { title: "پنل عملیات", bottom: false, wide: true });
    }

    function icons() {
      const categories = [...new Set(data.icons.map((name) => name.split("-")[1]))];
      return page(`
        <main class="page-content" id="page-content">
          <div class="page-title-row"><div><p class="eyebrow">Yolda Icon System</p><h1>کتابخانه کامل آیکون‌ها</h1></div><span class="badge success">${number(data.icons.length)} فایل</span></div>
          <p class="muted">همه فایل‌های پوشه <span dir="ltr">assets/icons</span> داخل این بسته قرار دارند. برای کپی نام فایل روی هر آیکون بزنید.</p>
          <section class="icon-toolbar">
            <div class="search-box" style="margin:0">${image("yld-discover-vendor-search.webp")}<input id="icon-search" aria-label="جست‌وجو در نام آیکون‌ها" placeholder="جست‌وجو در نام آیکون‌ها..." dir="ltr"></div>
            <div class="chip-row" style="margin-top:.7rem"><button class="chip is-active" data-icon-category="all">همه</button>${categories.map((category) => `<button class="chip" data-icon-category="${category}">${category}</button>`).join("")}</div>
            <div class="icon-stats"><span class="badge">۳D و تصویری</span><span class="badge">UI و کاربردی</span><span class="badge">نقشه</span><span class="badge">پروفایل</span></div>
          </section>
          <section class="icon-gallery" id="icon-gallery">${data.icons.map(iconCard).join("")}</section>
        </main>
      `, { title: "آیکون‌ها", bottom: false, wide: true });
    }

    function iconCard(name) {
      const category = name.split("-")[1];
      return `<button class="icon-card" data-icon-name="${name}" data-icon-category-name="${category}" data-copy-icon="${name}"><span class="image-well">${image(name, name)}</span><span class="icon-card-body"><span class="badge">${category}</span><code>${name}</code></span></button>`;
    }

    function notFound() {
      return page(`
        <main class="page-content" id="page-content"><section class="empty-state">${image("yld-map-location-error.webp", "صفحه پیدا نشد")}<h2>این صفحه پیدا نشد</h2><p>مسیر اشتباه است یا این بخش هنوز آماده نشده.</p><button class="btn btn-primary" data-route="/home">بازگشت به خانه</button></section></main>
      `, { title: "صفحه پیدا نشد", bottom: false });
    }

    function resolve(path) {
      if (path === "/" || path === "/home") return home();
      if (path === "/welcome") return welcome();
      if (path === "/auth/login") return login();
      if (path === "/auth/otp") return otp();
      if (path === "/auth/profile") return profileSetup();
      if (path === "/permissions/location") return permission("location");
      if (path === "/permissions/notifications") return permission("notifications");
      if (path === "/services") return allServices();
      if (path === "/offers") return offers();
      if (path === "/nearby") return nearby();
      if (["/food", "/grocery", "/pharmacy"].includes(path)) return service(path.slice(1));
      if (path.startsWith("/stores/")) return allStores(path.split("/")[2]);
      if (path.startsWith("/vendor/")) return vendor(path.split("/")[2]);
      if (path.startsWith("/product/")) return product(path.split("/")[2]);
      if (path.startsWith("/category/")) return categoryPage(path.split("/")[2], path.split("/")[3]);
      if (path === "/search") return search();
      if (path === "/ai") return ai();
      if (path === "/ai/quiz") return aiQuiz();
      if (path.startsWith("/ai/quiz/")) return aiQuiz(path.split("/")[3]);
      if (path === "/ai/results") return aiResults();
      if (path === "/ai/history") return aiHistory();
      if (path === "/ai/preferences") return aiPreferences();
      if (path === "/favorites") return favorites();
      if (path === "/cart") return cart();
      if (path === "/checkout") return checkoutAddress();
      if (path === "/checkout/address") return checkoutAddress();
      if (path === "/checkout/time") return checkoutTime();
      if (path === "/payment") return payment();
      if (path === "/payment/result/success") return paymentResult("success");
      if (path === "/payment/result/failed") return paymentResult("failed");
      if (path === "/order/success") return success();
      if (path === "/order/cancel") return cancelOrder();
      if (path === "/order/review") return orderReview();
      if (path === "/orders") return orders();
      if (path === "/tracking") return tracking();
      if (path === "/order/details") return orderDetails();
      if (path === "/profile") return profile();
      if (path === "/profile/edit") return profileEdit();
      if (path === "/addresses") return addresses();
      if (path === "/address/new") return addressNew();
      if (path === "/payments") return payments();
      if (path === "/wallet") return wallet();
      if (path === "/wallet/topup") return walletTopup();
      if (path === "/transactions") return transactions();
      if (path === "/rewards") return rewards();
      if (path === "/invite") return invite();
      if (path === "/notifications") return notifications();
      if (path === "/settings") return settings();
      if (path === "/settings/appearance") return appearanceSettings();
      if (path === "/settings/accessibility") return accessibilitySettings();
      if (path === "/settings/language") return settingsPage("language");
      if (path === "/settings/security") return settingsPage("security");
      if (path === "/settings/notifications") return settingsPage("notifications");
      if (path === "/about") return about();
      if (path === "/support") return support();
      if (path === "/support/tickets") return supportTickets();
      if (path === "/support/new-ticket") return supportNewTicket();
      if (path.startsWith("/support/ticket/")) return supportTicket(path.split("/")[3]);
      if (path === "/prescription") return prescription();
      if (path === "/prescription/status") return prescriptionStatus();
      if (path === "/delivery") return delivery();
      if (path === "/bills") return bills();
      if (path === "/reservation") return reservation();
      if (path === "/courier") return courier();
      if (path.startsWith("/courier/")) return courierPanel(path.split("/")[2]);
      if (path === "/vendor-panel") return vendorPanel("overview");
      if (path.startsWith("/vendor-panel/")) return vendorPanel(path.split("/")[2]);
      if (path === "/superadmin" || path === "/superadmin/content") return opsPanel("content");
      if (path === "/ops") return ops();
      if (path.startsWith("/ops/")) return opsPanel(path.split("/")[2]);
      if (path === "/icons") return icons();
      if (path === "/offline") return offline();
      return notFound();
    }

    return { resolve, productRow, iconCard };
  };
})();
