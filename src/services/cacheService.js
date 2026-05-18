const CACHE_PREFIX = "girl-up-moretti:";
const DEFAULT_TTL = 1000 * 60 * 20;

function safeParse(value) {
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
}

export function readCache(key) {
  if (!key || typeof window === "undefined") return null;

  const payload = safeParse(window.localStorage.getItem(`${CACHE_PREFIX}${key}`));
  if (!payload || !Object.prototype.hasOwnProperty.call(payload, "data")) return null;

  return payload;
}

export function getCachedData(key, fallback = null) {
  const payload = readCache(key);
  return payload ? payload.data : fallback;
}

export function writeCache(key, data, ttl = DEFAULT_TTL) {
  if (!key || typeof window === "undefined") return;

  const payload = {
    data,
    expiresAt: Date.now() + ttl,
    savedAt: Date.now(),
  };

  window.localStorage.setItem(`${CACHE_PREFIX}${key}`, JSON.stringify(payload));
}

export function isCacheStale(key) {
  const payload = readCache(key);
  if (!payload?.expiresAt) return true;
  return Date.now() > payload.expiresAt;
}

export function removeCache(key) {
  if (!key || typeof window === "undefined") return;
  window.localStorage.removeItem(`${CACHE_PREFIX}${key}`);
}
