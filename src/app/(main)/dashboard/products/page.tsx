"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { Switch } from "@/components/ui/switch";

type ProductImage = { url: string; position: number; type: string };
type ProductIngredient = {
  ingredient_id: string;
  ingredient_name?: string;
  image_url?: string | null;
  color_hex?: string | null;
  colorHex?: string | null; // allow camelCase from API
  percent?: number | null;
  note?: string | null;
};

type Product = {
  id: string;
  name: string;
  slug: string;
  base_price_cents: number;
  currency: string;
  is_active: boolean;
};

type ProductWithDetails = Product & {
  images: ProductImage[];
  ingredients: ProductIngredient[];
};

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([]);
  const [loading, setLoading] = useState(true);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Please log in as admin.");
      setLoading(false);
      return;
    }
    try {
      const listRes = await fetch(`${apiBase}/v1/admin/products?limit=100`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const listData = (await listRes.json().catch(() => ({}))) as {
        products?: Product[];
        error?: string;
      };
      if (!listRes.ok || !listData.products) {
        throw new Error(listData.error ?? "Failed to load products.");
      }
      const ids = listData.products.map((p) => p.id);
      const details = await Promise.all(
        ids.map(async (id) => {
          const res = await fetch(`${apiBase}/v1/admin/products/${id}`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          const data = (await res.json().catch(() => ({}))) as {
            product?: Product;
            images?: ProductImage[];
            ingredients?: ProductIngredient[];
          };
          if (!res.ok || !data.product) return null;
          return {
            ...data.product,
            images: data.images ?? [],
            ingredients: data.ingredients ?? [],
          } as ProductWithDetails;
        }),
      );
      setProducts(details.filter((p): p is ProductWithDetails => p != null));
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load products.",
      );
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const toggleActive = async (p: Product, active: boolean) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/v1/admin/products/${p.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ is_active: active }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        product?: Product;
        error?: string;
      };
      if (!res.ok || !data.product) {
        throw new Error(data.error ?? "Failed to update product.");
      }
      setProducts((prev) =>
        prev.map((x) => (x.id === p.id ? { ...x, is_active: active } : x)),
      );
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error updating product.",
      );
    }
  };

  const removeProduct = async (p: Product) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    if (!confirm(`Delete product "${p.name}"?`)) return;
    try {
      const res = await fetch(`${apiBase}/v1/admin/products/${p.id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete product.");
      }
      setProducts((prev) => prev.filter((x) => x.id !== p.id));
      toast.success("Product deleted.");
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error deleting product.",
      );
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Products</h1>
          <p className="text-sm text-muted-foreground">
            Manage Maison Adrar catalog. Add or edit products with full details.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/products/new">Add new product</Link>
        </Button>
      </div>

      {loading ? (
        <p className="p-4 text-sm text-muted-foreground">Loading products...</p>
      ) : products.length === 0 ? (
        <p className="p-4 text-sm text-muted-foreground">No products yet.</p>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {products.map((p) => (
            <div
              key={p.id}
              className="flex flex-col rounded-lg border bg-card overflow-hidden"
            >
              {/* Product images carousel */}
              <div className="relative aspect-square bg-muted/30">
                {p.images.length > 0 ? (
                  <Carousel opts={{ loop: true }} className="h-full w-full">
                    <CarouselContent className="h-full">
                      {[...p.images]
                        .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
                        .map((img, i) => (
                          <CarouselItem key={i} className="h-full pl-0">
                            <img
                              src={img.url}
                              alt={`${p.name} image ${i + 1}`}
                              className="h-full w-full object-cover"
                            />
                          </CarouselItem>
                        ))}
                    </CarouselContent>
                    {p.images.length > 1 && (
                      <>
                        <CarouselPrevious className="left-2 size-7" />
                        <CarouselNext className="right-2 size-7" />
                      </>
                    )}
                  </Carousel>
                ) : (
                  <div className="flex h-full items-center justify-center text-muted-foreground text-sm">
                    No image
                  </div>
                )}
              </div>

              <div className="flex flex-1 flex-col gap-3 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-medium">{p.name}</p>
                    <p className="text-xs text-muted-foreground">{p.slug}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Switch
                      checked={p.is_active}
                      onCheckedChange={(val) => toggleActive(p, val)}
                    />
                  </div>
                </div>

                <p className="text-sm">
                  {(p.base_price_cents / 100).toFixed(2)} {p.currency}
                </p>

                {/* Ingredients: image + name on left, then a line (bar) filled by percentage */}
                {p.ingredients.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-muted-foreground">
                      Ingredients
                    </p>
                    {p.ingredients.map((ing) => {
                      const percent = ing.percent ?? 0;
                      const rawHex =
                        (ing.color_hex ?? ing.colorHex) != null &&
                        String(ing.color_hex ?? ing.colorHex).trim() !== ""
                          ? String(ing.color_hex ?? ing.colorHex).trim()
                          : null;
                      const color = rawHex
                        ? rawHex.startsWith("#")
                          ? rawHex
                          : `#${rawHex}`
                        : "#94a3b8";
                      const imgUrl =
                        ing.image_url != null &&
                        String(ing.image_url).trim() !== ""
                          ? String(ing.image_url).trim()
                          : null;
                      return (
                        <div
                          key={ing.ingredient_id}
                          className="flex items-center gap-2 min-w-0"
                        >
                          <div className="size-7 shrink-0 rounded overflow-hidden border border-border bg-muted/50 flex items-center justify-center">
                            {imgUrl ? (
                              <img
                                src={imgUrl}
                                alt=""
                                className="size-full object-cover"
                                onError={(e) => {
                                  e.currentTarget.style.display = "none";
                                  const fallback = e.currentTarget
                                    .nextElementSibling as HTMLElement;
                                  if (fallback)
                                    fallback.style.display = "block";
                                }}
                              />
                            ) : null}
                            <div
                              className="size-full"
                              style={{
                                backgroundColor: color,
                                display: imgUrl ? "none" : "block",
                              }}
                            />
                          </div>
                          <span
                            className="shrink-0 text-xs truncate max-w-[80px]"
                            title={ing.ingredient_name ?? undefined}
                          >
                            {ing.ingredient_name ?? "—"}
                          </span>
                          <div className="flex-1 min-w-0 h-2.5 rounded-full bg-muted overflow-hidden flex border border-border/50">
                            <div
                              className="h-full rounded-full shrink-0 min-w-[2px] transition-[width]"
                              style={{
                                width: `${Math.min(100, Math.max(0, percent))}%`,
                                backgroundColor: color,
                              }}
                            />
                          </div>
                          {ing.percent != null && (
                            <span className="shrink-0 text-xs text-muted-foreground w-8 text-right">
                              {percent}%
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-auto flex gap-2 pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1"
                    asChild
                  >
                    <Link href={`/dashboard/products/${p.id}/edit`}>Edit</Link>
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => removeProduct(p)}
                  >
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
