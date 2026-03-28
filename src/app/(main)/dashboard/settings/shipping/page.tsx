"use client";

import { useEffect, useState } from "react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getFreeShippingThreshold, setFreeShippingThreshold } from "@/lib/content-admin-api";

export default function ShippingSettingsPage() {
  const [value, setValue] = useState<string>("500000");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setMessage(null);
    try {
      const v = await getFreeShippingThreshold();
      setValue(String(v));
    } catch (e: any) {
      setMessage(e?.message ?? "Failed to load setting");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function onSave() {
    setLoading(true);
    setMessage(null);
    try {
      const cents = parseInt(value || "0", 10) || 0;
      await setFreeShippingThreshold(cents);
      setMessage("Saved.");
      await load();
    } catch (e: any) {
      setMessage(e?.message ?? "Failed to save setting");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold">Shipping</h1>
          <p className="text-sm text-muted-foreground">
            Configure the free shipping threshold used by checkout/shipping.
          </p>
        </div>
        <Button onClick={onSave} disabled={loading}>
          Save
        </Button>
      </div>

      {message ? (
        <Card>
          <CardContent className="pt-6 text-sm">{message}</CardContent>
        </Card>
      ) : null}

      <Card>
        <CardHeader>
          <CardTitle>Free shipping threshold</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <Label>Threshold (cents)</Label>
          <Input type="number" value={value} onChange={(e) => setValue(e.target.value)} />
          <p className="text-sm text-muted-foreground">
            Example: <span className="font-medium">500000</span> = <span className="font-medium">5000.00 MRU</span>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
