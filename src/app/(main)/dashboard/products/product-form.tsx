"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/cloudinary-upload";

type ProductType = { id: string; name: string; created_at?: string };
type Ingredient = {
  id: string;
  name: string;
  image_url?: string;
  color_hex?: string;
  description?: string;
};

type ProductRow = {
  sku?: string;
  name: string;
  name_en?: string;
  name_fr?: string;
  name_ar?: string;
  slug: string;
  description?: string;
  description_en?: string;
  description_fr?: string;
  description_ar?: string;
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

type ImageRow = { url: string; position: number; type: string };
type VariantRow = {
  name: string;
  price_cents: number;
  sku: string;
  available_qty: string;
};
type IngredientRow = { ingredient_id: string; percent: string; note: string };

const defaultProduct: ProductRow = {
  name: "",
  name_en: "",
  name_fr: "",
  name_ar: "",
  slug: "",
  description: "",
  description_en: "",
  description_fr: "",
  description_ar: "",
  product_type_id: "",
  gender: "",
  base_price_cents: 0,
  currency: "MRU",
  available_qty: undefined,
  gravure_enabled: false,
  gift_wrap_available: true,
  is_active: true,
  is_best_seller: false,
};

function normalizeInitialProduct(p?: ProductRow): ProductRow {
  if (!p) return defaultProduct;
  const legacyName = (p.name ?? "").trim();
  const legacyDesc = (p.description ?? "").trim();
  return {
    ...defaultProduct,
    ...p,
    name_fr: (p.name_fr ?? "").trim() || legacyName,
    name_en: (p.name_en ?? "").trim() || legacyName,
    name_ar: (p.name_ar ?? "").trim(),
    description_fr: (p.description_fr ?? "").trim() || legacyDesc,
    description_en: (p.description_en ?? "").trim() || legacyDesc,
    description_ar: (p.description_ar ?? "").trim(),
  };
}

export function ProductForm({
  productId,
  initialProduct,
  initialImages,
  initialVariants,
  initialIngredients,
}: {
  productId?: string;
  initialProduct?: ProductRow;
  initialImages?: { url: string; position: number; type: string }[];
  initialVariants?: {
    name: string;
    price_cents: number;
    sku?: string;
    available_qty?: number;
  }[];
  initialIngredients?: {
    ingredient_id: string;
    ingredient_name?: string;
    percent?: number;
    note?: string;
  }[];
}) {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [product, setProduct] = useState<ProductRow>(
    normalizeInitialProduct(initialProduct),
  );
  const [images, setImages] = useState<ImageRow[]>(
    initialImages?.map((i) => ({ ...i, type: i.type || "gallery" })) ?? [
      { url: "", position: 0, type: "gallery" },
    ],
  );
  const [variants, setVariants] = useState<VariantRow[]>(
    initialVariants?.length
      ? initialVariants.map((v) => ({
          name: v.name,
          price_cents: v.price_cents,
          sku: v.sku ?? "",
          available_qty: v.available_qty != null ? String(v.available_qty) : "",
        }))
      : [{ name: "", price_cents: 0, sku: "", available_qty: "" }],
  );
  const [ingredients, setIngredients] = useState<IngredientRow[]>(
    initialIngredients?.length
      ? initialIngredients.map((i) => ({
          ingredient_id: i.ingredient_id,
          percent: i.percent != null ? String(i.percent) : "",
          note: i.note ?? "",
        }))
      : [{ ingredient_id: "", percent: "", note: "" }],
  );

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [ingredientsList, setIngredientsList] = useState<Ingredient[]>([]);
  const [saving, setSaving] = useState(false);
  const [uploadingImageIdx, setUploadingImageIdx] = useState<number | null>(
    null,
  );

  const loadOptions = useCallback(async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    if (!token) return;
    try {
      const [typesRes, ingRes] = await Promise.all([
        fetch(`${apiBase}/v1/admin/product-types`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch(`${apiBase}/v1/admin/ingredients`, {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      const parseJson = async (res: Response) => {
        const text = await res.text();
        try {
          return JSON.parse(text) as Record<string, unknown>;
        } catch {
          return {};
        }
      };
      const typesData = await parseJson(typesRes);
      const ingData = await parseJson(ingRes);
      const typesList = Array.isArray(typesData.product_types)
        ? (typesData.product_types as ProductType[])
        : [];
      const ingList = Array.isArray(ingData.ingredients)
        ? (ingData.ingredients as Ingredient[])
        : [];
      setProductTypes(typesList);
      setIngredientsList(ingList);
      if (!typesRes.ok || !ingRes.ok) {
        toast.error(
          "Failed to load types or ingredients. Check your connection and try again.",
        );
      }
    } catch {
      toast.error("Failed to load types or ingredients.");
    }
  }, [apiBase]);

  useEffect(() => {
    void loadOptions();
  }, [loadOptions]);

  useEffect(() => {
    setProduct(normalizeInitialProduct(initialProduct));
  }, [initialProduct]);

  const addImage = () =>
    setImages((prev) => [
      ...prev,
      { url: "", position: prev.length, type: "gallery" },
    ]);
  const removeImage = (idx: number) =>
    setImages((prev) => prev.filter((_, i) => i !== idx));
  const setImage = (
    idx: number,
    field: keyof ImageRow,
    value: string | number,
  ) =>
    setImages((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );

  const productImageInputRef = useRef<HTMLInputElement>(null);
  const uploadTargetIdxRef = useRef<number | null>(null);

  const handleProductImageUploadClick = (idx: number) => {
    uploadTargetIdxRef.current = idx;
    productImageInputRef.current?.click();
  };

  const handleProductImageFileChange = async (
    e: React.ChangeEvent<HTMLInputElement>,
  ) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    const idx = uploadTargetIdxRef.current;
    if (file == null || idx == null) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setUploadingImageIdx(idx);
    try {
      const url = await uploadImage(file, apiBase ?? "", {
        folder: "products",
      });
      setImage(idx, "url", url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploadingImageIdx(null);
      uploadTargetIdxRef.current = null;
    }
  };

  const addVariant = () =>
    setVariants((prev) => [
      ...prev,
      { name: "", price_cents: 0, sku: "", available_qty: "" },
    ]);
  const removeVariant = (idx: number) =>
    setVariants((prev) => prev.filter((_, i) => i !== idx));
  const setVariant = (
    idx: number,
    field: keyof VariantRow,
    value: string | number,
  ) =>
    setVariants((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );

  const addIngredient = () =>
    setIngredients((prev) => [
      ...prev,
      { ingredient_id: "", percent: "", note: "" },
    ]);
  const removeIngredient = (idx: number) =>
    setIngredients((prev) => prev.filter((_, i) => i !== idx));
  const setIngredient = (
    idx: number,
    field: keyof IngredientRow,
    value: string,
  ) =>
    setIngredients((prev) =>
      prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)),
    );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    if (!token) {
      toast.error("Please log in.");
      return;
    }
    const primaryName =
      product.name_fr?.trim() ||
      "" ||
      product.name_en?.trim() ||
      "" ||
      product.name_ar?.trim() ||
      "" ||
      product.name.trim();
    const slug = product.slug || primaryName.toLowerCase().replace(/\s+/g, "-");
    const basePrice = Number(product.base_price_cents) || 0;
    if (!primaryName || basePrice <= 0) {
      toast.error("Name and base price (cents) are required.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        product: {
          name: primaryName,
          name_en: product.name_en?.trim() || null,
          name_fr: product.name_fr?.trim() || null,
          name_ar: product.name_ar?.trim() || null,
          slug,
          description: product.description?.trim() || null,
          description_en: product.description_en?.trim() || null,
          description_fr: product.description_fr?.trim() || null,
          description_ar: product.description_ar?.trim() || null,
          product_type_id: product.product_type_id || null,
          gender: product.gender || null,
          base_price_cents: basePrice,
          currency: product.currency || "MRU",
          available_qty:
            product.available_qty != null &&
            typeof product.available_qty === "number"
              ? Number(product.available_qty)
              : null,
          gravure_enabled: product.gravure_enabled,
          gift_wrap_available: product.gift_wrap_available !== false,
          is_active: product.is_active,
          is_best_seller: Boolean(product.is_best_seller),
          sku: product.sku || null,
        },
        images: images
          .filter((i) => i.url.trim())
          .map((i, idx) => ({
            url: i.url.trim(),
            position: i.position ?? idx,
            type: i.type || "gallery",
          })),
        variants: variants
          .filter((v) => v.name.trim())
          .map((v) => ({
            name: v.name.trim(),
            price_cents: Number(v.price_cents) || 0,
            sku: v.sku?.trim() || undefined,
            available_qty: v.available_qty?.trim()
              ? Number(v.available_qty)
              : undefined,
          })),
        ingredients: ingredients
          .filter((i) => i.ingredient_id)
          .map((i) => ({
            ingredient_id: i.ingredient_id,
            percent: i.percent?.trim() ? Number(i.percent) : undefined,
            note: i.note?.trim() || undefined,
          })),
      };

      const url = productId
        ? `${apiBase}/v1/admin/products/${productId}/full`
        : `${apiBase}/v1/admin/products/full`;
      const method = productId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        product?: { id: string };
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to save product.");
      toast.success(productId ? "Product updated." : "Product created.");
      if (!productId && data.product?.id)
        router.push(`/dashboard/products/${data.product.id}/edit`);
      else if (productId) router.push("/dashboard/products");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error saving product.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="flex items-center gap-4">
        <Button type="button" variant="outline" size="sm" asChild>
          <Link href="/dashboard/products">Back to list</Link>
        </Button>
        <h1 className="text-2xl font-semibold">
          {productId ? "Edit product" : "Add new product"}
        </h1>
      </div>

      {/* Basic product fields */}
      <div className="rounded-md border bg-card p-4 space-y-4">
        <h2 className="font-medium">Basic details</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <Label htmlFor="name_fr">Name (FR) *</Label>
            <Input
              id="name_fr"
              value={product.name_fr ?? ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, name_fr: e.target.value }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_en">Name (EN)</Label>
            <Input
              id="name_en"
              value={product.name_en ?? ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, name_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="name_ar">Name (AR)</Label>
            <Input
              id="name_ar"
              value={product.name_ar ?? ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, name_ar: e.target.value }))
              }
              dir="rtl"
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label htmlFor="slug">Slug</Label>
            <Input
              id="slug"
              value={product.slug}
              onChange={(e) =>
                setProduct((p) => ({ ...p, slug: e.target.value }))
              }
              placeholder="auto from name"
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Description (FR)</Label>
            <Textarea
              value={product.description_fr ?? ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, description_fr: e.target.value }))
              }
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Description (EN)</Label>
            <Textarea
              value={product.description_en ?? ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, description_en: e.target.value }))
              }
              rows={3}
            />
          </div>
          <div className="space-y-2 md:col-span-3">
            <Label>Description (AR)</Label>
            <Textarea
              value={product.description_ar ?? ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, description_ar: e.target.value }))
              }
              rows={3}
              dir="rtl"
            />
          </div>
          <div className="space-y-2">
            <Label>Product type</Label>
            <Select
              value={product.product_type_id ?? ""}
              onValueChange={(v) =>
                setProduct((p) => ({ ...p, product_type_id: v || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {productTypes.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Gender</Label>
            <Select
              value={product.gender ?? ""}
              onValueChange={(v) =>
                setProduct((p) => ({ ...p, gender: v || undefined }))
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="unisex">Unisex</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="base_price_cents">Base price (cents) *</Label>
            <Input
              id="base_price_cents"
              type="number"
              min={0}
              value={product.base_price_cents || ""}
              onChange={(e) =>
                setProduct((p) => ({
                  ...p,
                  base_price_cents: Number(e.target.value) || 0,
                }))
              }
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="currency">Currency</Label>
            <Input
              id="currency"
              value={product.currency}
              onChange={(e) =>
                setProduct((p) => ({ ...p, currency: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="available_qty">Available quantity</Label>
            <Input
              id="available_qty"
              type="number"
              min={0}
              value={product.available_qty ?? ""}
              onChange={(e) =>
                setProduct((p) => ({
                  ...p,
                  available_qty: e.target.value
                    ? Number(e.target.value)
                    : undefined,
                }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU</Label>
            <Input
              id="sku"
              value={product.sku ?? ""}
              onChange={(e) =>
                setProduct((p) => ({ ...p, sku: e.target.value }))
              }
            />
          </div>
          <div className="flex items-center gap-4 pt-2">
            <div className="flex items-center gap-2">
              <Switch
                id="gravure"
                checked={product.gravure_enabled}
                onCheckedChange={(v) =>
                  setProduct((p) => ({ ...p, gravure_enabled: v }))
                }
              />
              <Label htmlFor="gravure">Engraving enabled</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_active"
                checked={product.is_active}
                onCheckedChange={(v) =>
                  setProduct((p) => ({ ...p, is_active: v }))
                }
              />
              <Label htmlFor="is_active">Active</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="gift_wrap"
                checked={product.gift_wrap_available !== false}
                onCheckedChange={(v) =>
                  setProduct((p) => ({ ...p, gift_wrap_available: v }))
                }
              />
              <Label htmlFor="gift_wrap">Gift wrap available</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="is_best_seller"
                checked={Boolean(product.is_best_seller)}
                onCheckedChange={(v) =>
                  setProduct((p) => ({ ...p, is_best_seller: v }))
                }
              />
              <Label htmlFor="is_best_seller">Best seller</Label>
            </div>
          </div>
        </div>
      </div>

      {/* Images */}
      <div className="rounded-md border bg-card p-4 space-y-4">
        <input
          ref={productImageInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleProductImageFileChange}
        />
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Product images</h2>
          <Button type="button" variant="outline" size="sm" onClick={addImage}>
            Add image
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Upload an image or paste a URL. Images are stored in Cloudinary.
        </p>
        <div className="space-y-3">
          {images.map((img, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-2 rounded border p-2"
            >
              <div className="flex-1 min-w-[200px] space-y-1">
                <Label>URL</Label>
                <div className="flex gap-2">
                  <Input
                    value={img.url}
                    onChange={(e) => setImage(idx, "url", e.target.value)}
                    placeholder="Upload or paste URL"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    title="Upload image"
                    disabled={uploadingImageIdx !== null}
                    onClick={() => handleProductImageUploadClick(idx)}
                  >
                    {uploadingImageIdx === idx ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              <div className="w-24 space-y-1">
                <Label>Position</Label>
                <Input
                  type="number"
                  min={0}
                  value={img.position}
                  onChange={(e) =>
                    setImage(idx, "position", Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="w-32 space-y-1">
                <Label>Type</Label>
                <Select
                  value={img.type}
                  onValueChange={(v) => setImage(idx, "type", v)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="hero">Hero</SelectItem>
                    <SelectItem value="gallery">Gallery</SelectItem>
                    <SelectItem value="ingredient">Ingredient</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeImage(idx)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Variants */}
      <div className="rounded-md border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Variants</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addVariant}
          >
            Add variant
          </Button>
        </div>
        <div className="space-y-3">
          {variants.map((v, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-2 rounded border p-2"
            >
              <div className="w-40 space-y-1">
                <Label>Name</Label>
                <Input
                  value={v.name}
                  onChange={(e) => setVariant(idx, "name", e.target.value)}
                />
              </div>
              <div className="w-28 space-y-1">
                <Label>Price (cents)</Label>
                <Input
                  type="number"
                  min={0}
                  value={v.price_cents || ""}
                  onChange={(e) =>
                    setVariant(idx, "price_cents", Number(e.target.value) || 0)
                  }
                />
              </div>
              <div className="w-32 space-y-1">
                <Label>SKU</Label>
                <Input
                  value={v.sku}
                  onChange={(e) => setVariant(idx, "sku", e.target.value)}
                />
              </div>
              <div className="w-24 space-y-1">
                <Label>Qty</Label>
                <Input
                  type="number"
                  min={0}
                  value={v.available_qty}
                  onChange={(e) =>
                    setVariant(idx, "available_qty", e.target.value)
                  }
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeVariant(idx)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Ingredients */}
      <div className="rounded-md border bg-card p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-medium">Ingredients</h2>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={addIngredient}
          >
            Add ingredient
          </Button>
        </div>
        <div className="space-y-3">
          {ingredients.map((ing, idx) => (
            <div
              key={idx}
              className="flex flex-wrap items-end gap-2 rounded border p-2"
            >
              <div className="min-w-[200px] flex-1 space-y-1">
                <Label>Ingredient</Label>
                <Select
                  value={ing.ingredient_id}
                  onValueChange={(v) => setIngredient(idx, "ingredient_id", v)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select ingredient" />
                  </SelectTrigger>
                  <SelectContent>
                    {ingredientsList.map((i) => (
                      <SelectItem key={i.id} value={i.id}>
                        {i.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="w-24 space-y-1">
                <Label>Percent</Label>
                <Input
                  value={ing.percent}
                  onChange={(e) =>
                    setIngredient(idx, "percent", e.target.value)
                  }
                  placeholder="%"
                />
              </div>
              <div className="min-w-[180px] flex-1 space-y-1">
                <Label>Note</Label>
                <Input
                  value={ing.note}
                  onChange={(e) => setIngredient(idx, "note", e.target.value)}
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => removeIngredient(idx)}
              >
                Remove
              </Button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2">
        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : productId
              ? "Update product"
              : "Create product"}
        </Button>
        <Button type="button" variant="outline" asChild>
          <Link href="/dashboard/products">Cancel</Link>
        </Button>
      </div>
    </form>
  );
}
