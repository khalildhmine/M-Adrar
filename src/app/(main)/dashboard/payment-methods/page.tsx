"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { Loader2, Upload } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { uploadImage } from "@/lib/cloudinary-upload";

type PaymentMethod = {
  id: string;
  bank_name: string;
  logo_url?: string | null;
  account_name: string;
  account_phone: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
};

export default function PaymentMethodsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [items, setItems] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);

  const [bankName, setBankName] = useState("");
  const [accountName, setAccountName] = useState("");
  const [accountPhone, setAccountPhone] = useState("");
  const [active, setActive] = useState(true);
  const [logoUrl, setLogoUrl] = useState<string>("");

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
      const res = await fetch(`${apiBase}/v1/admin/payment-methods`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = (await res.json().catch(() => ({}))) as {
        payment_methods?: PaymentMethod[];
        error?: string;
      };
      if (!res.ok)
        throw new Error(data.error ?? "Failed to load payment methods.");
      setItems(Array.isArray(data.payment_methods) ? data.payment_methods : []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error loading payment methods.",
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
      const url = await uploadImage(file, apiBase ?? "", {
        folder: "payment_methods",
      });
      setLogoUrl(url);
      toast.success("Logo uploaded.");
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
    if (!bankName.trim() || !accountName.trim() || !accountPhone.trim()) {
      toast.error("Bank name, account name, and account phone are required.");
      return;
    }
    setSaving(true);
    try {
      const payload = {
        bank_name: bankName.trim(),
        logo_url: logoUrl.trim() ? logoUrl.trim() : null,
        account_name: accountName.trim(),
        account_phone: accountPhone.trim(),
        is_active: active,
      };
      const res = await fetch(`${apiBase}/v1/admin/payment-methods`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as {
        payment_method?: PaymentMethod;
        error?: string;
      };
      if (!res.ok)
        throw new Error(data.error ?? "Failed to create payment method.");
      toast.success("Payment method created.");
      setBankName("");
      setAccountName("");
      setAccountPhone("");
      setActive(true);
      setLogoUrl("");
      if (data.payment_method) {
        setItems((prev) => [...prev, data.payment_method!]);
      } else {
        void load();
      }
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error creating payment method.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Payment methods</h1>
        <p className="text-sm text-muted-foreground">
          Manage bank accounts shown in mobile checkout.
        </p>
      </div>

      <form
        onSubmit={submit}
        className="space-y-4 rounded-md border bg-card p-4"
      >
        <h2 className="font-medium">Add payment method</h2>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="bank_name">Bank name *</Label>
            <Input
              id="bank_name"
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="BMCI"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_name">Account name *</Label>
            <Input
              id="account_name"
              value={accountName}
              onChange={(e) => setAccountName(e.target.value)}
              placeholder="Maison Adrar"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account_phone">Account phone *</Label>
            <Input
              id="account_phone"
              value={accountPhone}
              onChange={(e) => setAccountPhone(e.target.value)}
              placeholder="+222XXXXXXXX"
            />
          </div>

          <div className="space-y-2">
            <Label>Logo (upload)</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={handleUploadClick}
                disabled={uploading}
              >
                {uploading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Upload className="mr-2 h-4 w-4" />
                )}
                Upload logo
              </Button>
              {logoUrl ? (
                <div className="flex min-w-0 flex-1 items-center truncate rounded-md border px-3 text-sm text-muted-foreground">
                  {logoUrl}
                </div>
              ) : (
                <div className="flex min-w-0 flex-1 items-center truncate rounded-md border px-3 text-sm text-muted-foreground">
                  No logo uploaded
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Switch checked={active} onCheckedChange={setActive} />
          <span className="text-sm text-muted-foreground">
            {active ? "Active" : "Inactive"}
          </span>
        </div>

        <div className="flex justify-end">
          <Button type="submit" disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Create
          </Button>
        </div>
      </form>

      <div className="rounded-md border bg-card">
        <div className="border-b p-4">
          <h2 className="font-medium">Existing methods</h2>
          <p className="text-sm text-muted-foreground">
            These are available to customers (active only).
          </p>
        </div>

        <div className="p-4">
          {loading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : items.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No payment methods yet.
            </p>
          ) : (
            <div className="grid gap-3 md:grid-cols-2">
              {items.map((pm) => (
                <div key={pm.id} className="rounded-md border p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-medium">
                        {pm.bank_name}{" "}
                        <span className="text-xs text-muted-foreground">
                          {pm.is_active ? "• Active" : "• Inactive"}
                        </span>
                      </div>
                      <div className="mt-1 text-sm text-muted-foreground">
                        {pm.account_name} • {pm.account_phone}
                      </div>
                      {pm.logo_url ? (
                        <div className="mt-2 truncate text-xs text-muted-foreground">
                          {pm.logo_url}
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
