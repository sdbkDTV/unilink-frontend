// src/api/client.ts - Axios istemcisi ve otomatik token yenileme (UniLink Rehberi Bölüm 9.3)
import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";
import { tokens } from "./tokens";
import type { LoginResponse } from "./types";

const baseURL = (import.meta as any).env?.VITE_API_URL ?? "http://localhost:8080";

export const api = axios.create({
  baseURL,
  headers: { "Content-Type": "application/json" },
  // Dizi parametreleri için: technologies=Java&technologies=React
  paramsSerializer: { indexes: null },
});

api.interceptors.request.use((config) => {
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

  // Düz axios kullanılıyor ki kendi interceptor'ına takılmasın
  const { data } = await axios.post<LoginResponse>(`${baseURL}/api/auth/refresh`, {
    refreshToken,
  });

  tokens.set(data.accessToken, data.refreshToken);
}

type RetryConfig = InternalAxiosRequestConfig & { _retry?: boolean };

api.interceptors.response.use(
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
        return api(original); // aynı isteği yeni token ile tekrar dene
      } catch {
        tokens.clear();
        // Oturum süresi bittiğinde giriş sayfasına yönlendirilebilir
      }
    }
    return Promise.reject(error);
  }
);
