(function () {
  "use strict";

  // Local brand and the supplied Yolda loader are active for both loading contexts.
  const localAssetSwitches = Object.freeze({
    brand: true,
    pageLoader: true,
    aiLoader: true
  });
  const current = window.YOLDA_CONFIG || {};
  const currentAssets = current.assets || {};
  const currentBrand = currentAssets.brand || {};
  const currentPageLoader = currentAssets.pageLoader || {};
  const currentAiLoader = currentAssets.aiLoader || {};

  const mediaAsset = (source, defaults) => Object.freeze({
    enabled: source.enabled ?? defaults.enabled,
    webm: source.webm || defaults.webm,
    mp4: source.mp4 || defaults.mp4,
    poster: source.poster || defaults.poster
  });

  window.YOLDA_CONFIG = Object.freeze({
    mode: current.mode || "demo",
    apiBaseUrl: current.apiBaseUrl || "",
    requestTimeoutMs: Number(current.requestTimeoutMs) || 10000,
    clientVersion: "3.1.2",
    city: Object.freeze({
      code: current.city?.code || "urmia",
      name: current.city?.name || "ارومیه"
    }),
    assets: Object.freeze({
      brand: Object.freeze({
        enabled: currentBrand.enabled ?? localAssetSwitches.brand,
        symbol: currentBrand.symbol || "assets/brand/yolda-logo.png",
        symbolLight: currentBrand.symbolLight || "assets/brand/yolda-logo.png",
        logo: currentBrand.logo || "assets/brand/yolda-logo.png",
        logoLight: currentBrand.logoLight || "assets/brand/yolda-logo.png",
        favicon: currentBrand.favicon || "assets/brand/yolda-logo.png"
      }),
      pageLoader: mediaAsset(currentPageLoader, {
        enabled: localAssetSwitches.pageLoader,
        webm: "assets/media/yolda-loading.webm",
        mp4: "",
        poster: ""
      }),
      aiLoader: mediaAsset(currentAiLoader, {
        enabled: localAssetSwitches.aiLoader,
        webm: "assets/media/yolda-loading.webm",
        mp4: "",
        poster: ""
      })
    }),
    featureFlags: Object.freeze({
      localRecommender: true,
      remoteRecommender: false,
      prescription: true,
      packageDelivery: true,
      ...(current.featureFlags || {})
    })
  });
})();
