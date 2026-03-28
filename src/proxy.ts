import { type NextRequest, NextResponse } from "next/server";

import { createServerClient } from "@supabase/ssr";

import { getPublicSupabaseEnv, isSupabaseConfigured } from "@/lib/supabase/env";

function copyCookies(target: NextResponse, source: NextResponse) {
  for (const cookie of source.cookies.getAll()) {
    target.cookies.set(cookie);
  }
}

/**
 * JWT admin (no Supabase): if admin_token cookie is set, verify with API.
 * Invalid token -> login + clear cookie. No cookie -> continue (client may use localStorage only).
 */
async function gateDashboardJwtCookie(request: NextRequest): Promise<NextResponse | null> {
  const pathname = request.nextUrl.pathname;
  if (!pathname.startsWith("/dashboard")) {
    return null;
  }

  const raw = request.cookies.get("admin_token")?.value;
  if (!raw) {
    return null;
  }

  let token = raw;
  try {
    token = decodeURIComponent(raw);
  } catch {
    token = raw;
  }

  let apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  if (!apiBase) {
    return null;
  }
  if (apiBase.endsWith("/")) {
    apiBase = apiBase.slice(0, -1);
  }

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), 12000);

  try {
    const res = await fetch(apiBase + "/v1/admin/orders?limit=1", {
      headers: { Authorization: "Bearer " + token },
      cache: "no-store",
      signal: ctrl.signal,
    });
    if (res.ok) {
      return null;
    }
  } catch {
    return null;
  } finally {
    clearTimeout(timer);
  }

  const login = new URL("/auth/v1/login", request.url);
  const out = NextResponse.redirect(login);
  out.cookies.set("admin_token", "", { path: "/", maxAge: 0 });
  return out;
}

export async function proxy(request: NextRequest) {
  if (!isSupabaseConfigured()) {
    const jwtRedirect = await gateDashboardJwtCookie(request);
    if (jwtRedirect) {
      return jwtRedirect;
    }
    return NextResponse.next({ request });
  }

  const { url, anonKey } = getPublicSupabaseEnv();
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(url, anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) {
          request.cookies.set(name, value);
        }

        supabaseResponse = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) {
          supabaseResponse.cookies.set(name, value, options);
        }
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  if (!user && pathname.startsWith("/dashboard")) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = "/auth/v1/login";
    loginUrl.searchParams.set("next", `${pathname}${request.nextUrl.search}`);

    const redirect = NextResponse.redirect(loginUrl);
    copyCookies(redirect, supabaseResponse);
    return redirect;
  }

  if (user && pathname.startsWith("/auth")) {
    const dashboardUrl = request.nextUrl.clone();
    dashboardUrl.pathname = "/dashboard/default";
    dashboardUrl.search = "";

    const redirect = NextResponse.redirect(dashboardUrl);
    copyCookies(redirect, supabaseResponse);
    return redirect;
  }

  return supabaseResponse;
}

export const config = {
  matcher: ["/dashboard/:path*", "/auth/:path*"],
};
