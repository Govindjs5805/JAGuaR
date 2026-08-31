import { create } from "zustand";
import { User, LoginRequest } from "../types/api";
import { authService } from "../api/auth";
import { logInsight } from "../api/insights";

interface AuthState {
  user: User | null;
  name: string | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isLoading: boolean;
  error: string | null;

  // Login flow state
  isUsernameVerified: boolean;
  verifiedUsername: string | null;

  // Actions
  lookupUsername: (username: string) => Promise<string[]>;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => Promise<void>;
  checkAuthStatus: () => Promise<void>;
  fetchCurrentUser: () => Promise<void>;
  clearError: () => void;
  resetLoginFlow: () => void;
  clearData: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  name: null,
  isLoading: false,
  error: null,
  isUsernameVerified: false,
  verifiedUsername: null,

  lookupUsername: async (username: string) => {
    set({ isLoading: true, error: null });

    try {
      const { users } = await authService.lookupUsername(username);

      if (users.length > 0) {
        set({
          isUsernameVerified: true,
          verifiedUsername: users[0],
          isLoading: false,
          error: null,
        });
        return users;
      } else {
        set({
          isUsernameVerified: false,
          verifiedUsername: null,
          isLoading: false,
          error: "Username not found",
        });
        throw new Error("Username not found");
      }
    } catch (error: any) {
      set({
        isUsernameVerified: false,
        verifiedUsername: null,
        isLoading: false,
        error: error.message || "Username lookup failed",
      });
      throw error;
    }
  },

  login: async (credentials: LoginRequest) => {
    set({ isLoading: true, error: null });

    try {
      await authService.login(credentials);

      const { user, first_name, last_name } =
        await authService.getCurrentUser();

      const name = `${first_name || ""} ${last_name || ""}`.trim();

      set({
        user,
        name,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isUsernameVerified: false,
        verifiedUsername: null,
      });

      logInsight(name);
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error.message || "Login failed",
      });
      throw error;
    }
  },

  logout: async () => {
    set({ isLoading: true });

    try {
      await authService.logout();
    } catch (error: any) {
      console.warn("Logout error:", error);
    } finally {
      set({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isUsernameVerified: false,
        verifiedUsername: null,
      });
    }
  },

  checkAuthStatus: async () => {
    set({ isInitializing: true });
    try {
      const isAuthenticated = await authService.isAuthenticated();

      if (isAuthenticated) {
        const { user, first_name, last_name } =
          await authService.getCurrentUser();
        const name = `${first_name || ""} ${last_name || ""}`.trim();
        set({
          user,
          name,
          isAuthenticated: true,
          isInitializing: false,
          isLoading: false,
        });
        logInsight(name);
      } else {
        set({
          user: null,
          isAuthenticated: false,
          isInitializing: false,
          isLoading: false,
        });
      }
    } catch (error: any) {
      set({
        user: null,
        isAuthenticated: false,
        isInitializing: false,
        isLoading: false,
        error: error?.message || "Failed to check authentication status",
      });
    }
  },

  fetchCurrentUser: async () => {
    set({ isLoading: true });

    try {
      const { user, first_name, last_name } =
        await authService.getCurrentUser();
      set({
        user,
        name: `${first_name || ""} ${last_name || ""}`,
        isLoading: false,
        error: null,
      });
    } catch (error: any) {
      set({
        isLoading: false,
        error: error.message || "Failed to fetch user data",
      });
    }
  },

  clearError: () => set({ error: null }),

  resetLoginFlow: () =>
    set({
      isUsernameVerified: false,
      verifiedUsername: null,
      error: null,
    }),

  clearData: () => {
    set({
      user: null,
      name: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      verifiedUsername: null,
      isUsernameVerified: false,
    });
  },
}));
