"use client";

import type { ReactNode } from "react";
import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { clearAdminSession, syncAdminTokenCookie, verifyAdminTokenWithApi } from "@/lib/admin-session";

/**
 * Admin APIs use `localStorage` `admin_token`. When Supabase is not configured,
 * gate the dashboard until the token exists and validates with the API (same check as middleware).
 */
export function RequireAdminToken({ children }: Readonly<{ children: ReactNode }>) {
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    const run = async () => {
      const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL ?? "";
      const token = localStorage.getItem("admin_token");
      if (!token) {
        router.replace("/auth/v1/login");
        return;
      }
      const ok = await verifyAdminTokenWithApi(token, apiBase);
      if (!ok) {
        clearAdminSession();
        router.replace("/auth/v1/login");
        return;
      }
      syncAdminTokenCookie(token);
      setAllowed(true);
    };
    void run();
  }, [router]);

  if (!allowed) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  return <>{children}</>;
}
