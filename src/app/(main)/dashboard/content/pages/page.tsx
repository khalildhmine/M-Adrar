"use client";

import { useEffect, useMemo, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { type ContentPage, getPage, upsertPage } from "@/lib/content-admin-api";

type PageSlug =
  | "privacy-policy"
  | "terms-of-service"
  | "about-us"
  | "return-policy"
  | "secure-payment"
  | "store-pickup";

const PAGES: { slug: PageSlug; label: string }[] = [
  { slug: "privacy-policy", label: "Privacy policy" },
  { slug: "terms-of-service", label: "Terms of service" },
  { slug: "about-us", label: "About us" },
  { slug: "return-policy", label: "Return policy" },
  { slug: "secure-payment", label: "Secure payment" },
  { slug: "store-pickup", label: "Store pickup" },
];

function LangCard({
  title,
  lang,
  page,
  setPage,
}: {
  title: string;
  lang: "en" | "fr" | "ar";
  page: ContentPage;
  setPage: (p: ContentPage) => void;
}) {
  const titleKey = `title_${lang}` as const;
  const bodyKey = `body_${lang}` as const;
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label>Title</Label>
          <Input
            value={(page[titleKey] ?? "") as string}
            onChange={(e) => setPage({ ...page, [titleKey]: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label>Body</Label>
          <Textarea
            className="min-h-[280px]"
            value={(page[bodyKey] ?? "") as string}
            onChange={(e) => setPage({ ...page, [bodyKey]: e.target.value })}
          />
        </div>
      </CardContent>
    </Card>
  );
}

export default function ContentPagesPage() {
  const [slug, setSlug] = useState<PageSlug>("privacy-policy");
  const [page, setPage] = useState<ContentPage>({
    slug: "privacy-policy",
    title_en: "",
    title_fr: "",
    title_ar: "",
    body_en: "",
    body_fr: "",
    body_ar: "",
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const slugLabel = useMemo(() => PAGES.find((p) => p.slug === slug)?.label ?? slug, [slug]);

  useEffect(() => {
    let active = true;
    (async () => {
      setLoading(true);
      setMessage(null);
      try {
        const p = await getPage(slug);
        if (!active) return;
        setPage(p);
      } catch (e: unknown) {
        if (!active) return;
        setMessage(e instanceof Error ? e.message : "Failed to load page");
      } finally {
        if (active) setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [slug]);

  async function onSave() {
    setLoading(true);
    setMessage(null);
    try {
      const saved = await upsertPage(slug, page);
      setPage(saved);
      setMessage("Saved.");
    } catch (e: unknown) {
      setMessage(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl">Content pages</h1>
          <p className="text-muted-foreground text-sm">Edit legal/info pages in English, French, and Arabic.</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={slug} onValueChange={(v) => setSlug(v as PageSlug)}>
            <SelectTrigger className="w-[240px]">
              <SelectValue placeholder="Select page" />
            </SelectTrigger>
            <SelectContent>
              {PAGES.map((p) => (
                <SelectItem key={p.slug} value={p.slug}>
                  {p.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={onSave} disabled={loading}>
            Save
          </Button>
        </div>
      </div>

      {message ? (
        <Card>
          <CardContent className="pt-6 text-sm">{message}</CardContent>
        </Card>
      ) : null}

      <div className="text-muted-foreground text-sm">
        Editing: <span className="font-medium text-foreground">{slugLabel}</span>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <LangCard title="English" lang="en" page={page} setPage={setPage} />
        <LangCard title="French" lang="fr" page={page} setPage={setPage} />
        <LangCard title="Arabic" lang="ar" page={page} setPage={setPage} />
      </div>
    </div>
  );
}
