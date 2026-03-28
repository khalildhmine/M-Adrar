"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

import { clearAdminSession, syncAdminTokenCookie, verifyAdminTokenWithApi } from "@/lib/admin-session";

export default function Home() {
  const router = useRouter();

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
      router.replace("/dashboard/default");
    };
    void run();
  }, [router]);

  return (
    <div className="flex min-h-svh items-center justify-center bg-background text-sm text-muted-foreground">
      Loading…
    </div>
  );
}
