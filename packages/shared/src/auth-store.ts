"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "./types";

/**
 * Auth store — Zustand with localStorage persistence for the access token.
 * The refresh token should live in an HttpOnly cookie set by the server.
 *
 * For SSR-safe usage, only mount this on the client side. The `useAuthStore`
 * hook handles hydration transparently.
 */

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;

  setSession: (payload: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setUser: (user: User) => void;
  setTokens: (tokens: { accessToken: string; refreshToken: string }) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const createAuthStore = () =>
  create<AuthState>()(
    persist(
      (set) => ({
        user: null,
        accessToken: null,
        refreshToken: null,
        isHydrated: false,

        setSession: ({ user, accessToken, refreshToken }) =>
          set({ user, accessToken, refreshToken }),

        setUser: (user) => set({ user }),

        setTokens: ({ accessToken, refreshToken }) =>
          set({ accessToken, refreshToken }),

        clear: () => set({ user: null, accessToken: null, refreshToken: null }),

        setHydrated: () => set({ isHydrated: true }),
      }),
      {
        name: "sevanto-auth",
        onRehydrateStorage: () => (state) => {
          state?.setHydrated();
        },
      },
    ),
  );
