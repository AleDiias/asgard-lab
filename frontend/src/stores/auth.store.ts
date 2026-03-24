import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthUser } from "@/types/auth.types";

const AUTH_STORAGE_KEY = "asgard-auth";

interface AuthState {
  token: string | null;
  user: AuthUser | null;
  permissions: string[];
  features: string[];
  isAuthenticated: boolean;

  setAuth: (data: { token: string; user: AuthUser }) => void;
  clearAuth: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      permissions: [],
      features: [],
      isAuthenticated: false,

      setAuth: (data) =>
        set({
          token: data.token,
          user: data.user,
          permissions: data.user.permissions ?? [],
          features: data.user.features ?? [],
          isAuthenticated: true,
        }),

      clearAuth: () =>
        set({
          token: null,
          user: null,
          permissions: [],
          features: [],
          isAuthenticated: false,
        }),
    }),
    { name: AUTH_STORAGE_KEY }
  )
);
