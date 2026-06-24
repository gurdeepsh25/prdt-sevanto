"use client";

import { useMemo } from "react";
import { ApiClient } from "@sevanto/shared";
import { useAuthStore } from "@/stores/auth";

/**
 * Hook returning a memoized API client wired to the current Zustand store.
 */
export function useApi(): ApiClient {
  const accessToken = useAuthStore((s) => s.accessToken);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setTokens = useAuthStore((s) => s.setTokens);
  const clear = useAuthStore((s) => s.clear);

  return useMemo(() => {
    const baseUrl =
      process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
    const client = new ApiClient({
      baseUrl,
      onTokens: ({ accessToken, refreshToken }) =>
        setTokens({ accessToken, refreshToken }),
      onClearTokens: () => clear(),
      getRefreshToken: () => refreshToken,
    });
    client.setAccessToken(accessToken);
    return client;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accessToken, refreshToken]);
}
