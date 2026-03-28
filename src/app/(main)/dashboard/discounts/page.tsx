"use client";

import { useEffect, useState } from "react";

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

type Discount = {
  id: string;
  code: string;
  type: string;
  value: number;
  min_order_cents?: number | null;
  max_uses?: number | null;
  uses_count: number;
  valid_from: string;
  valid_to: string;
  created_at: string;
};

export default function DiscountsPage() {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [code, setCode] = useState("");
  const [type, setType] = useState<"percent" | "fixed" | "">("");
  const [value, setValue] = useState<string>("");
  const [minOrderCents, setMinOrderCents] = useState<string>("");
  const [maxUses, setMaxUses] = useState<string>("");
  const [validFrom, setValidFrom] = useState<string>("");
  const [validTo, setValidTo] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [loadingList, setLoadingList] = useState(true);
  const [discounts, setDiscounts] = useState<Discount[]>([]);

  const loadDiscounts = async () => {
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("admin_token")
        : null;
    if (!token) {
      setLoadingList(false);
      return;
    }
    setLoadingList(true);
    try {
      const res = await fetch(
        `${apiBase}/v1/admin/discounts?limit=100&offset=0`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      const data = (await res.json().catch(() => ({}))) as {
        discounts?: Discount[];
        error?: string;
      };
      if (!res.ok) {
        toast.error(data.error ?? "Failed to load discounts.");
        setDiscounts([]);
        return;
      }
      setDiscounts(Array.isArray(data.discounts) ? data.discounts : []);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Failed to load discounts.",
      );
      setDiscounts([]);
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    void loadDiscounts();
  }, []);

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
    if (!code.trim() || !type || !value.trim() || !validFrom || !validTo) {
      toast.error("Code, type, value, start and end are required.");
      return;
    }

    setSaving(true);
    try {
      const body = {
        code: code.trim(),
        type,
        value: Number(value) || 0,
        min_order_cents: minOrderCents.trim()
          ? Number(minOrderCents)
          : undefined,
        max_uses: maxUses.trim() ? Number(maxUses) : undefined,
        valid_from: new Date(validFrom).toISOString(),
        valid_to: new Date(validTo).toISOString(),
      };
      const res = await fetch(`${apiBase}/v1/admin/discounts`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Failed to create discount.");
      toast.success("Discount code created.");
      setCode("");
      setType("");
      setValue("");
      setMinOrderCents("");
      setMaxUses("");
      setValidFrom("");
      setValidTo("");
      void loadDiscounts();
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Error creating discount.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Discount codes</h1>
        <p className="text-sm text-muted-foreground">
          Create discount codes with value and start/end date-time. You can then
          use them in the mobile app with a countdown.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-md border bg-card p-4 space-y-4 max-w-2xl"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="code">Code *</Label>
            <Input
              id="code"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="SPRING15"
            />
          </div>
          <div className="space-y-2">
            <Label>Type *</Label>
            <Select value={type} onValueChange={(v) => setType(v as any)}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="percent">Percent (%)</SelectItem>
                <SelectItem value="fixed">Fixed amount</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="value">Value *</Label>
            <Input
              id="value"
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="e.g. 15 for 15%"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="min_order">Min order (cents)</Label>
            <Input
              id="min_order"
              type="number"
              min={0}
              value={minOrderCents}
              onChange={(e) => setMinOrderCents(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="max_uses">Max uses</Label>
            <Input
              id="max_uses"
              type="number"
              min={1}
              value={maxUses}
              onChange={(e) => setMaxUses(e.target.value)}
              placeholder="optional"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valid_from">Starts at *</Label>
            <Input
              id="valid_from"
              type="datetime-local"
              value={validFrom}
              onChange={(e) => setValidFrom(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="valid_to">Ends at *</Label>
            <Input
              id="valid_to"
              type="datetime-local"
              value={validTo}
              onChange={(e) => setValidTo(e.target.value)}
            />
          </div>
        </div>
        <Button type="submit" disabled={saving}>
          {saving ? "Saving..." : "Create discount"}
        </Button>
      </form>

      <div className="rounded-md border bg-card p-4 space-y-2 max-w-5xl">
        <h2 className="font-medium">Existing discounts</h2>
        {loadingList ? (
          <p className="text-sm text-muted-foreground">Loading discounts...</p>
        ) : discounts.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No discount codes yet.
          </p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b bg-muted/40">
                  <th className="px-3 py-2 text-left">Code</th>
                  <th className="px-3 py-2 text-left">Type</th>
                  <th className="px-3 py-2 text-left">Value</th>
                  <th className="px-3 py-2 text-left">Min order</th>
                  <th className="px-3 py-2 text-left">Uses</th>
                  <th className="px-3 py-2 text-left">Valid from</th>
                  <th className="px-3 py-2 text-left">Valid to</th>
                </tr>
              </thead>
              <tbody>
                {discounts.map((d) => (
                  <tr key={d.id} className="border-b last:border-b-0">
                    <td className="px-3 py-2 font-mono text-xs">{d.code}</td>
                    <td className="px-3 py-2 capitalize">{d.type}</td>
                    <td className="px-3 py-2">
                      {d.type === "percent"
                        ? `${d.value}%`
                        : `${d.value} cents`}
                    </td>
                    <td className="px-3 py-2">
                      {d.min_order_cents != null ? d.min_order_cents : "-"}
                    </td>
                    <td className="px-3 py-2">
                      {d.uses_count}
                      {d.max_uses ? ` / ${d.max_uses}` : ""}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(d.valid_from).toLocaleString()}
                    </td>
                    <td className="px-3 py-2">
                      {new Date(d.valid_to).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
