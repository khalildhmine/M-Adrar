"use client";

import { useEffect } from "react";

import { useRouter } from "next/navigation";

export default function CategoriesRedirectPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/dashboard/types");
  }, [router]);
  return null;
}
