"use client";

import { ApiClient } from "@sevanto/shared";

let cached: ApiClient | null = null;
export function getDefaultApi(): ApiClient {
  if (cached) return cached;
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3000";
  cached = new ApiClient({ baseUrl, getRefreshToken: () => null });
  return cached;
}
