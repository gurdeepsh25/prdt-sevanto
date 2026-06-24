"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { User } from "@sevanto/shared";

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isHydrated: boolean;
  setSession: (p: {
    user: User;
    accessToken: string;
    refreshToken: string;
  }) => void;
  setUser: (u: User) => void;
  setTokens: (t: { accessToken: string; refreshToken: string }) => void;
  clear: () => void;
  setHydrated: () => void;
}

export const useAuthStore = create<AuthState>()(
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
      name: "sevanto-worker-auth",
      onRehydrateStorage: () => (state) => state?.setHydrated(),
    },
  ),
);
