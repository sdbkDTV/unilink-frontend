// src/api/tokens.ts
const ACCESS = "unilink.access";
const REFRESH = "unilink.refresh";

export const tokens = {
  getAccess: () => localStorage.getItem(ACCESS),
  getRefresh: () => localStorage.getItem(REFRESH),
  get: () => localStorage.getItem(ACCESS),
  set: (access: string, refresh: string) => {
    localStorage.setItem(ACCESS, access);
    localStorage.setItem(REFRESH, refresh);
  },
  clear: () => {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
  remove: () => {
    localStorage.removeItem(ACCESS);
    localStorage.removeItem(REFRESH);
  },
};