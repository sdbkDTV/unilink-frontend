// src/api/errors.ts - Hata çözümleme yardımcısı (UniLink Rehberi Bölüm 9.4)
import axios from "axios";
import type { ApiError } from "./types";

export function parseError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as Partial<ApiError> | undefined;
    const status = error.response?.status ?? 0;

    if (status === 429) {
      const retrySec = Number(error.response?.headers?.["retry-after"]) || 30;
      return {
        status: 429,
        message: `Çok fazla istek gönderildi. Lütfen ${retrySec} saniye sonra tekrar deneyin.`,
        fieldErrors: {} as Record<string, string>,
        retryAfter: retrySec,
      };
    }

    return {
      status, // 0 = sunucuya ulaşılamadı (çevrimdışı)
      message:
        data?.message ??
        (error.response
          ? "Beklenmeyen bir hata oluştu."
          : "Sunucuya ulaşılamadı. Backend servisinin çalıştığından emin olun."),
      fieldErrors: (data?.fieldErrors ?? {}) as Record<string, string>,
    };
  }
  return {
    status: 0,
    message: "Beklenmeyen bir hata oluştu.",
    fieldErrors: {} as Record<string, string>,
  };
}
