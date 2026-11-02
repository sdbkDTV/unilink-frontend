import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokens } from "./tokens";
import type { LoginResponse } from "./types";

const baseURL = import.meta.env?.VITE_API_URL || "http://localhost:8080";

export const client = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  paramsSerializer: { indexes: null },
});

export const api = client;

client.interceptors.request.use((config) => {
  const access = tokens.getAccess();
  if (access) {
    config.headers.Authorization = `Bearer ${access}`;
  }
  return config;
});

let refreshPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const refreshToken = tokens.getRefresh();
  if (!refreshToken) throw new Error("Refresh token yok");

  const { data } = await axios.post<LoginResponse>(`${baseURL}/api/auth/refresh`, {
    refreshToken,
  });

  tokens.set(data.accessToken, data.refreshToken);
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

client.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as RetryConfig | undefined;
    const isAuthEndpoint = original?.url?.startsWith("/api/auth/");

    if (
      error.response?.status === 401 &&
      original &&
      !original._retry &&
      !isAuthEndpoint &&
      tokens.getRefresh()
    ) {
      original._retry = true;
      try {
        refreshPromise ??= refreshTokens().finally(() => {
          refreshPromise = null;
        });
        await refreshPromise;
        return client(original);
      } catch {
        tokens.clear();
        if (window.location.pathname !== '/') {
          window.location.href = '/';
        }
      }
    }
    return Promise.reject(error);
  }
);