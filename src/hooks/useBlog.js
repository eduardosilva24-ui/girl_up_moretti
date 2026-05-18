import { useCallback } from "react";
import { CACHE_KEYS } from "../utils/constants";
import { getPosts } from "../services/blogService";
import { useAuth } from "./useAuth";
import { useCachedResource } from "./useCachedResource";

export function useBlog(options = {}) {
  const { idToken, user } = useAuth();
  const includeDrafts = Boolean(options.includeDrafts);

  const fetcher = useCallback(
    ({ signal }) =>
      getPosts({
        signal,
        includeDrafts,
        idToken: idToken || "",
      }),
    [idToken, includeDrafts],
  );

  const resource = useCachedResource({
    key: includeDrafts ? "posts:admin" : user ? `${CACHE_KEYS.posts}:${user.id}` : CACHE_KEYS.posts,
    fetcher,
    initialData: [],
    enabled: includeDrafts ? Boolean(idToken) : true,
  });

  return {
    ...resource,
    posts: Array.isArray(resource.data) ? resource.data : [],
  };
}
