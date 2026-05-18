import { useCallback } from "react";
import { CACHE_KEYS } from "../utils/constants";
import { getCollection } from "../services/contentService";
import { useAuth } from "./useAuth";
import { useCachedResource } from "./useCachedResource";

const CACHE_BY_COLLECTION = {
  ebooks: CACHE_KEYS.ebooks,
  recommendations: CACHE_KEYS.recommendations,
  supporters: CACHE_KEYS.supporters,
};

export function useContentCollection(collection, options = {}) {
  const { idToken } = useAuth();
  const includeDrafts = Boolean(options.includeDrafts);

  const fetcher = useCallback(
    ({ signal }) =>
      getCollection(collection, {
        signal,
        includeDrafts,
        idToken: includeDrafts ? idToken : "",
      }),
    [collection, idToken, includeDrafts],
  );

  const resource = useCachedResource({
    key: includeDrafts ? `${collection}:admin` : CACHE_BY_COLLECTION[collection],
    fetcher,
    initialData: [],
    enabled: includeDrafts ? Boolean(idToken) : true,
  });

  return {
    ...resource,
    items: Array.isArray(resource.data) ? resource.data : [],
  };
}
