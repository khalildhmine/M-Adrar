"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/cloudinary-upload";

type Ingredient = {
  id: string;
  name: string;
  image_url?: string | null;
  color_hex?: string | null;
  description?: string | null;
};

export default function IngredientsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [items, setItems] = useState<Ingredient[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [colorHex, setColorHex] = useState("");
  const [description, setDescription] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/v1/admin/ingredients`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        ingredients?: Ingredient[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load ingredients.");
      setItems(Array.isArray(data.ingredients) ? data.ingredients : []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error loading ingredients.",
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
      const url = await uploadImage(file, apiBase ?? "", { folder: "ingredients" });
      setImageUrl(url);
      toast.success("Image uploaded.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const create = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) {
      toast.error("Please log in.");
      return;
    }
    if (!name.trim()) {
      toast.error("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/ingredients`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: name.trim(),
          image_url: imageUrl.trim() || undefined,
          color_hex: colorHex.trim() || undefined,
          description: description.trim() || undefined,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as {
        ingredient?: Ingredient;
        error?: string;
      };
      if (!res.ok)
        throw new Error(data.error ?? "Failed to create ingredient.");
      toast.success("Ingredient created.");
      setName("");
      setImageUrl("");
      setColorHex("");
      setDescription("");
      if (data.ingredient) setItems((prev) => [...prev, data.ingredient!]);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error creating ingredient.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Ingredients</h1>
        <p className="text-sm text-muted-foreground">
          Manage ingredients for products. Upload an image for each ingredient;
          they appear in the product form dropdown.
        </p>
      </div>

      <form
        onSubmit={create}
        className="space-y-4 rounded-md border bg-card p-4"
      >
        <h2 className="font-medium">Add ingredient</h2>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Oud"
            />
          </div>
          <div className="space-y-2">
            <Label>Image</Label>
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
                  className="h-16 w-16 rounded object-cover border"
                />
              </div>
            )}
          </div>
          <div className="space-y-2">
            <Label htmlFor="color_hex">Color (hex)</Label>
            <Input
              id="color_hex"
              value={colorHex}
              onChange={(e) => setColorHex(e.target.value)}
              placeholder="#aabbcc"
            />
          </div>
          <div className="space-y-2 md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Optional description"
            />
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Add ingredient"}
        </Button>
      </form>

      <div className="rounded-md border bg-card">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">
            Loading ingredients...
          </p>
        ) : items.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No ingredients yet. Add one above.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2 text-left">Image</th>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">Color</th>
                <th className="px-3 py-2 text-left">Description</th>
              </tr>
            </thead>
            <tbody>
              {items.map((ing) => (
                <tr key={ing.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">
                    {ing.image_url ? (
                      <img
                        src={ing.image_url}
                        alt=""
                        className="h-10 w-10 rounded object-cover border"
                      />
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="px-3 py-2 font-medium">{ing.name}</td>
                  <td className="px-3 py-2">
                    {ing.color_hex ? (
                      <span className="inline-flex items-center gap-1">
                        <span
                          className="h-4 w-4 rounded border shrink-0"
                          style={{ backgroundColor: ing.color_hex }}
                        />
                        {ing.color_hex}
                      </span>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground max-w-[200px] truncate">
                    {ing.description ?? "—"}
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
