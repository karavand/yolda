(function () {
  "use strict";

  const icons = [
    "yld-auth-face-id.webp",
    "yld-auth-fingerprint.webp",
    "yld-auth-guest.webp",
    "yld-auth-location-allowed.webp",
    "yld-auth-notification-denied.webp",
    "yld-auth-otp-countdown.webp",
    "yld-auth-otp-entry.webp",
    "yld-auth-otp-error.webp",
    "yld-auth-otp-expired.webp",
    "yld-auth-otp-resend.webp",
    "yld-auth-permission-camera.webp",
    "yld-auth-permission-notification.webp",
    "yld-auth-phone-entry.webp",
    "yld-auth-phone-verified.webp",
    "yld-auth-secure-login.webp",
    "yld-auth-terms-accept.webp",
    "yld-brand-service-courier.webp",
    "yld-brand-service-grocery.webp",
    "yld-brand-service-loyalty.webp",
    "yld-brand-service-reservation-3d.webp",
    "yld-brand-service-scheduled.webp",
    "yld-discover-best-seller.webp",
    "yld-discover-branches.webp",
    "yld-discover-discounted.webp",
    "yld-discover-distance.webp",
    "yld-discover-express-delivery.webp",
    "yld-discover-grocery-store.webp",
    "yld-discover-minimum-order.webp",
    "yld-discover-nearest.webp",
    "yld-discover-new.webp",
    "yld-discover-open-24h.webp",
    "yld-discover-pharmacy.webp",
    "yld-discover-pickup-available.webp",
    "yld-discover-popular.webp",
    "yld-discover-preorder.webp",
    "yld-discover-price-level.webp",
    "yld-discover-recently-viewed.webp",
    "yld-discover-recommended.webp",
    "yld-discover-reservation-available.webp",
    "yld-discover-restaurant.webp",
    "yld-discover-store-closed.webp",
    "yld-discover-temporarily-unavailable.webp",
    "yld-discover-vendor-search.webp",
    "yld-discover-verified.webp",
    "yld-food-azerbaijani.webp",
    "yld-food-bakery.webp",
    "yld-food-breakfast.webp",
    "yld-food-burger.webp",
    "yld-food-dessert.webp",
    "yld-food-drinks.webp",
    "yld-food-fried-chicken.webp",
    "yld-food-healthy.webp",
    "yld-food-italian.webp",
    "yld-food-pasta.webp",
    "yld-food-pastry.webp",
    "yld-food-pizza.webp",
    "yld-food-soup.webp",
    "yld-food-vegetarian.webp",
    "yld-grocery-breakfast.webp",
    "yld-grocery-diet.webp",
    "yld-grocery-fish.webp",
    "yld-grocery-fruits.webp",
    "yld-grocery-grains.webp",
    "yld-grocery-laundry.webp",
    "yld-grocery-mother-baby.webp",
    "yld-grocery-pasta.webp",
    "yld-grocery-poultry.webp",
    "yld-grocery-tea-coffee.webp",
    "yld-grocery-vegetables.webp",
    "yld-map-address-edit.webp",
    "yld-map-address-home.webp",
    "yld-map-address-other.webp",
    "yld-map-address-work.webp",
    "yld-map-building.webp",
    "yld-map-compass.webp",
    "yld-map-courier-moving.webp",
    "yld-map-delivery-note.webp",
    "yld-map-entrance.webp",
    "yld-map-floor.webp",
    "yld-map-locate-me.webp",
    "yld-map-location-error.webp",
    "yld-map-location-off.webp",
    "yld-map-map-view.webp",
    "yld-map-marker-courier.webp",
    "yld-map-marker-grocery.webp",
    "yld-map-marker-restaurant.webp",
    "yld-map-navigation.webp",
    "yld-map-outside-zone.webp",
    "yld-map-pin.webp",
    "yld-map-route-start.webp",
    "yld-map-route.webp",
    "yld-map-share-location.webp",
    "yld-map-waypoint.webp",
    "yld-map-zoom-in.webp",
    "yld-pharm-blood-pressure.webp",
    "yld-pharm-otc.webp",
    "yld-pharm-prescription-approved.webp",
    "yld-pharm-prescription-camera.webp",
    "yld-pharm-skin-hair.webp",
    "yld-profile-about.webp",
    "yld-profile-account-security.webp",
    "yld-profile-active-devices.webp",
    "yld-profile-app-version.webp",
    "yld-profile-avatar-add.webp",
    "yld-profile-avatar-edit.webp",
    "yld-profile-invite-friends.webp",
    "yld-profile-language-en.webp",
    "yld-profile-language-fa.webp",
    "yld-profile-my-points.webp",
    "yld-profile-my-reservations.webp",
    "yld-profile-my-reviews.webp",
    "yld-profile-my-rewards.webp",
    "yld-profile-notification-settings.webp",
    "yld-profile-personal-info.webp",
    "yld-profile-saved-cards.webp",
    "yld-profile-theme-light.webp",
    "yld-profile-transactions.webp",
    "yld-profile-wallet.webp",
    "yld-ui-add.webp",
    "yld-ui-back-ltr.webp",
    "yld-ui-cart.webp",
    "yld-ui-categories.webp",
    "yld-ui-check.webp",
    "yld-ui-chevron-next.webp",
    "yld-ui-chevron-previous.webp",
    "yld-ui-close.webp",
    "yld-ui-copy.webp",
    "yld-ui-delete.webp",
    "yld-ui-download.webp",
    "yld-ui-edit.webp",
    "yld-ui-expand.webp",
    "yld-ui-eye-hide.webp",
    "yld-ui-eye-show.webp",
    "yld-ui-favorites.webp",
    "yld-ui-filter.webp",
    "yld-ui-fullscreen-exit.webp",
    "yld-ui-fullscreen.webp",
    "yld-ui-info.webp",
    "yld-ui-menu.webp",
    "yld-ui-more-vertical.webp",
    "yld-ui-notifications.webp",
    "yld-ui-orders.webp",
    "yld-ui-refresh.webp",
    "yld-ui-save.webp",
    "yld-ui-settings.webp",
    "yld-ui-sort.webp",
    "yld-ui-upload.webp",
    "yld-ui-view-grid.webp"
  ];

  const services = [
    { id: "grocery", title: "سوپرمارکت", route: "/grocery", icon: "yld-brand-service-grocery.webp", color: "#def7e8" },
    { id: "food", title: "رستوران", route: "/food", icon: "yld-discover-restaurant.webp", color: "#fff2cf" },
    { id: "pharmacy", title: "داروخانه", route: "/pharmacy", icon: "yld-discover-pharmacy.webp", color: "#ffe3ea" },
    { id: "courier", title: "ارسال بسته", route: "/delivery", icon: "yld-brand-service-courier.webp", color: "#e1f4ff" },
    { id: "wallet", title: "کیف پول", route: "/wallet", icon: "yld-profile-wallet.webp", color: "#efe4ff" },
    { id: "bills", title: "پرداخت قبض", route: "/bills", icon: "yld-profile-transactions.webp", color: "#e8f7ff" },
    { id: "reservation", title: "رزرو سه‌بعدی", route: "/reservation", icon: "yld-brand-service-reservation-3d.webp", color: "#f2e8ff", soon: true },
    { id: "more", title: "بیشتر", route: "/services", icon: "yld-ui-categories.webp", color: "#f1e7ff" }
  ];

  const categories = {
    food: [
      { id: "pizza", title: "پیتزا", icon: "yld-food-pizza.webp" },
      { id: "burger", title: "برگر", icon: "yld-food-burger.webp" },
      { id: "iranian", title: "ایرانی", icon: "yld-food-azerbaijani.webp" },
      { id: "kebab", title: "کباب", icon: "yld-food-healthy.webp" },
      { id: "drink", title: "نوشیدنی", icon: "yld-food-drinks.webp" },
      { id: "dessert", title: "دسر", icon: "yld-food-dessert.webp" },
      { id: "breakfast", title: "صبحانه", icon: "yld-food-breakfast.webp" },
      { id: "vegetarian", title: "گیاهی", icon: "yld-food-vegetarian.webp" }
    ],
    grocery: [
      { id: "fruit", title: "میوه", icon: "yld-grocery-fruits.webp" },
      { id: "vegetable", title: "سبزیجات", icon: "yld-grocery-vegetables.webp" },
      { id: "breakfast", title: "صبحانه", icon: "yld-grocery-breakfast.webp" },
      { id: "protein", title: "پروتئین", icon: "yld-grocery-poultry.webp" },
      { id: "grains", title: "حبوبات", icon: "yld-grocery-grains.webp" },
      { id: "tea", title: "چای و قهوه", icon: "yld-grocery-tea-coffee.webp" },
      { id: "cleaning", title: "شوینده", icon: "yld-grocery-laundry.webp" },
      { id: "baby", title: "مادر و کودک", icon: "yld-grocery-mother-baby.webp" }
    ],
    pharmacy: [
      { id: "otc", title: "بدون نسخه", icon: "yld-pharm-otc.webp" },
      { id: "skin", title: "پوست و مو", icon: "yld-pharm-skin-hair.webp" },
      { id: "pressure", title: "تجهیزات پزشکی", icon: "yld-pharm-blood-pressure.webp" },
      { id: "prescription", title: "ارسال نسخه", icon: "yld-pharm-prescription-camera.webp", route: "/prescription" }
    ]
  };

  const vendors = {
    food: [
      { id: "romano", name: "پیتزا رومانو", subtitle: "ایتالیایی · پیتزا و برگر", rating: 4.8, time: "۲۵–۳۵ دقیقه", icon: "yld-food-pizza.webp", discount: "۱۵٪ تخفیف" },
      { id: "shandiz", name: "رستوران شاندیز", subtitle: "غذای ایرانی و کباب", rating: 4.7, time: "۳۰–۴۰ دقیقه", icon: "yld-food-azerbaijani.webp", discount: "۱۰٪ تخفیف" },
      { id: "burgerbar", name: "برگر بار", subtitle: "برگر دست‌ساز", rating: 4.6, time: "۲۰–۳۰ دقیقه", icon: "yld-food-burger.webp", discount: "ارسال رایگان" },
      { id: "green", name: "کافه سبز", subtitle: "سالم و گیاهی", rating: 4.5, time: "۲۵–۳۵ دقیقه", icon: "yld-food-vegetarian.webp", discount: "جدید" }
    ],
    grocery: [
      { id: "refah", name: "سوپرمارکت رفاه", subtitle: "همیشه تازه · ارسال سریع", rating: 4.8, time: "۲۰–۳۰ دقیقه", icon: "yld-brand-service-grocery.webp", discount: "ارسال رایگان" },
      { id: "yaran", name: "فروشگاه یاران", subtitle: "مواد غذایی و مصرفی", rating: 4.6, time: "۳۰–۴۰ دقیقه", icon: "yld-discover-grocery-store.webp", discount: "۱۲٪ تخفیف" },
      { id: "organic", name: "بازارچه تازه", subtitle: "میوه و سبزی ارگانیک", rating: 4.9, time: "۳۵–۴۵ دقیقه", icon: "yld-grocery-fruits.webp", discount: "تازه‌رسیده" }
    ],
    pharmacy: [
      { id: "dr-yazdan", name: "داروخانه دکتر یزدان", subtitle: "شبانه‌روزی · نسخه آنلاین", rating: 4.9, time: "۲۵–۴۰ دقیقه", icon: "yld-discover-pharmacy.webp", discount: "باز تا ۲۴" },
      { id: "shafa", name: "داروخانه شفا", subtitle: "مکمل و محصولات سلامت", rating: 4.7, time: "۳۰–۴۵ دقیقه", icon: "yld-pharm-otc.webp", discount: "ارسال سریع" }
    ]
  };

  const products = [
    { id: "food-1", service: "food", vendor: "romano", name: "پیتزا مخصوص رومانو", description: "پنیر مخصوص، قارچ، فلفل دلمه و پپرونی", price: 420000, icon: "yld-food-pizza.webp", tag: "پرفروش" },
    { id: "food-2", service: "food", vendor: "romano", name: "برگر یولدا", description: "گوشت دست‌ساز، پنیر، کاهو و سس ویژه", price: 329000, icon: "yld-food-burger.webp", tag: "پیشنهاد یولدا" },
    { id: "food-3", service: "food", vendor: "romano", name: "پاستا آلفردو", description: "مرغ گریل، قارچ و سس خامه‌ای", price: 365000, icon: "yld-food-pasta.webp", tag: "جدید" },
    { id: "food-4", service: "food", vendor: "shandiz", name: "چلوکباب کوبیده", description: "دو سیخ کوبیده، برنج ایرانی و گوجه", price: 480000, icon: "yld-food-azerbaijani.webp", tag: "محبوب" },
    { id: "food-5", service: "food", vendor: "green", name: "سالاد سبز ایرانی", description: "سبزیجات تازه، زیتون و سس لیمو", price: 238000, icon: "yld-food-vegetarian.webp", tag: "سالم" },
    { id: "grocery-1", service: "grocery", vendor: "refah", name: "سبد میوه فصل", description: "ترکیب میوه‌های تازه و دست‌چین", price: 450000, icon: "yld-grocery-fruits.webp", tag: "تازه" },
    { id: "grocery-2", service: "grocery", vendor: "refah", name: "سبد سبزیجات", description: "سبزیجات روز، مناسب چهار نفر", price: 280000, icon: "yld-grocery-vegetables.webp", tag: "ارگانیک" },
    { id: "grocery-3", service: "grocery", vendor: "refah", name: "بسته صبحانه", description: "شیر، پنیر، تخم‌مرغ و نان", price: 390000, icon: "yld-grocery-breakfast.webp", tag: "اقتصادی" },
    { id: "grocery-4", service: "grocery", vendor: "yaran", name: "چای و قهوه ویژه", description: "بسته ترکیبی نوشیدنی گرم", price: 330000, icon: "yld-grocery-tea-coffee.webp", tag: "پرفروش" },
    { id: "pharm-1", service: "pharmacy", vendor: "dr-yazdan", name: "بسته مکمل روزانه", description: "مکمل‌های عمومی با تأیید داروساز", price: 520000, icon: "yld-pharm-otc.webp", tag: "نیازمند تأیید" },
    { id: "pharm-2", service: "pharmacy", vendor: "dr-yazdan", name: "فشارسنج دیجیتال", description: "نمایشگر بزرگ و حافظه اندازه‌گیری", price: 2450000, icon: "yld-pharm-blood-pressure.webp", tag: "تجهیزات پزشکی" },
    { id: "pharm-3", service: "pharmacy", vendor: "shafa", name: "پک مراقبت پوست", description: "محصولات پایه مراقبت روزانه", price: 890000, icon: "yld-pharm-skin-hair.webp", tag: "پوست و مو" }
  ];

  products.push(
    { id: "food-6", service: "food", vendor: "shandiz", name: "آش دوغ ارومیه", description: "آش دوغ محلی با سبزی تازه و نخود", price: 185000, icon: "yld-food-soup.webp", tag: "محلی" },
    { id: "food-7", service: "food", vendor: "burgerbar", name: "مرغ سوخاری تند", description: "سه تکه مرغ سوخاری با سیب‌زمینی و سس تند", price: 348000, icon: "yld-food-fried-chicken.webp", tag: "تند" },
    { id: "food-8", service: "food", vendor: "green", name: "کاسه سلامت", description: "سبزیجات، حبوبات، مرغ گریل و سس لیمو", price: 295000, icon: "yld-food-healthy.webp", tag: "کم‌کالری" },
    { id: "food-9", service: "food", vendor: "romano", name: "لازانیا ایتالیایی", description: "گوشت، پنیر موزارلا و سس گوجه دست‌ساز", price: 385000, icon: "yld-food-italian.webp", tag: "ویژه" },
    { id: "food-10", service: "food", vendor: "green", name: "صبحانه یولدا", description: "پنیر، گردو، عسل، تخم‌مرغ و نان تازه", price: 275000, icon: "yld-food-breakfast.webp", tag: "صبحانه" },
    { id: "food-11", service: "food", vendor: "romano", name: "چیزکیک زعفرانی", description: "چیزکیک نرم با زعفران و پسته", price: 168000, icon: "yld-food-dessert.webp", tag: "شیرین" },
    { id: "food-12", service: "food", vendor: "shandiz", name: "دیزی سنگی", description: "گوشت گوسفندی، نخود، سیب‌زمینی و نان سنگک", price: 435000, icon: "yld-food-azerbaijani.webp", tag: "سنتی" },
    { id: "grocery-5", service: "grocery", vendor: "organic", name: "مرغ تازه روز", description: "مرغ کامل پاک‌شده و بسته‌بندی‌شده", price: 395000, icon: "yld-grocery-poultry.webp", tag: "تازه" },
    { id: "grocery-6", service: "grocery", vendor: "yaran", name: "بسته حبوبات خانواده", description: "عدس، لوبیا، نخود و لپه درجه یک", price: 610000, icon: "yld-grocery-grains.webp", tag: "اقتصادی" },
    { id: "grocery-7", service: "grocery", vendor: "refah", name: "پک مادر و کودک", description: "پوشک، دستمال مرطوب و شوینده ملایم", price: 1150000, icon: "yld-grocery-mother-baby.webp", tag: "ضروری" },
    { id: "pharm-4", service: "pharmacy", vendor: "shafa", name: "ضدآفتاب روزانه", description: "ضدآفتاب سبک مناسب استفاده روزانه", price: 475000, icon: "yld-pharm-skin-hair.webp", tag: "محبوب" },
    { id: "pharm-5", service: "pharmacy", vendor: "dr-yazdan", name: "جعبه کمک‌های اولیه", description: "اقلام ضروری پانسمان و مراقبت اولیه", price: 780000, icon: "yld-pharm-otc.webp", tag: "ضروری" }
  );

  const productSignals = {
    "food-1": { category: "pizza", cuisine: "italian", moods: ["social", "comfort", "exciting"], dietary: ["halal"], spicy: 1, calories: 860, deliveryMinutes: 32, rating: 4.8, popularity: 0.96, mealTimes: ["lunch", "dinner"], aiTags: ["پیتزا", "پنیر", "پپرونی", "سیرکننده"] },
    "food-2": { category: "burger", cuisine: "fastfood", moods: ["comfort", "exciting"], dietary: ["halal"], spicy: 1, calories: 740, deliveryMinutes: 26, rating: 4.7, popularity: 0.91, mealTimes: ["lunch", "dinner"], aiTags: ["برگر", "سریع", "گوشت", "فست‌فود"] },
    "food-3": { category: "pasta", cuisine: "italian", moods: ["comfort", "calm"], dietary: ["halal"], spicy: 0, calories: 670, deliveryMinutes: 34, rating: 4.6, popularity: 0.82, mealTimes: ["lunch", "dinner"], aiTags: ["پاستا", "خامه‌ای", "مرغ", "ایتالیایی"] },
    "food-4": { category: "iranian", cuisine: "iranian", moods: ["traditional", "hungry", "social"], dietary: ["halal", "high-protein"], spicy: 0, calories: 920, deliveryMinutes: 38, rating: 4.9, popularity: 0.98, mealTimes: ["lunch", "dinner"], aiTags: ["کباب", "ایرانی", "برنج", "پروتئین"] },
    "food-5": { category: "salad", cuisine: "healthy", moods: ["light", "fresh", "focused"], dietary: ["vegetarian", "low-calorie"], spicy: 0, calories: 310, deliveryMinutes: 24, rating: 4.5, popularity: 0.72, mealTimes: ["lunch", "dinner"], aiTags: ["سالاد", "سبک", "گیاهی", "تازه"] },
    "food-6": { category: "soup", cuisine: "azerbaijani", moods: ["traditional", "comfort", "warm"], dietary: ["vegetarian"], spicy: 0, calories: 390, deliveryMinutes: 22, rating: 4.8, popularity: 0.88, mealTimes: ["lunch", "dinner"], aiTags: ["آش", "محلی", "ارومیه", "اقتصادی"] },
    "food-7": { category: "fried", cuisine: "fastfood", moods: ["exciting", "social", "hungry"], dietary: ["halal", "high-protein"], spicy: 3, calories: 790, deliveryMinutes: 25, rating: 4.7, popularity: 0.9, mealTimes: ["lunch", "dinner"], aiTags: ["مرغ", "سوخاری", "تند", "سریع"] },
    "food-8": { category: "healthy", cuisine: "healthy", moods: ["light", "fresh", "focused"], dietary: ["low-calorie", "high-protein"], spicy: 0, calories: 430, deliveryMinutes: 28, rating: 4.8, popularity: 0.81, mealTimes: ["lunch", "dinner"], aiTags: ["سالم", "رژیمی", "مرغ", "سبزیجات"] },
    "food-9": { category: "pasta", cuisine: "italian", moods: ["comfort", "social"], dietary: ["halal"], spicy: 0, calories: 720, deliveryMinutes: 36, rating: 4.6, popularity: 0.76, mealTimes: ["lunch", "dinner"], aiTags: ["لازانیا", "پنیر", "ایتالیایی", "گوشت"] },
    "food-10": { category: "breakfast", cuisine: "iranian", moods: ["calm", "fresh", "traditional"], dietary: ["vegetarian"], spicy: 0, calories: 540, deliveryMinutes: 20, rating: 4.7, popularity: 0.79, mealTimes: ["breakfast", "brunch"], aiTags: ["صبحانه", "عسل", "تخم‌مرغ", "تازه"] },
    "food-11": { category: "dessert", cuisine: "dessert", moods: ["sweet", "celebration", "calm"], dietary: ["vegetarian"], spicy: 0, calories: 410, deliveryMinutes: 18, rating: 4.9, popularity: 0.86, mealTimes: ["snack", "dinner"], aiTags: ["دسر", "شیرین", "چیزکیک", "زعفران"] },
    "food-12": { category: "iranian", cuisine: "iranian", moods: ["traditional", "hungry", "comfort"], dietary: ["halal", "high-protein"], spicy: 0, calories: 880, deliveryMinutes: 42, rating: 4.8, popularity: 0.84, mealTimes: ["lunch"], aiTags: ["دیزی", "سنتی", "ایرانی", "سیرکننده"] }
  };

  products.forEach((product) => {
    const signal = productSignals[product.id] || {};
    Object.assign(product, {
      category: signal.category || product.service,
      cuisine: signal.cuisine || product.service,
      moods: signal.moods || ["practical"],
      dietary: signal.dietary || [],
      spicy: signal.spicy || 0,
      calories: signal.calories || null,
      deliveryMinutes: signal.deliveryMinutes || (product.service === "grocery" ? 30 : 35),
      rating: signal.rating || 4.6,
      popularity: signal.popularity || 0.75,
      mealTimes: signal.mealTimes || ["any"],
      aiTags: signal.aiTags || [product.tag, product.name],
      available: true,
      stock: product.service === "food" ? 99 : 12
    });
  });

  const aiQuickPrompts = [
    "یه غذای سریع و اقتصادی می‌خوام",
    "غذای سالم و کم‌کالری پیشنهاد بده",
    "یه چیز تند و هیجان‌انگیز می‌خوام",
    "غذای سنتی ارومیه چی داری؟",
    "برای دو نفر شام چی سفارش بدیم؟",
    "یه دسر شیرین و محبوب پیشنهاد کن"
  ];

  const supportTopics = [
    { id: "order", title: "مشکل سفارش فعال", icon: "yld-ui-orders.webp", priority: "فوری" },
    { id: "payment", title: "پرداخت و بازگشت وجه", icon: "yld-profile-transactions.webp", priority: "مالی" },
    { id: "delivery", title: "ارسال و پیک", icon: "yld-brand-service-courier.webp", priority: "ارسال" },
    { id: "account", title: "حساب و امنیت", icon: "yld-profile-account-security.webp", priority: "حساب" }
  ];

  const desktopNavigation = [
    {
      label: "مشتری",
      items: [
        { title: "خانه", route: "/home", icon: "yld-ui-categories.webp" },
        { title: "همه سرویس‌ها", route: "/services", icon: "yld-ui-view-grid.webp" },
        { title: "پیشنهاد هوشمند", route: "/ai", icon: "yld-discover-recommended.webp" },
        { title: "نزدیک من", route: "/nearby", icon: "yld-map-locate-me.webp" },
        { title: "پیشنهادها", route: "/offers", icon: "yld-discover-discounted.webp" },
        { title: "غذا", route: "/food", icon: "yld-discover-restaurant.webp" },
        { title: "سوپرمارکت", route: "/grocery", icon: "yld-brand-service-grocery.webp" },
        { title: "داروخانه", route: "/pharmacy", icon: "yld-discover-pharmacy.webp" },
        { title: "سبد خرید", route: "/cart", icon: "yld-ui-cart.webp" },
        { title: "سفارش‌ها", route: "/orders", icon: "yld-ui-orders.webp" },
        { title: "باشگاه یولدا", route: "/rewards", icon: "yld-brand-service-loyalty.webp" },
        { title: "پروفایل", route: "/profile", icon: "yld-profile-personal-info.webp" }
      ]
    },
    {
      label: "عملیات",
      items: [
        { title: "پنل پیک", route: "/courier", icon: "yld-brand-service-courier.webp" },
        { title: "پنل فروشنده", route: "/vendor-panel", icon: "yld-brand-service-grocery.webp" },
        { title: "پنل اپراتور", route: "/ops", icon: "yld-ui-view-grid.webp" },
        { title: "مدیریت سفارش‌ها", route: "/ops/orders", icon: "yld-ui-orders.webp" },
        { title: "گزارش‌ها", route: "/ops/reports", icon: "yld-profile-transactions.webp" },
        { title: "کتابخانه آیکون‌ها", route: "/icons", icon: "yld-ui-categories.webp" }
      ]
    },
    {
      label: "ورود و راه‌اندازی",
      items: [
        { title: "ورود", route: "/auth/login", icon: "yld-auth-phone-entry.webp" },
        { title: "کد یکبارمصرف", route: "/auth/otp", icon: "yld-auth-otp-entry.webp" },
        { title: "مجوز موقعیت", route: "/permissions/location", icon: "yld-map-pin.webp" }
      ]
    }
  ];

  window.YOLDA_DATA = {
    icons,
    services,
    categories,
    vendors,
    products,
    aiQuickPrompts,
    supportTopics,
    desktopNavigation
  };
})();
