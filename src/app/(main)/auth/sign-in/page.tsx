import { Suspense } from "react";

import { SignInContent } from "./sign-in-content";

function SignInFallback() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background p-4">
      <p className="text-muted-foreground text-sm">Loading…</p>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<SignInFallback />}>
      <SignInContent />
    </Suspense>
  );
}
