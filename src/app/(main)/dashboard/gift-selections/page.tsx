"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2, ToggleLeft, ToggleRight, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/cloudinary-upload";

type GiftBanner = {
  id: string;
  title?: string | null;
  subtitle?: string | null;
  image_url: string;
  gender?: string | null;
  product_type_id?: string | null;
  position: number;
  active: boolean;
};

type ProductType = {
  id: string;
  name: string;
};

export default function GiftSelectionsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [items, setItems] = useState<GiftBanner[]>([]);
  const [loading, setLoading] = useState(true);

  const [productTypes, setProductTypes] = useState<ProductType[]>([]);
  const [loadingProductTypes, setLoadingProductTypes] = useState(true);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [gender, setGender] = useState("");
  const [productTypeId, setProductTypeId] = useState("");
  const [position, setPosition] = useState<number | "">("");
  const [active, setActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/v1/admin/gift-banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        gift_banners?: GiftBanner[];
        error?: string;
      };
      if (!res.ok)
        throw new Error(data.error ?? "Failed to load gift banners.");
      setItems(Array.isArray(data.gift_banners) ? data.gift_banners : []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error loading gift selections.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const loadTypes = async () => {
      const token = localStorage.getItem("admin_token");
      if (!token) {
        setLoadingProductTypes(false);
        return;
      }
      try {
        const res = await fetch(`${apiBase}/v1/admin/product-types`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = (await res.json().catch(() => ({}))) as {
          product_types?: ProductType[];
          error?: string;
        };
        if (!res.ok)
          throw new Error(data.error ?? "Failed to load product types.");
        setProductTypes(
          Array.isArray(data.product_types) ? data.product_types : [],
        );
      } catch (err) {
        toast.error(
          err instanceof Error ? err.message : "Error loading product types.",
        );
        setProductTypes([]);
      } finally {
        setLoadingProductTypes(false);
      }
    };
    void loadTypes();
  }, [apiBase]);

  const handleUploadClick = () => fileInputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file.");
      return;
    }
    setUploading(true);
    try {
      const url = await uploadImage(file, apiBase ?? "", { folder: "gift-banners" });
      setImageUrl(url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }
    if (!imageUrl.trim()) {
      toast.error("Banner image is required.");
      return;
    }
    if (!gender.trim() && !productTypeId.trim()) {
      toast.error("Set at least a gender or a product type.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim() || undefined,
        subtitle: undefined,
        image_url: imageUrl.trim(),
        gender: gender.trim() || undefined,
        product_type_id: productTypeId.trim() || undefined,
        position: position === "" ? undefined : Number(position),
        active,
      };
      const url =
        editingId === null
          ? `${apiBase}/v1/admin/gift-banners`
          : `${apiBase}/v1/admin/gift-banners/${editingId}`;
      const method = editingId === null ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        gift_banner?: GiftBanner;
        error?: string;
      };
      if (!res.ok)
        throw new Error(
          data.error ??
            (editingId
              ? "Failed to update gift selection."
              : "Failed to create gift selection."),
        );
      toast.success(
        editingId ? "Gift selection updated." : "Gift selection created.",
      );
      setTitle("");
      setImageUrl("");
      setGender("");
      setProductTypeId("");
      setPosition("");
      setActive(true);
      if (data.gift_banner) {
        setItems((prev) =>
          editingId === null
            ? [...prev, data.gift_banner!]
            : prev.map((b) =>
                b.id === data.gift_banner!.id ? data.gift_banner! : b,
              ),
        );
      } else {
        void load();
      }
      setEditingId(null);
    } catch (err) {
      toast.error(
        err instanceof Error
          ? err.message
          : editingId
            ? "Error updating gift selection."
            : "Error creating gift selection.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Gift selections</h1>
        <p className="text-sm text-muted-foreground">
          Configure curated gift selections used for the “Sélection de cadeaux”
          section in the mobile home screen.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-md border bg-card p-4"
      >
        <h2 className="font-medium">
          {editingId ? "Edit gift selection" : "Add gift selection"}
        </h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pour elle, pour lui..."
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="gender">Gender</Label>
            <select
              id="gender"
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">Any</option>
              <option value="female">Female</option>
              <option value="male">Male</option>
              <option value="unisex">Unisex</option>
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="productTypeId">Product type ID</Label>
            <select
              id="productTypeId"
              value={productTypeId}
              onChange={(e) => setProductTypeId(e.target.value)}
              className="h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="">
                {loadingProductTypes ? "Loading types..." : "Any type"}
              </option>
              {productTypes.map((pt) => (
                <option key={pt.id} value={pt.id}>
                  {pt.name}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="position">Position</Label>
            <Input
              id="position"
              type="number"
              value={position}
              onChange={(e) => {
                const v = e.target.value;
                setPosition(v === "" ? "" : Number(v));
              }}
              placeholder="0"
            />
          </div>
          <div className="space-y-2">
            <Label>Banner image</Label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Upload or paste image URL"
              />
              <Button
                type="button"
                variant="outline"
                size="icon"
                title="Upload image"
                disabled={uploading}
                onClick={handleUploadClick}
              >
                {uploading ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="h-4 w-4" />
                )}
              </Button>
            </div>
            {imageUrl && (
              <div className="mt-1">
                <img
                  src={imageUrl}
                  alt=""
                  className="h-16 w-32 rounded object-cover border"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label>Active</Label>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setActive((v) => !v)}
              className="inline-flex items-center gap-2"
            >
              {active ? (
                <>
                  <ToggleRight className="h-4 w-4 text-emerald-500" />
                  <span>Active</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="h-4 w-4 text-muted-foreground" />
                  <span>Inactive</span>
                </>
              )}
            </Button>
          </div>
        </div>

        <Button type="submit" disabled={saving}>
          {saving
            ? "Saving..."
            : editingId
              ? "Save changes"
              : "Add gift selection"}
        </Button>
      </form>

      <div className="rounded-md border bg-card">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">
            Loading gift selections...
          </p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No gift selections yet. Add one above – they appear in the
            “Sélection de cadeaux” section on mobile.
          </p>
        ) : (
          <>
            <div className="border-b px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Gift selection banners
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left">Preview</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Gender</th>
                  <th className="px-3 py-2 text-left">Product type</th>
                  <th className="px-3 py-2 text-left">Position</th>
                  <th className="px-3 py-2 text-left">Active</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 text-xs">
                      {b.image_url ? (
                        <img
                          src={b.image_url}
                          alt=""
                          className="h-10 w-20 rounded object-cover border"
                        />
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">
                      {b.title ?? "Sélection cadeau"}
                    </td>
                    <td className="px-3 py-2 text-xs">{b.gender ?? "Any"}</td>
                    <td className="px-3 py-2 text-xs">
                      {b.product_type_id ?? (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-3 py-2">{b.position}</td>
                    <td className="px-3 py-2">
                      {b.active ? (
                        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
                          <ToggleRight className="h-3 w-3" />
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                          <ToggleLeft className="h-3 w-3" />
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setEditingId(b.id);
                          setTitle(b.title ?? "");
                          setImageUrl(b.image_url || "");
                          setGender(b.gender ?? "");
                          setProductTypeId(b.product_type_id ?? "");
                          setPosition(b.position);
                          setActive(b.active);
                        }}
                      >
                        Edit
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
}
