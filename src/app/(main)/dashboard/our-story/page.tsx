"use client";

import { useCallback, useEffect, useState } from "react";

import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { uploadImage } from "@/lib/cloudinary-upload";

type Section = {
  id: string;
  title_en?: string | null;
  title_fr?: string | null;
  title_ar?: string | null;
  subtitle_en?: string | null;
  subtitle_fr?: string | null;
  subtitle_ar?: string | null;
  description_en?: string | null;
  description_fr?: string | null;
  description_ar?: string | null;
  banner_image?: string | null;
  video_url?: string | null;
  order: number;
  created_at?: string;
  updated_at?: string;
};

const emptySection = (): Section => ({
  id: "",
  title_en: "",
  title_fr: "",
  title_ar: "",
  subtitle_en: "",
  subtitle_fr: "",
  subtitle_ar: "",
  description_en: "",
  description_fr: "",
  description_ar: "",
  banner_image: "",
  video_url: "",
  order: 1,
});

export default function OurStoryPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;
  const [sections, setSections] = useState<Section[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState<Section>(emptySection());
  const [editingId, setEditingId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingBanner, setUploadingBanner] = useState(false);
  const [uploadingVideo, setUploadingVideo] = useState(false);

  const load = useCallback(async () => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`${apiBase}/v1/admin/our-story`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        sections?: Section[];
        error?: string;
      };
      if (!res.ok) throw new Error(data.error ?? "Failed to load.");
      setSections(Array.isArray(data.sections) ? data.sections : []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error loading Our Story.",
      );
      setSections([]);
    } finally {
      setLoading(false);
    }
  }, [apiBase]);

  useEffect(() => {
    void load();
  }, [load]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setSaving(true);
    try {
      const payload = {
        title_en: form.title_en || null,
        title_fr: form.title_fr || null,
        title_ar: form.title_ar || null,
        subtitle_en: form.subtitle_en || null,
        subtitle_fr: form.subtitle_fr || null,
        subtitle_ar: form.subtitle_ar || null,
        description_en: form.description_en || null,
        description_fr: form.description_fr || null,
        description_ar: form.description_ar || null,
        banner_image: form.banner_image || null,
        video_url: form.video_url || null,
        order: form.order || 1,
      };
      if (editingId) {
        const res = await fetch(`${apiBase}/v1/admin/our-story/${editingId}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => ({}))) as {
          section?: Section;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Update failed.");
        setSections((prev) =>
          prev.map((s) => (s.id === editingId ? data.section! : s)),
        );
        toast.success("Section updated.");
      } else {
        const res = await fetch(`${apiBase}/v1/admin/our-story`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(payload),
        });
        const data = (await res.json().catch(() => ({}))) as {
          section?: Section;
          error?: string;
        };
        if (!res.ok) throw new Error(data.error ?? "Create failed.");
        setSections((prev) => [...prev, data.section!]);
        toast.success("Section created.");
      }
      setForm(emptySection());
      setEditingId(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    try {
      const res = await fetch(`${apiBase}/v1/admin/our-story/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error("Delete failed.");
      setSections((prev) => prev.filter((s) => s.id !== id));
      if (editingId === id) {
        setForm(emptySection());
        setEditingId(null);
      }
      toast.success("Section deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Delete failed.");
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Our Story</h1>
        <p className="text-sm text-muted-foreground">
          Manage &quot;Our Story&quot; sections shown on the frontend
          (multilingual titles, subtitles, descriptions, banner, video).
        </p>
      </div>

      <form
        onSubmit={submit}
        className="rounded-md border bg-card p-6 space-y-6"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Title (EN)</Label>
            <Input
              value={form.title_en ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_en: e.target.value }))
              }
              placeholder="Our Story"
            />
          </div>
          <div className="space-y-2">
            <Label>Title (FR)</Label>
            <Input
              value={form.title_fr ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_fr: e.target.value }))
              }
              placeholder="Notre Histoire"
            />
          </div>
          <div className="space-y-2">
            <Label>Title (AR)</Label>
            <Input
              value={form.title_ar ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, title_ar: e.target.value }))
              }
              placeholder="قصتنا"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Subtitle (EN)</Label>
            <Input
              value={form.subtitle_en ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, subtitle_en: e.target.value }))
              }
              placeholder="The Journey of Maison Adrar"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle (FR)</Label>
            <Input
              value={form.subtitle_fr ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, subtitle_fr: e.target.value }))
              }
              placeholder="Le parcours de Maison Adrar"
            />
          </div>
          <div className="space-y-2">
            <Label>Subtitle (AR)</Label>
            <Input
              value={form.subtitle_ar ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, subtitle_ar: e.target.value }))
              }
              placeholder="رحلة ميزون أدرار"
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label>Description (EN)</Label>
            <Textarea
              value={form.description_en ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_en: e.target.value }))
              }
              placeholder="Main content in English..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (FR)</Label>
            <Textarea
              value={form.description_fr ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_fr: e.target.value }))
              }
              placeholder="Contenu en français..."
              rows={4}
            />
          </div>
          <div className="space-y-2">
            <Label>Description (AR)</Label>
            <Textarea
              value={form.description_ar ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, description_ar: e.target.value }))
              }
              placeholder="المحتوى بالعربية..."
              rows={4}
            />
          </div>
        </div>
        <div className="flex flex-wrap gap-4">
          <div className="space-y-2 min-w-[200px] flex-1">
            <Label>Banner image URL</Label>
            <Input
              value={form.banner_image ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, banner_image: e.target.value }))
              }
              placeholder="/images/story-banner.jpg or https://..."
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
                      folder: "our-story",
                    });
                    setForm((f) => ({ ...f, banner_image: url }));
                    toast.success("Banner uploaded.");
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Banner upload failed.",
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
          <div className="space-y-2 min-w-[200px] flex-1">
            <Label>Video URL (optional)</Label>
            <Input
              value={form.video_url ?? ""}
              onChange={(e) =>
                setForm((f) => ({ ...f, video_url: e.target.value }))
              }
              placeholder="https://youtube.com/..."
            />
            <div className="flex items-center gap-2">
              <input
                type="file"
                accept="video/*"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  e.currentTarget.value = "";
                  if (!file) return;
                  setUploadingVideo(true);
                  try {
                    // Same signed upload works for videos on Cloudinary when configured.
                    const url = await uploadImage(file, apiBase ?? "", {
                      folder: "our-story",
                    });
                    setForm((f) => ({ ...f, video_url: url }));
                    toast.success("Video uploaded.");
                  } catch (err) {
                    toast.error(
                      err instanceof Error
                        ? err.message
                        : "Video upload failed.",
                    );
                  } finally {
                    setUploadingVideo(false);
                  }
                }}
              />
              <span className="text-xs text-muted-foreground">
                {uploadingVideo ? "Uploading..." : "Upload video"}
              </span>
            </div>
          </div>
          <div className="space-y-2 w-24">
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
        <div className="flex gap-2">
          <Button type="submit" disabled={saving}>
            {editingId ? "Update section" : "Add section"}
          </Button>
          {editingId && (
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setForm(emptySection());
                setEditingId(null);
              }}
            >
              Cancel edit
            </Button>
          )}
        </div>
      </form>

      <div className="rounded-md border bg-card">
        {loading ? (
          <p className="p-4 text-sm text-muted-foreground">
            Loading sections...
          </p>
        ) : sections.length === 0 ? (
          <p className="p-4 text-sm text-muted-foreground">
            No sections yet. Add one above.
          </p>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="px-3 py-2 text-left">Order</th>
                <th className="px-3 py-2 text-left">Title (EN / FR)</th>
                <th className="px-3 py-2 text-left">Banner / Video</th>
                <th className="px-3 py-2 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sections.map((s) => (
                <tr key={s.id} className="border-b last:border-b-0">
                  <td className="px-3 py-2">{s.order}</td>
                  <td className="px-3 py-2">
                    <span className="font-medium">{s.title_en ?? "-"}</span>
                    {s.title_fr && (
                      <span className="text-muted-foreground ml-1">
                        / {s.title_fr}
                      </span>
                    )}
                  </td>
                  <td className="px-3 py-2 text-muted-foreground">
                    {s.banner_image ? "🖼" : ""} {s.video_url ? "🎬" : ""}{" "}
                    {!s.banner_image && !s.video_url ? "-" : ""}
                  </td>
                  <td className="px-3 py-2 text-right">
                    <Button
                      variant="outline"
                      size="sm"
                      className="mr-1"
                      onClick={() => {
                        setForm({ ...s });
                        setEditingId(s.id);
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => remove(s.id)}
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
