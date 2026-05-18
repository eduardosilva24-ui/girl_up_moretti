import { useCallback } from "react";
import { CACHE_KEYS } from "../utils/constants";
import { getModules } from "../services/moduleService";
import { getUserProgress } from "../services/progressService";
import { useAuth } from "./useAuth";
import { useCachedResource } from "./useCachedResource";

export function useModules(options = {}) {
  const { idToken } = useAuth();
  const includeDrafts = Boolean(options.includeDrafts);

  const fetcher = useCallback(
    ({ signal }) =>
      getModules({
        signal,
        includeDrafts,
        idToken: includeDrafts ? idToken : "",
      }),
    [idToken, includeDrafts],
  );

  const resource = useCachedResource({
    key: includeDrafts ? "modules:admin" : CACHE_KEYS.modules,
    fetcher,
    initialData: [],
    enabled: includeDrafts ? Boolean(idToken) : true,
  });

  return {
    ...resource,
    modules: Array.isArray(resource.data) ? resource.data : [],
  };
}

export function useUserProgress() {
  const { idToken, isAuthenticated } = useAuth();

  const fetcher = useCallback(
    ({ signal }) => getUserProgress(idToken, { signal }),
    [idToken],
  );

  const resource = useCachedResource({
    key: isAuthenticated ? "progress:me" : "progress:anonymous",
    fetcher,
    initialData: [],
    enabled: isAuthenticated,
    ttl: 1000 * 60 * 3,
  });

  return {
    ...resource,
    progress: Array.isArray(resource.data) ? resource.data : [],
  };
}
