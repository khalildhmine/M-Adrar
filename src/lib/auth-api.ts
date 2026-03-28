/**
 * Auth API: check identifier, login, register.
 * Uses NEXT_PUBLIC_API_BASE_URL (e.g. http://localhost:8080).
 */

const getBase = () => process.env.NEXT_PUBLIC_API_BASE_URL;

export type AuthMode = "email" | "phone";

export interface CheckIdentifierResponse {
  exists: boolean;
}

export interface TokenResponse {
  access_token: string;
  refresh_token?: string;
  expires_in?: number;
}

export interface AuthError {
  error?: string;
}

/** Normalize phone to E.164: +222 + digits only (Mauritania). */
export function normalizePhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  if (digits.length === 0) return "";
  const national = digits.startsWith("222") ? digits.slice(3) : digits;
  return `+222${national}`;
}

/** Check if a user exists for the given email or phone. */
export async function checkIdentifier(payload: {
  email?: string;
  phone?: string;
}): Promise<CheckIdentifierResponse> {
  const base = getBase();
  const res = await fetch(`${base}/v1/auth/check-identifier`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as CheckIdentifierResponse & AuthError;
  if (!res.ok) throw new Error(data.error ?? "Check failed");
  return data;
}

/** Log in with email or phone + password. */
export async function login(payload: {
  email?: string;
  phone?: string;
  password: string;
}): Promise<TokenResponse> {
  const base = getBase();
  const res = await fetch(`${base}/v1/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as TokenResponse & AuthError;
  if (!res.ok) throw new Error(data.error ?? "Login failed");
  return data;
}

/** Register with email or phone + password. */
export async function register(payload: {
  email?: string;
  phone?: string;
  password: string;
}): Promise<TokenResponse> {
  const base = getBase();
  const res = await fetch(`${base}/v1/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = (await res.json()) as TokenResponse & AuthError;
  if (!res.ok) throw new Error(data.error ?? "Registration failed");
  return data;
}
