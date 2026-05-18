export class ApiError extends Error {
  constructor(message, code = "API_ERROR", status = 500) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.status = status;
  }
}

const API_URL = import.meta.env.VITE_APPS_SCRIPT_URL?.trim();

const EMPTY_RESPONSES = {
  getModules: [],
  getPosts: [],
  getEbooks: [],
  getRecommendations: [],
  getSupporters: [],
  getUserProgress: [],
  getComments: { items: [], nextOffset: null, total: 0 },
};

function cloneEmpty(action, fallback) {
  const value = fallback ?? EMPTY_RESPONSES[action] ?? null;
  return value == null ? value : JSON.parse(JSON.stringify(value));
}

export function isApiConfigured() {
  return Boolean(API_URL);
}

function buildUrl(action, params = {}) {
  const url = new URL(API_URL);
  url.searchParams.set("action", action);

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return url.toString();
}

async function parseResponse(response) {
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};

  if (!response.ok || payload.success === false) {
    throw new ApiError(
      payload.error?.message || payload.message || "Não foi possível concluir a solicitação.",
      payload.error?.code || "API_ERROR",
      response.status,
    );
  }

  return Object.prototype.hasOwnProperty.call(payload, "data") ? payload.data : payload;
}

async function withRetry(requestFactory, retries = 1) {
  let lastError;

  for (let attempt = 0; attempt <= retries; attempt += 1) {
    try {
      return await requestFactory();
    } catch (error) {
      lastError = error;
      if (error?.name === "AbortError" || attempt === retries) break;
      await new Promise((resolve) => window.setTimeout(resolve, 350 * (attempt + 1)));
    }
  }

  throw lastError;
}

export async function apiGet(action, params = {}, options = {}) {
  if (!isApiConfigured()) {
    return cloneEmpty(action, options.fallback);
  }

  return withRetry(
    () =>
      fetch(buildUrl(action, params), {
        method: "GET",
        signal: options.signal,
      }).then(parseResponse),
    options.retries ?? 1,
  );
}

export async function apiPost(action, payload = {}, options = {}) {
  if (!isApiConfigured()) {
    throw new ApiError(
      "A API do Google Apps Script ainda não foi configurada.",
      "API_NOT_CONFIGURED",
      503,
    );
  }

  return withRetry(
    () =>
      fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "text/plain;charset=utf-8",
        },
        body: JSON.stringify({ action, ...payload }),
        signal: options.signal,
      }).then(parseResponse),
    options.retries ?? 1,
  );
}
