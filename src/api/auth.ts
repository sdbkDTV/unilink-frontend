// src/api/auth.ts - Kimlik Doğrulama API Fonksiyonları (UniLink Rehberi Bölüm 6.2)
import { api } from "./client";
import { tokens } from "./tokens";
import type { LoginResponse } from "./types";

export interface RegisterPayload {
  email: string;
  password: string;
  fullName: string;
  university: string;
  department: string;
}

export const authApi = {
  async register(payload: RegisterPayload) {
    const response = await api.post<{
      userId: string;
      email: string;
      emailVerified: boolean;
    }>("/api/auth/register", payload);
    return response.data;
  },

  async login(email: string, password: string): Promise<LoginResponse> {
    const response = await api.post<LoginResponse>("/api/auth/login", {
      email,
      password,
    });
    tokens.set(response.data.accessToken, response.data.refreshToken);
    return response.data;
  },

  async logout() {
    const refreshToken = tokens.getRefresh();
    try {
      if (refreshToken) {
        await api.post("/api/auth/logout", { refreshToken });
      }
    } finally {
      tokens.clear();
    }
  },

  async verifyEmail(token: string) {
    return api.post("/api/auth/verify-email", { token });
  },

  async resendVerification(email: string) {
    return api.post("/api/auth/resend-verification", { email });
  },

  async forgotPassword(email: string) {
    return api.post("/api/auth/forgot-password", { email });
  },

  async resetPassword(token: string, newPassword: string) {
    return api.post("/api/auth/reset-password", { token, newPassword });
  },
};
