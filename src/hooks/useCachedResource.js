import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { getCachedData, writeCache } from "../services/cacheService";

export function useCachedResource({ key, fetcher, enabled = true, initialData = null, ttl }) {
  const cached = useMemo(() => (key ? getCachedData(key, initialData) : initialData), [key, initialData]);
  const [data, setData] = useState(cached);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(enabled && cached == null);
  const [isRefreshing, setIsRefreshing] = useState(enabled && cached != null);
  const requestIdRef = useRef(0);
  const dataRef = useRef(cached);

  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const refresh = useCallback(async (externalSignal) => {
    if (!enabled) return dataRef.current;

    const requestId = requestIdRef.current + 1;
    requestIdRef.current = requestId;
    const controller = externalSignal ? null : new AbortController();
    const signal = externalSignal || controller.signal;
    const currentData = dataRef.current;

    if (currentData == null) setIsLoading(true);
    if (currentData != null) setIsRefreshing(true);
    setError(null);

    try {
      const nextData = await fetcher({ signal });
      if (!signal.aborted && requestIdRef.current === requestId) {
        setData(nextData);
        if (key) writeCache(key, nextData, ttl);
      }
      return nextData;
    } catch (nextError) {
      if (nextError?.name !== "AbortError" && !signal.aborted && requestIdRef.current === requestId) {
        setError(nextError);
      }
      return dataRef.current;
    } finally {
      if (!signal.aborted && requestIdRef.current === requestId) {
        setIsLoading(false);
        setIsRefreshing(false);
      }
    }
  }, [enabled, fetcher, key, ttl]);

  useEffect(() => {
    if (!enabled) {
      setIsLoading(false);
      setIsRefreshing(false);
      return undefined;
    }

    const controller = new AbortController();
    refresh(controller.signal);

    return () => {
      controller.abort();
    };
  }, [enabled, key, refresh]);

  const mutate = useCallback(
    (updater, shouldWriteCache = true) => {
      setData((current) => {
        const nextData = typeof updater === "function" ? updater(current) : updater;
        if (key && shouldWriteCache) writeCache(key, nextData, ttl);
        return nextData;
      });
    },
    [key, ttl],
  );

  return {
    data,
    error,
    isLoading,
    isRefreshing,
    refresh,
    mutate,
  };
}
