import type { AuthRole, AuthUser } from "@/lib/slices/authSlice";

export const AUTH_TOKEN_COOKIE = "cr_auth_token";
export const AUTH_ROLE_COOKIE = "cr_auth_role";
const AUTH_USER_STORAGE_KEY = "auth_user";

const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 30; // 30 days

function isBrowser() {
  return typeof window !== "undefined";
}

function setCookie(name: string, value: string, maxAgeSeconds = COOKIE_MAX_AGE_SECONDS) {
  if (!isBrowser()) return;

  const secure = window.location.protocol === "https:" ? "; Secure" : "";
  document.cookie = `${name}=${encodeURIComponent(value)}; Path=/; Max-Age=${maxAgeSeconds}; SameSite=Strict${secure}`;
}

function clearCookie(name: string) {
  if (!isBrowser()) return;
  document.cookie = `${name}=; Path=/; Max-Age=0; SameSite=Strict`;
}

export function setAuthenticatedSession(token: string, role: AuthRole, user: AuthUser) {
  if (!isBrowser()) return;

  localStorage.setItem("token", token);
  localStorage.setItem(AUTH_USER_STORAGE_KEY, JSON.stringify(user));

  if (role) {
    setCookie(AUTH_TOKEN_COOKIE, token);
    setCookie(AUTH_ROLE_COOKIE, role);
  }

  window.dispatchEvent(new Event("token-updated"));
}

export function clearAuthenticatedSession() {
  if (!isBrowser()) return;

  localStorage.removeItem(AUTH_USER_STORAGE_KEY);
  clearCookie(AUTH_TOKEN_COOKIE);
  clearCookie(AUTH_ROLE_COOKIE);
}

export function restoreGuestToken(guestToken: string | null) {
  if (!isBrowser()) return;

  if (guestToken) {
    localStorage.setItem("token", guestToken);
    window.dispatchEvent(new Event("token-updated"));
    return;
  }

  localStorage.removeItem("token");
  window.dispatchEvent(new Event("token-updated"));
}

export function getRuntimeToken(fallback?: string | null): string | null {
  if (!isBrowser()) {
    return fallback || null;
  }
  return localStorage.getItem("token") || fallback || null;
}
