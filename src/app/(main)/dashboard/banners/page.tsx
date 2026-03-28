"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import {
  ImageIcon,
  Link as LinkIcon,
  Loader2,
  ToggleLeft,
  ToggleRight,
  Upload,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { uploadImage } from "@/lib/cloudinary-upload";

type Banner = {
  id: string;
  title?: string | null;
  image_url: string;
  link_url?: string | null;
  position: number;
  active: boolean;
};

export default function BannersPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [items, setItems] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);

  const [title, setTitle] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [position, setPosition] = useState<number | "">("");
  const [active, setActive] = useState(true);

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/v1/admin/banners`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        banners?: Banner[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load banners.");
      setItems(Array.isArray(data.banners) ? data.banners : []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error loading banners.",
      );
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

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
      const url = await uploadImage(file, apiBase ?? "", { folder: "banners" });
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
      toast.error("Image is required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        title: title.trim() || undefined,
        image_url: imageUrl.trim(),
        link_url: linkUrl.trim() || undefined,
        position: position === "" ? undefined : Number(position),
        active,
      };
      const url =
        editingId === null
          ? `${apiBase}/v1/admin/banners`
          : `${apiBase}/v1/admin/banners/${editingId}`;
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
        banner?: Banner;
        error?: string;
      };
      if (!res.ok)
        throw new Error(
          data.error ??
            (editingId
              ? "Failed to update banner."
              : "Failed to create banner."),
        );
      toast.success(editingId ? "Banner updated." : "Banner created.");
      setTitle("");
      setImageUrl("");
      setLinkUrl("");
      setPosition("");
      setActive(true);
      if (data.banner) {
        setItems((prev) =>
          editingId === null
            ? [...prev, data.banner!]
            : prev.map((b) => (b.id === data.banner!.id ? data.banner! : b)),
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
            ? "Error updating banner."
            : "Error creating banner.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangeImage = async (banner: Banner) => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }
    const newUrl = window.prompt("New image URL", banner.image_url);
    if (!newUrl || !newUrl.trim()) return;
    setUpdatingId(banner.id);
    try {
      const res = await fetch(`${apiBase}/v1/admin/banners/${banner.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ image_url: newUrl.trim() }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        banner?: Banner;
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to update banner.");
      toast.success("Banner image updated.");
      if (data.banner) {
        setItems((prev) =>
          prev.map((b) => (b.id === banner.id ? data.banner! : b)),
        );
      } else {
        void load();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error updating banner.",
      );
    } finally {
      setUpdatingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Banners</h1>
        <p className="text-sm text-muted-foreground">
          Manage homepage banners displayed in the mobile app and storefront.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-md border bg-card p-4"
      >
        <h2 className="font-medium">
          {editingId ? "Edit banner" : "Add banner"}
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
              placeholder="Valentine's Collection"
            />
          </div>

          <div className="space-y-2">
            <Label>Image *</Label>
            <div className="flex gap-2">
              <Input
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="Upload or paste URL"
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
                  className="h-24 w-full max-w-xs rounded object-cover border"
                />
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="link_url">Link URL</Label>
            <div className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <Input
                id="link_url"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                placeholder="Optional link when banner is tapped"
              />
            </div>
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
          {saving ? "Saving..." : editingId ? "Save changes" : "Add banner"}
        </Button>
      </form>

      <div className="rounded-md border bg-card">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">
            Loading banners...
          </p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No banners yet. Add one above.
          </p>
        ) : (
          <>
            <div className="border-b px-3 py-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
              Homepage banners
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left">Preview</th>
                  <th className="px-3 py-2 text-left">Title</th>
                  <th className="px-3 py-2 text-left">Link</th>
                  <th className="px-3 py-2 text-left">Position</th>
                  <th className="px-3 py-2 text-left">Active</th>
                  <th className="px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {items.map((b) => (
                  <tr key={b.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2">
                      {b.image_url ? (
                        <img
                          src={b.image_url}
                          alt=""
                          className="h-12 w-24 rounded object-cover border"
                        />
                      ) : (
                        <span className="inline-flex items-center gap-1 text-muted-foreground">
                          <ImageIcon className="h-4 w-4" />
                          No image
                        </span>
                      )}
                    </td>
                    <td className="px-3 py-2 font-medium">{b.title ?? "—"}</td>
                    <td className="px-3 py-2">
                      {b.link_url ? (
                        <a
                          href={b.link_url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-blue-600 underline"
                        >
                          <LinkIcon className="h-3 w-3" />
                          {b.link_url}
                        </a>
                      ) : (
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
                        disabled={updatingId === b.id}
                        onClick={() => void handleChangeImage(b)}
                      >
                        {updatingId === b.id ? "Updating..." : "Change image"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="ml-2"
                        onClick={() => {
                          setEditingId(b.id);
                          setTitle(b.title ?? "");
                          setImageUrl(b.image_url || "");
                          setLinkUrl(b.link_url ?? "");
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

      {/* Gift selection banners */}
    </div>
  );
}
