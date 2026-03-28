"use client";

import { useCallback, useEffect, useState } from "react";

import { useParams } from "next/navigation";

import { toast } from "sonner";

import { ProductForm } from "../../product-form";

type Product = {
  id: string;
  sku?: string;
  name: string;
  slug: string;
  description?: string;
  product_type_id?: string;
  gender?: string;
  base_price_cents: number;
  currency: string;
  available_qty?: number;
  gravure_enabled: boolean;
  gift_wrap_available?: boolean;
  is_active: boolean;
  is_best_seller?: boolean;
};

type Image = { url: string; position: number; type: string };
type Variant = {
  name: string;
  price_cents: number;
  sku?: string;
  available_qty?: number;
};
type IngredientRow = {
  ingredient_id: string;
  ingredient_name?: string;
  percent?: number;
  note?: string;
};

export default function EditProductPage() {
  const params = useParams();
  const id = typeof params.id === "string" ? params.id : undefined;
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<Image[]>([]);
  const [variants, setVariants] = useState<Variant[]>([]);
  const [ingredients, setIngredients] = useState<IngredientRow[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!id) return;
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Please log in.");
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/v1/admin/products/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        product?: Product;
        images?: Image[];
        variants?: Variant[];
        ingredients?: IngredientRow[];
        error?: string;
      };
      if (!res.ok || !data.product)
        throw new Error(data.error ?? "Product not found.");
      setProduct(data.product);
      setImages(data.images ?? []);
      setVariants(data.variants ?? []);
      setIngredients(data.ingredients ?? []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load product.",
      );
    } finally {
      setLoading(false);
    }
  }, [id, apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  if (loading) {
    return <p className="p-4 text-muted-foreground">Loading product...</p>;
  }

  if (!product) {
    return (
      <div className="p-4">
        <p className="text-destructive">Product not found.</p>
      </div>
    );
  }

  const initialProduct = {
    sku: product.sku,
    name: product.name,
    slug: product.slug,
    description: product.description,
    product_type_id: product.product_type_id,
    gender: product.gender,
    base_price_cents: product.base_price_cents,
    currency: product.currency,
    available_qty: product.available_qty,
    gravure_enabled: product.gravure_enabled,
    gift_wrap_available: product.gift_wrap_available !== false,
    is_active: product.is_active,
    is_best_seller: product.is_best_seller,
  };

  return (
    <div className="space-y-6">
      <ProductForm
        productId={id}
        initialProduct={initialProduct}
        initialImages={images}
        initialVariants={variants}
        initialIngredients={ingredients}
      />
    </div>
  );
}
