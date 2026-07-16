"use client";

import { createContext, startTransition, useContext, useEffect, useState } from "react";

import { authApi } from "@/lib/api";
import type { User } from "@/types/api";

type AuthStatus = "loading" | "authenticated" | "anonymous";

interface AuthContextValue {
  user: User | null;
  accessToken: string | null;
  status: AuthStatus;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: { email: string; first_name: string; last_name: string; password: string; confirm_password: string }) => Promise<void>;
  logout: () => Promise<void>;
  refreshSession: () => Promise<void>;
  setUser: (user: User) => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [error, setError] = useState<string | null>(null);

  const applyAnonymous = () => {
    startTransition(() => {
      setAccessToken(null);
      setUserState(null);
      setStatus("anonymous");
    });
  };

  const refreshSession = async () => {
    try {
      const refreshResponse = await authApi.refresh();
      const nextAccessToken = refreshResponse.data.access;
      const meResponse = await authApi.me(nextAccessToken);
      startTransition(() => {
        setAccessToken(nextAccessToken);
        setUserState(meResponse.data);
        setStatus("authenticated");
        setError(null);
      });
    } catch {
      applyAnonymous();
    }
  };

  useEffect(() => {
    const bootstrapSession = async () => {
      try {
        const refreshResponse = await authApi.refresh();
        const nextAccessToken = refreshResponse.data.access;
        const meResponse = await authApi.me(nextAccessToken);
        startTransition(() => {
          setAccessToken(nextAccessToken);
          setUserState(meResponse.data);
          setStatus("authenticated");
          setError(null);
        });
      } catch {
        applyAnonymous();
      }
    };
    void bootstrapSession();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authApi.login({ email, password });
    startTransition(() => {
      setAccessToken(response.data.access);
      setUserState(response.data.user);
      setStatus("authenticated");
      setError(null);
    });
  };

  const register = async (input: { email: string; first_name: string; last_name: string; password: string; confirm_password: string }) => {
    await authApi.register(input);
    await login(input.email, input.password);
  };

  const logout = async () => {
    try {
      await authApi.logout(accessToken);
    } finally {
      applyAnonymous();
    }
  };

  const value: AuthContextValue = { user, accessToken, status, error, login, register, logout, refreshSession, setUser: setUserState };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within AuthProvider");
  }
  return context;
}
