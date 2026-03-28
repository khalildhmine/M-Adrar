import type { ReactNode } from "react";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { AppSidebar } from "@/app/(main)/dashboard/_components/sidebar/app-sidebar";
import { Separator } from "@/components/ui/separator";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { SIDEBAR_COLLAPSIBLE_VALUES, SIDEBAR_VARIANT_VALUES } from "@/lib/preferences/layout";
import { isSupabaseConfigured } from "@/lib/supabase/env";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { getPreference } from "@/server/server-actions";

import { RequireAdminToken } from "./_components/require-admin-token";
import { AccountSwitcher } from "./_components/sidebar/account-switcher";
import { LayoutControls } from "./_components/sidebar/layout-controls";
import { SearchDialog } from "./_components/sidebar/search-dialog";
import { ThemeSwitcher } from "./_components/sidebar/theme-switcher";

/** Shown in the shell when auth is JWT-only (`admin_token`); details come from login, not the server. */
const JWT_PLACEHOLDER_USER = {
  id: "admin",
  name: "Admin",
  email: "",
  avatar: "",
  role: "admin",
};

export default async function Layout({ children }: Readonly<{ children: ReactNode }>) {
  let currentUser: {
    id: string;
    name: string;
    email: string;
    avatar: string;
    role: string;
  } = JWT_PLACEHOLDER_USER;

  if (isSupabaseConfigured()) {
    const supabase = await createSupabaseServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      redirect("/auth/v1/login");
    }

    const { data: member, error: memberError } = await supabase
      .from("academy_members")
      .select("academy_id, role")
      .eq("user_id", user.id)
      .in("role", ["owner", "manager", "staff"])
      .order("created_at", { ascending: true })
      .limit(1)
      .maybeSingle();

    if (memberError || !member) {
      redirect("/unauthorized");
    }

    currentUser = {
      id: user.id,
      name: (user.user_metadata?.full_name as string | undefined) ?? user.email?.split("@")[0] ?? "User",
      email: user.email ?? "",
      avatar: (user.user_metadata?.avatar_url as string | undefined) ?? "",
      role: member.role,
    };
  }

  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar_state")?.value !== "false";
  const [variant, collapsible] = await Promise.all([
    getPreference("sidebar_variant", SIDEBAR_VARIANT_VALUES, "inset"),
    getPreference("sidebar_collapsible", SIDEBAR_COLLAPSIBLE_VALUES, "icon"),
  ]);

  const dashboardShell = (
    <SidebarProvider defaultOpen={defaultOpen}>
      <AppSidebar variant={variant} collapsible={collapsible} currentUser={currentUser} />
      <SidebarInset
        className={cn(
          "[html[data-content-layout=centered]_&]:mx-auto! [html[data-content-layout=centered]_&]:max-w-screen-2xl!",
          // Adds right margin for inset sidebar in centered layout up to 113rem.
          // On wider screens with collapsed sidebar, removes margin and sets margin auto for alignment.
          "max-[113rem]:peer-data-[variant=inset]:mr-2! min-[101rem]:peer-data-[variant=inset]:peer-data-[state=collapsed]:mr-auto!",
        )}
      >
        <header
          className={cn(
            "flex h-12 shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12",
            // Handle sticky navbar style with conditional classes so blur, background, z-index, and rounded corners remain consistent across all SidebarVariant layouts.
            "[html[data-navbar-style=sticky]_&]:sticky [html[data-navbar-style=sticky]_&]:top-0 [html[data-navbar-style=sticky]_&]:z-50 [html[data-navbar-style=sticky]_&]:overflow-hidden [html[data-navbar-style=sticky]_&]:rounded-t-[inherit] [html[data-navbar-style=sticky]_&]:bg-background/50 [html[data-navbar-style=sticky]_&]:backdrop-blur-md",
          )}
        >
          <div className="flex w-full items-center justify-between px-4 lg:px-6">
            <div className="flex items-center gap-1 lg:gap-2">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mx-2 data-[orientation=vertical]:h-4" />
              <SearchDialog />
            </div>
            <div className="flex items-center gap-2">
              <LayoutControls />
              <ThemeSwitcher />
              <AccountSwitcher users={[currentUser]} />
            </div>
          </div>
        </header>
        <div className="h-full p-4 md:p-6">{children}</div>
      </SidebarInset>
    </SidebarProvider>
  );

  if (isSupabaseConfigured()) {
    return dashboardShell;
  }

  return <RequireAdminToken>{dashboardShell}</RequireAdminToken>;
}
