(function () {
  "use strict";

  const config = window.YOLDA_CONFIG;
  const accessTokenKey = "yolda-access-token";

  class ApiError extends Error {
    constructor(message, options = {}) {
      super(message);
      this.name = "ApiError";
      this.status = options.status || 0;
      this.code = options.code || "unknown_error";
      this.details = options.details || null;
    }
  }

  function isDemo() {
    return config.mode !== "live" || !config.apiBaseUrl;
  }

  function getAccessToken() {
    try {
      return sessionStorage.getItem(accessTokenKey) || "";
    } catch (error) {
      return "";
    }
  }

  function setAccessToken(token) {
    try {
      if (token) sessionStorage.setItem(accessTokenKey, token);
      else sessionStorage.removeItem(accessTokenKey);
    } catch (error) {
      // Session storage is an enhancement, not a requirement.
    }
  }

  function makeIdempotencyKey() {
    if (crypto.randomUUID) return crypto.randomUUID();
    return `yolda-${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }

  async function refreshAccessToken() {
    if (isDemo()) return false;
    try {
      const response = await fetch(`${config.apiBaseUrl.replace(/\/$/, "")}/v1/auth/token/refresh`, {
        method: "POST",
        headers: { Accept: "application/json", "X-Yolda-Client": config.clientVersion },
        credentials: "include"
      });
      if (!response.ok) return false;
      const payload = await response.json();
      if (!payload?.accessToken) return false;
      setAccessToken(payload.accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  async function parseResponse(response) {
    const contentType = response.headers.get("content-type") || "";
    const payload = contentType.includes("application/json")
      ? await response.json().catch(() => null)
      : await response.text().catch(() => "");

    if (!response.ok) {
      throw new ApiError(payload?.message || payload?.detail || "درخواست با خطا مواجه شد", {
        status: response.status,
        code: payload?.code || `http_${response.status}`,
        details: payload
      });
    }
    return payload;
  }

  async function request(path, options = {}) {
    if (isDemo()) throw new ApiError("API در حالت نمایشی غیرفعال است", { code: "demo_mode" });

    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), config.requestTimeoutMs);
    const token = getAccessToken();
    const method = (options.method || "GET").toUpperCase();
    const headers = {
      Accept: "application/json",
      "X-Yolda-Client": config.clientVersion,
      "X-Yolda-City": config.city.code,
      ...(options.headers || {})
    };

    if (token) headers.Authorization = `Bearer ${token}`;
    if (options.body && !(options.body instanceof FormData)) headers["Content-Type"] = "application/json";
    if (["POST", "PUT", "PATCH"].includes(method) && !headers["Idempotency-Key"]) {
      headers["Idempotency-Key"] = makeIdempotencyKey();
    }

    try {
      const response = await fetch(`${config.apiBaseUrl.replace(/\/$/, "")}${path}`, {
        method,
        headers,
        body: options.body instanceof FormData ? options.body : options.body ? JSON.stringify(options.body) : undefined,
        credentials: "include",
        signal: controller.signal
      });
      if (response.status === 401 && !options.skipAuthRefresh && !path.startsWith("/v1/auth/")) {
        const refreshed = await refreshAccessToken();
        if (refreshed) return request(path, { ...options, headers, skipAuthRefresh: true });
      }
      return await parseResponse(response);
    } catch (error) {
      if (error.name === "AbortError") throw new ApiError("زمان پاسخ سرور به پایان رسید", { code: "timeout" });
      if (error instanceof ApiError) throw error;
      throw new ApiError("ارتباط با سرور برقرار نشد", { code: "network_error", details: error.message });
    } finally {
      window.clearTimeout(timeout);
    }
  }

  const demoDelay = (result, delay = 260) => new Promise((resolve) => window.setTimeout(() => resolve(result), delay));
  const useDemoOrRequest = (demoResult, path, options) => isDemo() ? demoDelay(demoResult) : request(path, options);

  const auth = {
    requestOtp(phone) {
      return useDemoOrRequest({ requestId: `demo-${Date.now()}`, expiresIn: 120 }, "/v1/auth/otp/request", {
        method: "POST",
        body: { phone }
      });
    },
    async verifyOtp(phone, code) {
      const result = await useDemoOrRequest({ accessToken: "demo-session", user: { displayName: "سارا محمدی" } }, "/v1/auth/otp/verify", {
        method: "POST",
        body: { phone, code }
      });
      if (result?.accessToken) setAccessToken(result.accessToken);
      return result;
    },
    logout() {
      setAccessToken("");
      return isDemo() ? demoDelay({ ok: true }, 100) : request("/v1/auth/logout", { method: "POST" });
    },
    refresh: refreshAccessToken
  };

  const orders = {
    create(payload) {
      return useDemoOrRequest({ id: `YL-${Date.now().toString().slice(-6)}`, status: "placed" }, "/v1/orders", {
        method: "POST",
        body: payload
      });
    },
    list() {
      return useDemoOrRequest([], "/v1/orders", { method: "GET" });
    },
    cancel(orderId, reason) {
      return useDemoOrRequest({ id: orderId, status: "cancelled" }, `/v1/orders/${encodeURIComponent(orderId)}/cancel`, {
        method: "POST",
        body: { reason }
      });
    }
  };

  const support = {
    createTicket(payload) {
      return useDemoOrRequest({ id: `SUP-${Date.now().toString().slice(-5)}`, status: "open" }, "/v1/support/tickets", {
        method: "POST",
        body: payload
      });
    }
  };

  window.YOLDA_API = Object.freeze({
    ApiError,
    auth,
    orders,
    support,
    request,
    isDemo
  });
})();
