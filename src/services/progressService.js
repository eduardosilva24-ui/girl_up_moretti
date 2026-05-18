import { apiPost } from "./api";
import { removeCache } from "./cacheService";

export async function getUserProgress(idToken, options = {}) {
  if (!idToken) return [];

  return apiPost("getUserProgress", { idToken }, { signal: options.signal, retries: 1 });
}

export function saveProgress(moduleId, answers, idToken) {
  return apiPost("saveProgress", {
    idToken,
    moduleId,
    answers,
  }).then((response) => {
    removeCache("progress:me");
    return response;
  });
}
