(function () {
  "use strict";

  const FEATURE_KEYS = [
    "economic", "premium", "fast", "healthy", "light", "hungry", "comfort",
    "exciting", "traditional", "social", "sweet", "spicy", "vegetarian",
    "high-protein", "low-calorie", "iranian", "azerbaijani", "italian",
    "fastfood", "breakfast", "dessert"
  ];

  const keywordRules = [
    { words: ["ارزان", "اقتصادی", "کم هزینه", "به صرفه", "بودجه"], set: { economic: 1 }, budget: 280000 },
    { words: ["گران", "خاص", "پریمیوم", "لاکچری", "ویژه"], set: { premium: 1 }, budget: 700000 },
    { words: ["سریع", "فوری", "زود", "عجله"], set: { fast: 1 }, maxDelivery: 28 },
    { words: ["سالم", "رژیمی", "فیت", "کم کالری", "سلامتی"], set: { healthy: 1, "low-calorie": 1, light: 0.8 } },
    { words: ["سبک", "کم حجم"], set: { light: 1, healthy: 0.6 } },
    { words: ["خیلی گرسنه", "سیرکننده", "پر حجم", "گرسنه"], set: { hungry: 1, "high-protein": 0.7 } },
    { words: ["خونگی", "خانگی", "آرام", "دلچسب"], set: { comfort: 1 } },
    { words: ["هیجان", "هیجان انگیز", "متفاوت"], set: { exciting: 1 } },
    { words: ["سنتی", "محلی", "قدیمی"], set: { traditional: 1, iranian: 0.5 } },
    { words: ["دونفره", "دو نفر", "مهمانی", "جمعی", "دوستانه"], set: { social: 1 } },
    { words: ["شیرین", "دسر", "کیک"], set: { sweet: 1, dessert: 1 }, category: "dessert" },
    { words: ["تند", "اسپایسی", "فلفلی"], set: { spicy: 1 }, spicy: 3 },
    { words: ["گیاهی", "گیاهخوار", "بدون گوشت"], set: { vegetarian: 1 }, dietary: "vegetarian" },
    { words: ["پروتئین", "ورزشی", "بدنسازی"], set: { "high-protein": 1 } },
    { words: ["ایرانی", "کباب", "دیزی", "چلو"], set: { iranian: 1 }, cuisine: "iranian" },
    { words: ["ارومیه", "آذربایجانی", "آش دوغ", "آش"], set: { azerbaijani: 1, traditional: 0.8 }, cuisine: "azerbaijani" },
    { words: ["ایتالیایی", "پیتزا", "پاستا", "لازانیا"], set: { italian: 1 }, cuisine: "italian" },
    { words: ["فست فود", "برگر", "سوخاری"], set: { fastfood: 1, exciting: 0.5 }, cuisine: "fastfood" },
    { words: ["صبحانه", "صبح", "بر brunch"], set: { breakfast: 1 }, mealTime: "breakfast" }
  ];

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[يى]/g, "ی")
      .replace(/ك/g, "ک")
      .replace(/[أإ]/g, "ا")
      .replace(/ة/g, "ه")
      .replace(/[\u064B-\u065F]/g, "")
      .replace(/[^\p{L}\p{N}\s-]/gu, " ")
      .replace(/\s+/g, " ")
      .trim();
  }

  function currentMealTime(date = new Date()) {
    const hour = date.getHours();
    if (hour >= 5 && hour < 11) return "breakfast";
    if (hour >= 11 && hour < 16) return "lunch";
    if (hour >= 16 && hour < 19) return "snack";
    return "dinner";
  }

  function emptyVector() {
    return Object.fromEntries(FEATURE_KEYS.map((key) => [key, 0]));
  }

  function mergeVector(target, source) {
    Object.entries(source || {}).forEach(([key, value]) => {
      target[key] = Math.max(target[key] || 0, Number(value) || 0);
    });
    return target;
  }

  function parseNaturalLanguage(text) {
    const normalized = normalize(text);
    const profile = {
      text: normalized,
      vector: emptyVector(),
      budget: null,
      maxDelivery: null,
      cuisine: null,
      category: null,
      dietary: [],
      exclusions: [],
      spicy: null,
      mealTime: currentMealTime(),
      recognized: []
    };

    keywordRules.forEach((rule) => {
      const hit = rule.words.find((word) => normalized.includes(normalize(word)));
      if (!hit) return;
      mergeVector(profile.vector, rule.set);
      if (rule.budget) profile.budget = rule.budget;
      if (rule.maxDelivery) profile.maxDelivery = rule.maxDelivery;
      if (rule.cuisine) profile.cuisine = rule.cuisine;
      if (rule.category) profile.category = rule.category;
      if (rule.dietary && !profile.dietary.includes(rule.dietary)) profile.dietary.push(rule.dietary);
      if (rule.spicy !== undefined) profile.spicy = rule.spicy;
      if (rule.mealTime) profile.mealTime = rule.mealTime;
      profile.recognized.push(hit);
    });

    const explicitBudget = normalized.match(/(?:تا|زیر)\s*([۰-۹0-9٬,]+)\s*(?:هزار|تومن|تومان)/);
    if (explicitBudget) {
      const raw = toEnglishDigits(explicitBudget[1]).replace(/[٬,]/g, "");
      let amount = Number(raw);
      if (normalized.slice(explicitBudget.index, explicitBudget.index + explicitBudget[0].length).includes("هزار")) amount *= 1000;
      if (Number.isFinite(amount) && amount > 0) profile.budget = amount;
    }

    const exclusions = normalized.matchAll(/بدون\s+([\p{L}\p{N}-]+)/gu);
    for (const match of exclusions) {
      if (match[1] && !profile.exclusions.includes(match[1])) profile.exclusions.push(match[1]);
    }

    return profile;
  }

  function profileFromSelections(values = {}) {
    const vector = emptyVector();
    const mood = values.mood || "comfort";
    const exclusions = String(values.exclusions || "")
      .split(/[،,]/)
      .map((item) => normalize(item))
      .filter(Boolean);
    vector[mood] = 1;
    if (values.goal === "healthy") mergeVector(vector, { healthy: 1, "low-calorie": 0.8, light: 0.7 });
    if (values.goal === "filling") mergeVector(vector, { hungry: 1, "high-protein": 0.7 });
    if (values.goal === "fast") mergeVector(vector, { fast: 1 });
    if (values.cuisine && vector[values.cuisine] !== undefined) vector[values.cuisine] = 1;
    if (values.dietary === "vegetarian") vector.vegetarian = 1;
    if (values.spicy === "high") vector.spicy = 1;

    return {
      text: "",
      vector,
      budget: values.budget ? Number(values.budget) : null,
      maxDelivery: values.maxDelivery ? Number(values.maxDelivery) : null,
      cuisine: values.cuisine || null,
      category: null,
      dietary: values.dietary && values.dietary !== "none" ? [values.dietary] : [],
      exclusions: [...new Set(exclusions)],
      spicy: values.spicy === "high" ? 3 : values.spicy === "low" ? 0 : null,
      mealTime: values.mealTime || currentMealTime(),
      priority: values.goal || "",
      recognized: [mood, values.goal, values.cuisine, ...exclusions].filter(Boolean)
    };
  }

  function productVector(product) {
    const vector = emptyVector();
    const moods = new Set(product.moods || []);
    ["hungry", "comfort", "exciting", "traditional", "social", "sweet"].forEach((feature) => {
      if (moods.has(feature)) vector[feature] = 1;
    });
    if (["fresh", "focused", "light"].some((mood) => moods.has(mood)) || product.dietary.includes("low-calorie")) vector.healthy = 1;
    if (["light", "fresh"].some((mood) => moods.has(mood)) || product.dietary.includes("low-calorie")) vector.light = 1;
    if (["warm", "calm"].some((mood) => moods.has(mood))) vector.comfort = Math.max(vector.comfort, 0.8);
    if (moods.has("celebration")) vector.social = Math.max(vector.social, 0.7);
    if (product.spicy >= 2) vector.spicy = 1;
    if (product.dietary.includes("vegetarian")) vector.vegetarian = 1;
    if (product.dietary.includes("high-protein")) vector["high-protein"] = 1;
    if (product.dietary.includes("low-calorie")) vector["low-calorie"] = 1;
    if (["iranian", "azerbaijani", "italian", "fastfood"].includes(product.cuisine)) vector[product.cuisine] = 1;
    if (product.category === "breakfast") vector.breakfast = 1;
    if (product.category === "dessert") vector.dessert = 1;
    if (product.price <= 280000) vector.economic = 1;
    if (product.price >= 450000) vector.premium = 0.8;
    if (product.deliveryMinutes <= 28) vector.fast = 1;
    return vector;
  }

  function cosineSimilarity(a, b) {
    let dot = 0;
    let normA = 0;
    let normB = 0;
    FEATURE_KEYS.forEach((key) => {
      const av = Number(a[key]) || 0;
      const bv = Number(b[key]) || 0;
      dot += av * bv;
      normA += av * av;
      normB += bv * bv;
    });
    if (!normA || !normB) return 0;
    return dot / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  function tokenSimilarity(text, product) {
    const tokens = normalize(text).split(" ").filter((token) => token.length > 2);
    if (!tokens.length) return 0;
    const haystack = normalize([product.name, product.description, ...(product.aiTags || [])].join(" "));
    const hits = tokens.filter((token) => haystack.includes(token)).length;
    return hits / tokens.length;
  }

  function scoreProduct(product, profile, options = {}) {
    if (!product.available || product.service !== (options.service || "food")) return null;
    if ((profile.dietary || []).some((need) => !product.dietary.includes(need))) return null;
    const productText = normalize([product.name, product.description, ...(product.aiTags || [])].join(" "));
    if ((profile.exclusions || []).some((term) => productText.includes(normalize(term)))) return null;

    const semantic = cosineSimilarity(profile.vector, productVector(product));
    const lexical = tokenSimilarity(profile.text, product);
    const budgetFit = profile.budget
      ? Math.max(0, 1 - Math.max(0, product.price - profile.budget) / Math.max(profile.budget, 1))
      : 0.72;
    const deliveryFit = profile.maxDelivery
      ? Math.max(0, 1 - Math.max(0, product.deliveryMinutes - profile.maxDelivery) / 30)
      : Math.max(0.35, 1 - product.deliveryMinutes / 75);
    const cuisineFit = profile.cuisine ? (product.cuisine === profile.cuisine ? 1 : 0.1) : 0.65;
    const categoryFit = profile.category ? (product.category === profile.category ? 1 : 0.15) : 0.65;
    const spicyFit = profile.spicy === null
      ? 0.7
      : Math.max(0, 1 - Math.abs((product.spicy || 0) - profile.spicy) / 3);
    const mealFit = product.mealTimes.includes("any") || product.mealTimes.includes(profile.mealTime) ? 1 : 0.45;
    const quality = ((product.rating || 4) / 5) * 0.65 + (product.popularity || 0.5) * 0.35;
    const feedback = Number(options.feedback?.[product.id] || 0);
    const deliveryWeight = profile.priority === "fast" ? 14 : 10;
    const qualityWeight = profile.priority === "popular" ? 15 : 7;

    const raw =
      semantic * 31 +
      lexical * 14 +
      budgetFit * 14 +
      deliveryFit * deliveryWeight +
      cuisineFit * 9 +
      categoryFit * 7 +
      spicyFit * 4 +
      mealFit * 4 +
      quality * qualityWeight +
      feedback * 3;

    const reasons = [];
    if (semantic >= 0.45) reasons.push("با حال‌وهوای انتخابی‌ات هماهنگ است");
    if (lexical >= 0.25) reasons.push("به چیزی که نوشتی نزدیک است");
    if (profile.budget && product.price <= profile.budget) reasons.push("داخل بودجه توست");
    if (profile.maxDelivery && product.deliveryMinutes <= profile.maxDelivery) reasons.push("در زمان دلخواهت می‌رسد");
    if (profile.cuisine && product.cuisine === profile.cuisine) reasons.push("از سبک غذایی موردعلاقه توست");
    if (profile.priority === "popular" && product.rating >= 4.7) reasons.push("از انتخاب‌های محبوب کاربران است");
    if (product.rating >= 4.8) reasons.push("امتیاز کاربرانش بالاست");
    if (product.cuisine === "azerbaijani") reasons.push("انتخاب محلی ارومیه است");
    if (!reasons.length) reasons.push("بر اساس محبوبیت و کیفیت انتخاب شده");

    return {
      product,
      rawScore: raw,
      score: Math.max(1, Math.min(99, Math.round(raw))),
      reasons: reasons.slice(0, 3),
      signals: { semantic, lexical, budgetFit, deliveryFit, cuisineFit, quality }
    };
  }

  function productSimilarity(a, b) {
    return cosineSimilarity(productVector(a), productVector(b));
  }

  function diversify(candidates, limit) {
    const selected = [];
    const pool = [...candidates];
    while (selected.length < limit && pool.length) {
      let bestIndex = 0;
      let bestValue = -Infinity;
      pool.forEach((candidate, index) => {
        const similarityPenalty = selected.length
          ? Math.max(...selected.map((item) => productSimilarity(candidate.product, item.product)))
          : 0;
        const value = candidate.rawScore * 0.82 - similarityPenalty * 18;
        if (value > bestValue) {
          bestValue = value;
          bestIndex = index;
        }
      });
      selected.push(pool.splice(bestIndex, 1)[0]);
    }
    return selected;
  }

  function recommend(products, profile, options = {}) {
    const candidates = products
      .map((product) => scoreProduct(product, profile, options))
      .filter(Boolean)
      .sort((a, b) => b.rawScore - a.rawScore);
    const results = diversify(candidates, options.limit || 6);
    const recognizedCount = profile.recognized?.length || 0;
    const margin = results.length > 1 ? results[0].rawScore - results[1].rawScore : 0;
    const confidence = Math.min(96, Math.round(52 + recognizedCount * 6 + Math.max(0, margin) * 1.5));
    return {
      profile,
      results,
      confidence,
      summary: makeSummary(profile, results),
      generatedAt: new Date().toISOString()
    };
  }

  function makeSummary(profile, results) {
    if (!results.length) return "گزینه‌ای با همه محدودیت‌ها پیدا نشد؛ یکی از فیلترها را بازتر کن.";
    const bits = [];
    if (profile.budget) bits.push(`بودجه تا ${new Intl.NumberFormat("fa-IR").format(profile.budget)} تومان`);
    if (profile.maxDelivery) bits.push(`تحویل تا ${new Intl.NumberFormat("fa-IR").format(profile.maxDelivery)} دقیقه`);
    if (profile.cuisine) bits.push("سبک غذایی انتخابی");
    if (profile.dietary?.length) bits.push("محدودیت غذایی");
    if (profile.exclusions?.length) bits.push("مواد حذف‌شده");
    return bits.length
      ? `این پیشنهادها با ${bits.join("، ")} مرتب شده‌اند.`
      : "پیشنهادها با ترکیب کیفیت، محبوبیت، زمان ارسال و سلیقه تو مرتب شده‌اند.";
  }

  function toEnglishDigits(value) {
    const fa = "۰۱۲۳۴۵۶۷۸۹";
    const ar = "٠١٢٣٤٥٦٧٨٩";
    return String(value).replace(/[۰-۹٠-٩]/g, (digit) => {
      const faIndex = fa.indexOf(digit);
      return faIndex >= 0 ? String(faIndex) : String(ar.indexOf(digit));
    });
  }

  window.YOLDA_RECOMMENDER = {
    normalize,
    parseNaturalLanguage,
    profileFromSelections,
    recommend,
    currentMealTime
  };
})();
