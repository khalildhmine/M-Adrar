const ADMIN_TOKEN_COOKIE = "admin_token";

/** Max-Age fallback when JWT has no exp (seconds). */
const DEFAULT_MAX_AGE = 60 * 60 * 24 * 7;

function jwtMaxAgeSeconds(accessToken: string): number {
  try {
    const parts = accessToken.split(".");
    const b64 = parts[1];
    if (!b64) return DEFAULT_MAX_AGE;
    const p = JSON.parse(atob(b64)) as { exp?: number };
    if (typeof p.exp !== "number") return DEFAULT_MAX_AGE;
    const left = p.exp - Math.floor(Date.now() / 1000);
    return left > 0 ? left : 0;
  } catch {
    return DEFAULT_MAX_AGE;
  }
}

export function syncAdminTokenCookie(accessToken: string) {
  if (typeof document === "undefined") return;
  const maxAge = jwtMaxAgeSeconds(accessToken);
  if (maxAge <= 0) {
    document.cookie = `${ADMIN_TOKEN_COOKIE}=; Path=/; Max-Age=0`;
    return;
  }
  document.cookie = `${ADMIN_TOKEN_COOKIE}=${encodeURIComponent(accessToken)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
}

export function clearAdminTokenCookie() {
  if (typeof document === "undefined") return;
  document.cookie = `${ADMIN_TOKEN_COOKIE}=; Path=/; Max-Age=0`;
}

export function persistAdminSession(accessToken: string, refreshToken?: string | null) {
  localStorage.setItem("admin_token", accessToken);
  if (refreshToken) {
    localStorage.setItem("admin_refresh_token", refreshToken);
  }
  syncAdminTokenCookie(accessToken);
}

export function clearAdminSession() {
  localStorage.removeItem("admin_token");
  localStorage.removeItem("admin_refresh_token");
  clearAdminTokenCookie();
}

export async function verifyAdminTokenWithApi(accessToken: string, apiBase: string): Promise<boolean> {
  if (!apiBase || !accessToken) return false;
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 12_000);
  try {
    const res = await fetch(`${apiBase.replace(/\/$/, "")}/v1/admin/orders?limit=1`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
      signal: ctrl.signal,
    });
    return res.ok;
  } catch {
    return false;
  } finally {
    clearTimeout(t);
  }
}
