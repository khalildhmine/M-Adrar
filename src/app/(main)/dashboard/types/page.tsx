"use client";

import { useCallback, useEffect, useState } from "react";

import Link from "next/link";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/cloudinary-upload";

type ProductType = {
  id: string;
  name: string;
  name_en?: string | null;
  name_fr?: string | null;
  name_ar?: string | null;
  label?: string | null;
  label_en?: string | null;
  label_fr?: string | null;
  label_ar?: string | null;
  banner_image_url?: string | null;
  image_url?: string | null;
  description?: string | null;
  description_en?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  gender?: string | null;
  created_at?: string;
};

export default function TypesPage() {
  const [items, setItems] = useState<ProductType[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [nameEn, setNameEn] = useState("");
  const [nameFr, setNameFr] = useState("");
  const [nameAr, setNameAr] = useState("");
  const [labelEn, setLabelEn] = useState("");
  const [labelFr, setLabelFr] = useState("");
  const [labelAr, setLabelAr] = useState("");
  const [bannerImageUrl, setBannerImageUrl] = useState("");
  const [thumbImageUrl, setThumbImageUrl] = useState("");
  const [descriptionEn, setDescriptionEn] = useState("");
  const [descriptionFr, setDescriptionFr] = useState("");
  const [descriptionAr, setDescriptionAr] = useState("");
  const [gender, setGender] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [edit, setEdit] = useState<{
    name_en: string;
    name_fr: string;
    name_ar: string;
    label_en: string;
    label_fr: string;
    label_ar: string;
    banner_image_url: string;
    image_url: string;
    description_en: string;
    description_fr: string;
    description_ar: string;
    gender: string;
  } | null>(null);
  const [uploadingBanner, setUploadingBanner] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    setLoadError(null);
    if (!token) {
      setLoading(false);
      setLoadError("not_logged_in");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/product-types`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const raw = await res.text();
      const data = (() => {
        try {
          return JSON.parse(raw) as {
            product_types?: ProductType[];
            error?: string;
          };
        } catch {
          return {} as { product_types?: ProductType[]; error?: string };
        }
      })();
      if (!res.ok) {
        setItems([]);
        setLoadError(data.error ?? `Request failed (${res.status})`);
        toast.error(data.error ?? "Failed to load types.");
        return;
      }
      const list = Array.isArray(data.product_types) ? data.product_types : [];
      setItems(list);
    } catch (err) {
      setItems([]);
      setLoadError(err instanceof Error ? err.message : "Network error");
      toast.error(err instanceof Error ? err.message : "Error loading types.");
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const primaryName = nameFr.trim() || nameEn.trim() || nameAr.trim();
      if (!primaryName) {
        toast.error("Name (at least one language) is required.");
        return;
      }
      const res = await fetch(`${apiBase}/v1/admin/product-types`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: primaryName,
          name_en: nameEn || undefined,
          name_fr: nameFr || undefined,
          name_ar: nameAr || undefined,
          label_en: labelEn || undefined,
          label_fr: labelFr || undefined,
          label_ar: labelAr || undefined,
          banner_image_url: bannerImageUrl || undefined,
          image_url: thumbImageUrl || undefined,
          description_en: descriptionEn || undefined,
          description_fr: descriptionFr || undefined,
          description_ar: descriptionAr || undefined,
          gender: gender || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        product_type?: ProductType;
        error?: string;
      };
      if (!res.ok || !data.product_type) {
        throw new Error(data.error ?? "Failed to create type.");
      }
      toast.success("Type created.");
      setNameEn("");
      setNameFr("");
      setNameAr("");
      setLabelEn("");
      setLabelFr("");
      setLabelAr("");
      setBannerImageUrl("");
      setThumbImageUrl("");
      setDescriptionEn("");
      setDescriptionFr("");
      setDescriptionAr("");
      setGender("");
      setItems((prev) => [...prev, data.product_type!]);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error creating type.");
    }
  };

  const updateType = async (id: string, payload: Partial<ProductType>) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/v1/admin/product-types/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        product_type?: ProductType;
        error?: string;
      };
      if (!res.ok || !data.product_type) {
        throw new Error(data.error ?? "Failed to update type.");
      }
      setItems((prev) =>
        prev.map((x) => (x.id === id ? data.product_type! : x)),
      );
      toast.success("Type updated.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error updating type.");
    }
  };

  const beginEdit = (t: ProductType) => {
    setEditingId(t.id);
    setEdit({
      name_en: t.name_en ?? "",
      name_fr: t.name_fr ?? t.name ?? "",
      name_ar: t.name_ar ?? "",
      label_en: t.label_en ?? "",
      label_fr: t.label_fr ?? t.label ?? "",
      label_ar: t.label_ar ?? "",
      banner_image_url: t.banner_image_url ?? "",
      image_url: t.image_url ?? "",
      description_en: t.description_en ?? "",
      description_fr: t.description_fr ?? t.description ?? "",
      description_ar: t.description_ar ?? "",
      gender: t.gender ?? "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEdit(null);
    setUploadingBanner(false);
  };

  const saveEdit = async () => {
    if (!editingId || !edit) return;
    const primaryName =
      edit.name_fr.trim() || edit.name_en.trim() || edit.name_ar.trim();
    if (!primaryName) {
      toast.error("Name (at least one language) is required.");
      return;
    }
    await updateType(editingId, {
      name: primaryName,
      name_en: edit.name_en || null,
      name_fr: edit.name_fr || null,
      name_ar: edit.name_ar || null,
      label_en: edit.label_en || null,
      label_fr: edit.label_fr || null,
      label_ar: edit.label_ar || null,
      banner_image_url: edit.banner_image_url || null,
      image_url: edit.image_url || null,
      description_en: edit.description_en || null,
      description_fr: edit.description_fr || null,
      description_ar: edit.description_ar || null,
      gender: edit.gender || null,
    });
    cancelEdit();
  };

  const remove = async (id: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    if (!confirm("Delete this type? Products may still reference it.")) return;
    try {
      const res = await fetch(`${apiBase}/v1/admin/product-types/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        throw new Error(data.error ?? "Failed to delete type.");
      }
      setItems((prev) => prev.filter((x) => x.id !== id));
      toast.success("Type deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error deleting type.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Product types</h1>
        <p className="text-sm text-muted-foreground">
          Manage product types (perfume, coffret, bakharat, room spray, etc.).
          Data is seeded from the database.
        </p>
      </div>

      <form
        onSubmit={create}
        className="flex flex-wrap items-end gap-4 rounded-md border bg-card p-4"
      >
        <div className="space-y-1 w-40">
          <Label htmlFor="name_fr">Name (FR) *</Label>
          <Input
            id="name_fr"
            value={nameFr}
            onChange={(e) => setNameFr(e.target.value)}
            placeholder="ex: Parfum"
          />
        </div>
        <div className="space-y-1 w-40">
          <Label htmlFor="name_en">Name (EN)</Label>
          <Input
            id="name_en"
            value={nameEn}
            onChange={(e) => setNameEn(e.target.value)}
            placeholder="ex: Perfume"
          />
        </div>
        <div className="space-y-1 w-40">
          <Label htmlFor="name_ar">Name (AR)</Label>
          <Input
            id="name_ar"
            value={nameAr}
            onChange={(e) => setNameAr(e.target.value)}
            placeholder="مثال: عطر"
            dir="rtl"
          />
        </div>
        <div className="space-y-1 w-40">
          <Label htmlFor="label_fr">Label (FR)</Label>
          <Input
            id="label_fr"
            value={labelFr}
            onChange={(e) => setLabelFr(e.target.value)}
            placeholder="Display label"
          />
        </div>
        <div className="space-y-1 w-40">
          <Label htmlFor="label_en">Label (EN)</Label>
          <Input
            id="label_en"
            value={labelEn}
            onChange={(e) => setLabelEn(e.target.value)}
            placeholder="Display label"
          />
        </div>
        <div className="space-y-1 w-40">
          <Label htmlFor="label_ar">Label (AR)</Label>
          <Input
            id="label_ar"
            value={labelAr}
            onChange={(e) => setLabelAr(e.target.value)}
            placeholder="عرض"
            dir="rtl"
          />
        </div>
        <div className="space-y-1 w-48">
          <Label htmlFor="banner">Banner image URL</Label>
          <Input
            id="banner"
            value={bannerImageUrl}
            onChange={(e) => setBannerImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1 w-48">
          <Label htmlFor="thumb">Thumbnail image URL</Label>
          <Input
            id="thumb"
            value={thumbImageUrl}
            onChange={(e) => setThumbImageUrl(e.target.value)}
            placeholder="https://..."
          />
        </div>
        <div className="space-y-1 w-28">
          <Label htmlFor="gender">Gender</Label>
          <Input
            id="gender"
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            placeholder="male/female"
          />
        </div>
        <div className="space-y-1 min-w-[220px] flex-1">
          <Label htmlFor="desc_fr">Description (FR)</Label>
          <Input
            id="desc_fr"
            value={descriptionFr}
            onChange={(e) => setDescriptionFr(e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <div className="space-y-1 min-w-[220px] flex-1">
          <Label htmlFor="desc_en">Description (EN)</Label>
          <Input
            id="desc_en"
            value={descriptionEn}
            onChange={(e) => setDescriptionEn(e.target.value)}
            placeholder="Optional description"
          />
        </div>
        <div className="space-y-1 min-w-[220px] flex-1">
          <Label htmlFor="desc_ar">Description (AR)</Label>
          <Input
            id="desc_ar"
            value={descriptionAr}
            onChange={(e) => setDescriptionAr(e.target.value)}
            placeholder="اختياري"
            dir="rtl"
          />
        </div>
        <Button type="submit">Add type</Button>
      </form>

      {editingId && edit ? (
        <div className="rounded-md border bg-card p-4 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">Edit type</h2>
              <p className="text-sm text-muted-foreground">{editingId}</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={cancelEdit}>
                Cancel
              </Button>
              <Button onClick={() => void saveEdit()}>Save</Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Name (FR) *</Label>
              <Input
                value={edit.name_fr}
                onChange={(e) =>
                  setEdit((p) => (p ? { ...p, name_fr: e.target.value } : p))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Name (EN)</Label>
              <Input
                value={edit.name_en}
                onChange={(e) =>
                  setEdit((p) => (p ? { ...p, name_en: e.target.value } : p))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Name (AR)</Label>
              <Input
                value={edit.name_ar}
                onChange={(e) =>
                  setEdit((p) => (p ? { ...p, name_ar: e.target.value } : p))
                }
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Label (FR)</Label>
              <Input
                value={edit.label_fr}
                onChange={(e) =>
                  setEdit((p) => (p ? { ...p, label_fr: e.target.value } : p))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Label (EN)</Label>
              <Input
                value={edit.label_en}
                onChange={(e) =>
                  setEdit((p) => (p ? { ...p, label_en: e.target.value } : p))
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Label (AR)</Label>
              <Input
                value={edit.label_ar}
                onChange={(e) =>
                  setEdit((p) => (p ? { ...p, label_ar: e.target.value } : p))
                }
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Description (FR)</Label>
              <Input
                value={edit.description_fr}
                onChange={(e) =>
                  setEdit((p) =>
                    p ? { ...p, description_fr: e.target.value } : p,
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Description (EN)</Label>
              <Input
                value={edit.description_en}
                onChange={(e) =>
                  setEdit((p) =>
                    p ? { ...p, description_en: e.target.value } : p,
                  )
                }
              />
            </div>
            <div className="space-y-1">
              <Label>Description (AR)</Label>
              <Input
                value={edit.description_ar}
                onChange={(e) =>
                  setEdit((p) =>
                    p ? { ...p, description_ar: e.target.value } : p,
                  )
                }
                dir="rtl"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-1">
              <Label>Gender</Label>
              <Input
                value={edit.gender}
                onChange={(e) =>
                  setEdit((p) => (p ? { ...p, gender: e.target.value } : p))
                }
                placeholder="male/female/unisex"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Banner image URL</Label>
            <Input
              value={edit.banner_image_url}
              onChange={(e) =>
                setEdit((p) =>
                  p ? { ...p, banner_image_url: e.target.value } : p,
                )
              }
              placeholder="https://..."
            />
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (!file) return;
                  setUploadingBanner(true);
                  try {
                    const url = await uploadImage(file, apiBase ?? "", {
                      folder: "product-types",
                    });
                    setEdit((p) => (p ? { ...p, banner_image_url: url } : p));
                    toast.success("Banner uploaded.");
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Upload failed.",
                    );
                  } finally {
                    setUploadingBanner(false);
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">
                {uploadingBanner ? "Uploading..." : "Upload banner"}
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Thumbnail image URL (used in app drawer & chips)</Label>
            <Input
              value={edit.image_url}
              onChange={(e) =>
                setEdit((p) => (p ? { ...p, image_url: e.target.value } : p))
              }
              placeholder="https://..."
            />
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="image/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (!file) return;
                  setUploadingBanner(true);
                  try {
                    const url = await uploadImage(file, apiBase ?? "", {
                      folder: "product-type-thumbs",
                    });
                    setEdit((p) => (p ? { ...p, image_url: url } : p));
                    toast.success("Thumbnail uploaded.");
                  } catch (err) {
                    toast.error(
                      err instanceof Error ? err.message : "Upload failed.",
                    );
                  } finally {
                    setUploadingBanner(false);
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">
                {uploadingBanner ? "Uploading..." : "Upload thumbnail"}
              </span>
            </div>
          </div>
        </div>
      ) : null}

      <div className="rounded-md border bg-card">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">Loading types...</p>
        ) : loadError === "not_logged_in" ? (
          <div className="p-4 space-y-2">
            <p className="text-sm text-muted-foreground">
              You need to log in to view and manage types.
            </p>
            <Button asChild size="sm">
              <Link href="/auth/v1/login">Log in</Link>
            </Button>
          </div>
        ) : loadError ? (
          <div className="p-4 space-y-2">
            <p className="text-sm text-destructive">{loadError}</p>
            <p className="text-xs text-muted-foreground">
              Ensure the API is running (e.g. go run ./cmd/maisonadrar-api) and
              NEXT_PUBLIC_API_BASE_URL is set (e.g. http://localhost:8080).
            </p>
            <Button variant="outline" size="sm" onClick={() => void load()}>
              Retry
            </Button>
          </div>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No types yet. Add one above or run migrations to load seeded data.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2 text-left">Name (EN/FR)</th>
                <th className="px-3 py-2 text-left">Label (EN/FR)</th>
                <th className="px-3 py-2 text-left">Gender</th>
                <th className="px-3 py-2 text-left">Banner / Description</th>
                <th className="px-3 py-2 text-left">Created</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((t) => (
                <tr key={t.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">
                    <div className="max-w-[220px]">
                      <div
                        className="font-medium truncate"
                        title={t.name_fr ?? t.name ?? ""}
                      >
                        {t.name_fr ?? t.name ?? "-"}
                      </div>
                      {t.name_en ? (
                        <div className="text-muted-foreground truncate">
                          EN: {t.name_en}
                        </div>
                      ) : null}
                      {t.name_ar ? (
                        <div
                          className="text-muted-foreground truncate"
                          dir="rtl"
                        >
                          AR: {t.name_ar}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    <div className="max-w-[220px]">
                      <div
                        className="truncate"
                        title={t.label_fr ?? t.label ?? ""}
                      >
                        {t.label_fr ?? t.label ?? "-"}
                      </div>
                      {t.label_en ? (
                        <div className="truncate">EN: {t.label_en}</div>
                      ) : null}
                      {t.label_ar ? (
                        <div className="truncate" dir="rtl">
                          AR: {t.label_ar}
                        </div>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {t.gender ?? "-"}
                  </td>
                  <td
                    className="px-3 py-2 max-w-[180px] truncate text-muted-foreground"
                    title={
                      t.banner_image_url ??
                      t.description_fr ??
                      t.description ??
                      ""
                    }
                  >
                    {t.banner_image_url ? "🖼" : ""} {t.description ? "📝" : ""}{" "}
                    {!t.banner_image_url && !t.description ? "-" : ""}
                  </td>
                  <td className="px-3 py-2">
                    {t.created_at
                      ? new Date(t.created_at).toLocaleDateString()
                      : "-"}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-1"
                      onClick={() => beginEdit(t)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(t.id)}
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
