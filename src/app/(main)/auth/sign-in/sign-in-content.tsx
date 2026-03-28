"use client";

import { useCallback } from "react";

import { useRouter, useSearchParams } from "next/navigation";

import { toast } from "sonner";

import { MaisonAdrarTitle } from "@/components/auth/maison-adrar-title";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuthFlow } from "@/hooks/use-auth-flow";
import { persistAdminSession } from "@/lib/admin-session";
import { normalizePhone } from "@/lib/auth-api";

const MAURITANIA_CODE = "+222";

export function SignInContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const {
    mode,
    step,
    identifier,
    userExists,
    password,
    loading,
    error,
    setMode,
    setIdentifier,
    setPassword,
    checkUser,
    submitPassword,
    back,
  } = useAuthFlow();

  const handleSuccess = useCallback(
    (tokens: { access_token: string; refresh_token?: string }) => {
      const token = tokens.access_token;
      const payload = JSON.parse(atob(token.split(".")[1] ?? "{}"));
      const role = payload.role as string | undefined;
      if (role === "admin" || role === "fulfillment") {
        persistAdminSession(token, tokens.refresh_token);
        toast.success("Welcome back.");
      } else {
        persistAdminSession(token, tokens.refresh_token);
        toast.success("Signed in.");
      }
      const next = searchParams.get("next");
      const path = next?.startsWith("/") ? next : "/dashboard/default";
      router.push(path);
      router.refresh();
    },
    [router, searchParams],
  );

  const handleSubmitIdentifier = (e: React.FormEvent) => {
    e.preventDefault();
    void checkUser();
  };

  const handleSubmitPassword = (e: React.FormEvent) => {
    e.preventDefault();
    void submitPassword(handleSuccess);
  };

  const displayId =
    mode === "phone" && identifier && !identifier.startsWith("+") ? normalizePhone(identifier) : identifier;

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <div className="w-full max-w-sm space-y-8">
        <div className="flex justify-center">
          <MaisonAdrarTitle className="text-foreground" />
        </div>

        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg">
              {step === "identifier"
                ? "Sign in or create an account"
                : userExists
                  ? "Enter your password"
                  : "Create your password"}
            </CardTitle>
            <CardDescription>
              {step === "identifier"
                ? "Use your email or phone number."
                : userExists
                  ? "We found your account."
                  : "Choose a password (at least 8 characters)."}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {step === "identifier" ? (
              <form onSubmit={handleSubmitIdentifier} className="space-y-4">
                <Tabs value={mode} onValueChange={(v) => setMode(v as "email" | "phone")} className="w-full">
                  <TabsList variant="line" className="grid w-full grid-cols-2">
                    <TabsTrigger value="email">Email</TabsTrigger>
                    <TabsTrigger value="phone">Phone</TabsTrigger>
                  </TabsList>
                  <TabsContent value="email" className="mt-4">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={mode === "email" ? identifier : ""}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="email"
                      className="mt-1.5"
                    />
                  </TabsContent>
                  <TabsContent value="phone" className="mt-4">
                    <Label htmlFor="phone">Phone (Mauritania)</Label>
                    <div className="mt-1.5 flex rounded-md border border-input bg-transparent shadow-xs focus-within:ring-2 focus-within:ring-ring">
                      <span className="flex items-center border-input border-r px-3 text-muted-foreground text-sm">
                        {MAURITANIA_CODE}
                      </span>
                      <Input
                        id="phone"
                        type="tel"
                        placeholder="12 34 56 78"
                        value={mode === "phone" ? identifier.replace(/^\+222/, "").trim() : ""}
                        onChange={(e) => {
                          const v = e.target.value.replace(/\D/g, "");
                          setIdentifier(v ? `${MAURITANIA_CODE}${v}` : "");
                        }}
                        autoComplete="tel-national"
                        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                    </div>
                  </TabsContent>
                </Tabs>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Checking…" : "Continue"}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleSubmitPassword} className="space-y-4">
                <p className="text-muted-foreground text-sm">{displayId}</p>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete={userExists ? "current-password" : "new-password"}
                    minLength={8}
                  />
                </div>
                {error && <p className="text-destructive text-sm">{error}</p>}
                <div className="flex gap-2">
                  <Button type="button" variant="outline" onClick={back} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" className="flex-1" disabled={loading}>
                    {loading ? "…" : userExists ? "Log in" : "Create account"}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
