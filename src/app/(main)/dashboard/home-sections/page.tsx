"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/cloudinary-upload";

type Product = {
  id: string;
  name: string;
};

type HomeSection = {
  id: string;
  title_en?: string | null;
  title_fr?: string | null;
  title_ar?: string | null;
  description_en?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  banner_image_url?: string | null;
  order: number;
  is_active: boolean;
  product_ids?: string[];
  created_at?: string;
  updated_at?: string;
};

const emptyForm = (): Omit<HomeSection, "id"> => ({
  title_en: "",
  title_fr: "",
  title_ar: "",
  description_en: "",
  description_fr: "",
  description_ar: "",
  banner_image_url: "",
  order: 1,
  is_active: true,
  product_ids: [],
});

export default function HomeSectionsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [items, setItems] = useState<HomeSection[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState<Omit<HomeSection, "id">>(emptyForm());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const selectedProducts = useMemo(
    () => new Set(form.product_ids ?? []),
    [form.product_ids],
  );

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const [sectionsRes, productsRes] = await Promise.all([
        fetch(`${apiBase}/v1/admin/home-sections`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
        fetch(`${apiBase}/v1/admin/products?limit=200&offset=0`, {
          headers: { Authorization: `Bearer ${token}` },
        }).catch(() => null),
      ]);

      if (sectionsRes) {
        const sectionsData = (await sectionsRes.json().catch(() => ({}))) as {
          sections?: HomeSection[];
          error?: string;
        };
        if (!sectionsRes.ok) {
          toast.error(
            sectionsData.error ??
              `Failed to load home sections (${sectionsRes.status}).`,
          );
          setItems([]);
        } else {
          setItems(
            Array.isArray(sectionsData.sections) ? sectionsData.sections : [],
          );
        }
      } else {
        toast.error("Failed to load home sections.");
        setItems([]);
      }

      if (productsRes) {
        const productsData = (await productsRes.json().catch(() => ({}))) as {
          products?: any[];
          error?: string;
        };
        if (!productsRes.ok) {
          toast.error(
            productsData.error ??
              `Failed to load products (${productsRes.status}).`,
          );
          setProducts([]);
        } else {
          const list = Array.isArray(productsData.products)
            ? productsData.products
            : [];
          setProducts(
            list
              .map((p) => ({ id: String(p.id), name: String(p.name ?? "") }))
              .filter((p) => p.id && p.name),
          );
        }
      } else {
        toast.error("Failed to load products.");
        setProducts([]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Load error.");
      setItems([]);
      setProducts([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const resetForm = () => {
    setForm(emptyForm());
    setEditingId(null);
    setSaving(false);
    setUploading(false);
  };

  const startEdit = (s: HomeSection) => {
    setEditingId(s.id);
    setForm({
      title_en: s.title_en ?? "",
      title_fr: s.title_fr ?? "",
      title_ar: s.title_ar ?? "",
      description_en: s.description_en ?? "",
      description_fr: s.description_fr ?? "",
      description_ar: s.description_ar ?? "",
      banner_image_url: s.banner_image_url ?? "",
      order: s.order ?? 1,
      is_active: !!s.is_active,
      product_ids: Array.isArray(s.product_ids) ? s.product_ids : [],
    });
  };

  const toggleProduct = (id: string) => {
    setForm((f) => {
      const prev = Array.isArray(f.product_ids) ? f.product_ids : [];
      if (prev.includes(id))
        return { ...f, product_ids: prev.filter((x) => x !== id) };
      return { ...f, product_ids: [...prev, id] };
    });
  };

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        title_en: form.title_en || null,
        title_fr: form.title_fr || null,
        title_ar: form.title_ar || null,
        description_en: form.description_en || null,
        description_fr: form.description_fr || null,
        description_ar: form.description_ar || null,
        banner_image_url: form.banner_image_url || null,
        order: form.order || 1,
        is_active: form.is_active,
      };

      if (editingId) {
        const res = await fetch(
          `${apiBase}/v1/admin/home-sections/${editingId}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify(payload),
          },
        );
        const data = (await res.json().catch(() => ({}))) as {
          section?: HomeSection;
          error?: string;
        };
        if (!res.ok || !data.section)
          throw new Error(data.error ?? "Update failed.");

        const linkRes = await fetch(
          `${apiBase}/v1/admin/home-sections/${editingId}/products`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ product_ids: form.product_ids ?? [] }),
          },
        );
        if (!linkRes.ok) throw new Error("Failed to update section products.");

        setItems((prev) =>
          prev.map((x) =>
            x.id === editingId
              ? { ...data.section!, product_ids: form.product_ids ?? [] }
              : x,
          ),
        );
        toast.success("Home section updated.");
        resetForm();
        return;
      }

      const res = await fetch(`${apiBase}/v1/admin/home-sections`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        section?: HomeSection;
        error?: string;
      };
      if (!res.ok || !data.section)
        throw new Error(data.error ?? "Create failed.");

      const linkRes = await fetch(
        `${apiBase}/v1/admin/home-sections/${data.section.id}/products`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ product_ids: form.product_ids ?? [] }),
        },
      );
      if (!linkRes.ok) throw new Error("Failed to set section products.");

      setItems((prev) => [
        ...prev,
        { ...data.section!, product_ids: form.product_ids ?? [] },
      ]);
      toast.success("Home section created.");
      resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this home section?")) return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/v1/admin/home-sections/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed.");
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("Deleted.");
      if (editingId === id) resetForm();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  const uploadBanner = async (file: File) => {
    setUploading(true);
    try {
      const url = await uploadImage(file, apiBase ?? "", { folder: "home-sections" });
      setForm((f) => ({ ...f, banner_image_url: url }));
      toast.success("Banner uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Home sections</h1>
        <p className="text-sm text-muted-foreground">
          Create homepage collections (banner + text) and attach selected
          perfumes to each section.
        </p>
      </div>

      <form onSubmit={save} className="rounded-md border bg-card p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="text-sm text-muted-foreground">
            {editingId ? `Editing: ${editingId}` : "Create a new home section"}
          </div>
          <div className="flex gap-2">
            {editingId ? (
              <Button type="button" variant="outline" onClick={resetForm}>
                Cancel edit
              </Button>
            ) : null}
            <Button type="submit" disabled={saving}>
              {editingId ? "Update" : "Create"}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Title (EN)</Label>
            <Input
              value={form.title_en ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Title (FR)</Label>
            <Input
              value={form.title_fr ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_fr: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Title (AR)</Label>
            <Input
              value={form.title_ar ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_ar: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Description (EN)</Label>
            <Textarea
              rows={3}
              value={form.description_en ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_en: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description (FR)</Label>
            <Textarea
              rows={3}
              value={form.description_fr ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_fr: e.target.value }))
              }
            />
          </div>
          <div className="space-y-2">
            <Label>Description (AR)</Label>
            <Textarea
              rows={3}
              value={form.description_ar ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_ar: e.target.value }))
              }
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
          <div className="space-y-2 md:col-span-2">
            <Label>Banner image URL</Label>
            <Input
              value={form.banner_image_url ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, banner_image_url: e.target.value }))
              }
              placeholder="https://..."
            />
            <div className="flex items-center gap-2">
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (!file) return;
                  void uploadBanner(file);
                }}
              />
              <span className="text-xs text-muted-foreground">
                {uploading ? "Uploading..." : "Upload banner"}
              </span>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Order</Label>
            <Input
              type="number"
              min={1}
              value={form.order}
              onChange={(e) =>
                setForm((f) => ({
                  ...f,
                  order: parseInt(e.target.value, 10) || 1,
                }))
              }
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <input
            id="active"
            type="checkbox"
            checked={!!form.is_active}
            onChange={(e) =>
              setForm((f) => ({ ...f, is_active: e.target.checked }))
            }
          />
          <Label htmlFor="active">Active</Label>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-medium">Select perfumes</div>
              <div className="text-xs text-muted-foreground">
                Pick the products to show inside this home collection.
              </div>
            </div>
            <div className="text-xs text-muted-foreground">
              {(form.product_ids ?? []).length} selected
            </div>
          </div>
          <div className="max-h-56 overflow-auto rounded-md border p-3 space-y-2">
            {products.length === 0 ? (
              <div className="text-sm text-muted-foreground">
                No products loaded yet.
              </div>
            ) : (
              products.map((p) => (
                <label key={p.id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={selectedProducts.has(p.id)}
                    onChange={() => toggleProduct(p.id)}
                  />
                  <span className="truncate">{p.name}</span>
                </label>
              ))
            )}
          </div>
        </div>
      </form>

      <div className="rounded-md border bg-card">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">
            Loading home sections...
          </p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No home sections yet. Create one above.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Title (EN/FR)</th>
                <th className="px-3 py-2 text-left">Active</th>
                <th className="px-3 py-2 text-left">Banner</th>
                <th className="px-3 py-2 text-left">Products</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{s.order}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium">{s.title_en ?? "-"}</span>
                    {s.title_fr ? (
                      <span className="text-muted-foreground ml-1">
                        / {s.title_fr}
                      </span>
                    ) : null}
                  </td>
                  <td className="px-3 py-2">{s.is_active ? "Yes" : "No"}</td>
                  <td className="px-3 py-2">
                    {s.banner_image_url ? "🖼" : "-"}
                  </td>
                  <td className="px-3 py-2">
                    {Array.isArray(s.product_ids) ? s.product_ids.length : 0}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-1"
                      onClick={() => startEdit(s)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => void remove(s.id)}
                    >
                      Delete
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
