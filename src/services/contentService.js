import { apiGet, apiPost } from "./api";
import { removeCache } from "./cacheService";
import { CACHE_KEYS } from "../utils/constants";

function titleCase(collection) {
  return collection.charAt(0).toUpperCase() + collection.slice(1);
}

export function getCollection(collection, options = {}) {
  const suffix = titleCase(collection);
  const action = `get${suffix}`;

  if (options.includeDrafts || options.idToken) {
    return apiPost(
      action,
      {
        idToken: options.idToken,
        includeDrafts: Boolean(options.includeDrafts),
      },
      { signal: options.signal },
    );
  }

  return apiGet(action, {}, { signal: options.signal, fallback: [] });
}

export function createCollectionItem(collection, item, idToken) {
  return apiPost(`create${titleCase(collection).slice(0, -1)}`, { idToken, item }).then((response) => {
    removeCache(CACHE_KEYS[collection]);
    removeCache(`${collection}:admin`);
    return response;
  });
}

export function updateCollectionItem(collection, item, idToken) {
  return apiPost(`update${titleCase(collection).slice(0, -1)}`, { idToken, item }).then((response) => {
    removeCache(CACHE_KEYS[collection]);
    removeCache(`${collection}:admin`);
    return response;
  });
}

export function deleteCollectionItem(collection, id, idToken) {
  return apiPost(`delete${titleCase(collection).slice(0, -1)}`, { idToken, id }).then((response) => {
    removeCache(CACHE_KEYS[collection]);
    removeCache(`${collection}:admin`);
    return response;
  });
}
