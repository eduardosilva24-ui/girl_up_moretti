import { apiGet, apiPost } from "./api";
import { removeCache } from "./cacheService";
import { CACHE_KEYS } from "../utils/constants";

function invalidateModules() {
  removeCache(CACHE_KEYS.modules);
  removeCache("modules:admin");
}

export function getModules(options = {}) {
  if (options.includeDrafts || options.idToken) {
    return apiPost(
      "getModules",
      {
        idToken: options.idToken,
        includeDrafts: Boolean(options.includeDrafts),
      },
      { signal: options.signal },
    );
  }

  return apiGet("getModules", {}, { signal: options.signal, fallback: [] });
}

export function getModule(moduleId, options = {}) {
  if (options.idToken) {
    return apiPost(
      "getModule",
      {
        idToken: options.idToken,
        id: moduleId,
      },
      { signal: options.signal },
    );
  }

  return apiGet("getModule", { id: moduleId }, { signal: options.signal, fallback: null });
}

export function createModule(module, idToken) {
  return apiPost("createModule", { idToken, module }).then((response) => {
    invalidateModules();
    return response;
  });
}

export function updateModule(module, idToken) {
  return apiPost("updateModule", { idToken, module }).then((response) => {
    invalidateModules();
    return response;
  });
}

export function deleteModule(moduleId, idToken) {
  return apiPost("deleteModule", { idToken, id: moduleId }).then((response) => {
    invalidateModules();
    return response;
  });
}
