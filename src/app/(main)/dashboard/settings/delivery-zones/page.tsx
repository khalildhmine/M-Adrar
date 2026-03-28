"use client";

import { useCallback, useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  createDeliveryCity,
  createQuartier,
  deleteDeliveryCity,
  deleteQuartier,
  listDeliveryCities,
  updateDeliveryCity,
  updateQuartier,
  type DeliveryCity,
} from "@/lib/delivery-admin-api";

function mru(cents: number) {
  return `${(cents / 100).toFixed(0)} MRU`;
}

export default function DeliveryZonesPage() {
  const [cities, setCities] = useState<DeliveryCity[]>([]);
  const [loading, setLoading] = useState(true);
  const [msg, setMsg] = useState<string | null>(null);
  const [newCity, setNewCity] = useState({ name: "", feeCents: "10000" });
  const [editingCity, setEditingCity] = useState<Record<string, { name: string; fee: string }>>({});
  const [newQ, setNewQ] = useState<Record<string, { name: string; fee: string; order: string }>>({});

  const load = useCallback(async () => {
    setLoading(true);
    setMsg(null);
    try {
      const list = await listDeliveryCities();
      setCities(list);
      const ed: Record<string, { name: string; fee: string }> = {};
      for (const c of list) {
        ed[c.id] = { name: c.name, fee: String(c.default_shipping_fee_cents) };
      }
      setEditingCity(ed);
    } catch (e: unknown) {
      setMsg(e instanceof Error ? e.message : "Load failed");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Cities & delivery zones</h1>
        <p className="text-muted-foreground text-sm">
          Mauritanian cities (type: city). Each quartier has its own delivery fee (cents). Mobile
          users pick city then quartier; checkout uses quartier fee when set.
        </p>
      </div>

      {msg ? <p className="text-destructive text-sm">{msg}</p> : null}

      <Card>
        <CardHeader>
          <CardTitle>Add city</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap items-end gap-3">
          <div className="space-y-1">
            <Label>Name</Label>
            <Input
              placeholder="e.g. Kaédi"
              value={newCity.name}
              onChange={(e) => setNewCity((s) => ({ ...s, name: e.target.value }))}
            />
          </div>
          <div className="space-y-1">
            <Label>Default fee (cents)</Label>
            <Input
              type="number"
              value={newCity.feeCents}
              onChange={(e) => setNewCity((s) => ({ ...s, feeCents: e.target.value }))}
            />
          </div>
          <Button
            type="button"
            disabled={loading || !newCity.name.trim()}
            onClick={async () => {
              try {
                await createDeliveryCity({
                  name: newCity.name.trim(),
                  default_shipping_fee_cents: Number.parseInt(newCity.feeCents, 10) || 0,
                });
                setNewCity({ name: "", feeCents: "10000" });
                await load();
                setMsg("City added.");
              } catch (e: unknown) {
                setMsg(e instanceof Error ? e.message : "Error");
              }
            }}
          >
            <Plus className="mr-1 size-4" />
            Add city
          </Button>
        </CardContent>
      </Card>

      {loading ? (
        <p className="text-muted-foreground text-sm">Loading…</p>
      ) : (
        cities.map((city) => (
          <Card key={city.id}>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2">
              <CardTitle className="text-lg">{city.name}</CardTitle>
              <div className="flex flex-wrap items-center gap-2">
                <Input
                  className="w-40"
                  value={editingCity[city.id]?.name ?? city.name}
                  onChange={(e) =>
                    setEditingCity((m) => ({
                      ...m,
                      [city.id]: { ...m[city.id], name: e.target.value, fee: m[city.id]?.fee ?? "" },
                    }))
                  }
                />
                <Input
                  className="w-32"
                  type="number"
                  title="Default fee cents"
                  value={editingCity[city.id]?.fee ?? String(city.default_shipping_fee_cents)}
                  onChange={(e) =>
                    setEditingCity((m) => ({
                      ...m,
                      [city.id]: {
                        name: m[city.id]?.name ?? city.name,
                        fee: e.target.value,
                      },
                    }))
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  onClick={async () => {
                    const ed = editingCity[city.id];
                    if (!ed) return;
                    try {
                      await updateDeliveryCity(city.id, {
                        name: ed.name.trim(),
                        default_shipping_fee_cents: Number.parseInt(ed.fee, 10) || 0,
                      });
                      await load();
                      setMsg("City updated.");
                    } catch (e: unknown) {
                      setMsg(e instanceof Error ? e.message : "Error");
                    }
                  }}
                >
                  Save city
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="destructive"
                  onClick={async () => {
                    if (!confirm(`Delete city "${city.name}" and all its quartiers?`)) return;
                    try {
                      await deleteDeliveryCity(city.id);
                      await load();
                      setMsg("City deleted.");
                    } catch (e: unknown) {
                      setMsg(e instanceof Error ? e.message : "Error");
                    }
                  }}
                >
                  <Trash2 className="size-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-muted-foreground text-sm">
                Default if no quartier: {mru(city.default_shipping_fee_cents)}
              </p>
              <div className="space-y-2">
                {city.quartiers.map((q) => (
                  <div
                    key={q.id}
                    className="flex flex-wrap items-center gap-2 rounded-md border p-2"
                  >
                    <Input
                      className="max-w-xs"
                      defaultValue={q.name}
                      id={`qname-${q.id}`}
                    />
                    <Input
                      className="w-28"
                      type="number"
                      defaultValue={q.delivery_fee_cents}
                      id={`qfee-${q.id}`}
                    />
                    <span className="text-muted-foreground text-xs">{mru(q.delivery_fee_cents)}</span>
                    <Input
                      className="w-20"
                      type="number"
                      defaultValue={q.sort_order}
                      id={`qord-${q.id}`}
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={async () => {
                        const nameEl = document.getElementById(`qname-${q.id}`) as HTMLInputElement;
                        const feeEl = document.getElementById(`qfee-${q.id}`) as HTMLInputElement;
                        const ordEl = document.getElementById(`qord-${q.id}`) as HTMLInputElement;
                        try {
                          await updateQuartier(q.id, {
                            name: nameEl.value.trim(),
                            delivery_fee_cents: Number.parseInt(feeEl.value, 10) || 0,
                            sort_order: Number.parseInt(ordEl.value, 10) || 0,
                          });
                          await load();
                          setMsg("Quartier saved.");
                        } catch (e: unknown) {
                          setMsg(e instanceof Error ? e.message : "Error");
                        }
                      }}
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      onClick={async () => {
                        if (!confirm("Delete this quartier?")) return;
                        try {
                          await deleteQuartier(q.id);
                          await load();
                        } catch (e: unknown) {
                          setMsg(e instanceof Error ? e.message : "Error");
                        }
                      }}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap items-end gap-2 border-t pt-4">
                <div className="space-y-1">
                  <Label className="text-xs">New quartier</Label>
                  <Input
                    placeholder="Name"
                    value={newQ[city.id]?.name ?? ""}
                    onChange={(e) =>
                      setNewQ((m) => ({
                        ...m,
                        [city.id]: {
                          name: e.target.value,
                          fee: m[city.id]?.fee ?? "10000",
                          order: m[city.id]?.order ?? "0",
                        },
                      }))
                    }
                  />
                </div>
                <Input
                  className="w-28"
                  type="number"
                  placeholder="cents"
                  value={newQ[city.id]?.fee ?? "10000"}
                  onChange={(e) =>
                    setNewQ((m) => ({
                      ...m,
                      [city.id]: {
                        name: m[city.id]?.name ?? "",
                        fee: e.target.value,
                        order: m[city.id]?.order ?? "0",
                      },
                    }))
                  }
                />
                <Input
                  className="w-20"
                  type="number"
                  placeholder="order"
                  value={newQ[city.id]?.order ?? "0"}
                  onChange={(e) =>
                    setNewQ((m) => ({
                      ...m,
                      [city.id]: {
                        name: m[city.id]?.name ?? "",
                        fee: m[city.id]?.fee ?? "10000",
                        order: e.target.value,
                      },
                    }))
                  }
                />
                <Button
                  type="button"
                  size="sm"
                  disabled={!newQ[city.id]?.name?.trim()}
                  onClick={async () => {
                    const row = newQ[city.id];
                    if (!row?.name?.trim()) return;
                    try {
                      await createQuartier(city.id, {
                        name: row.name.trim(),
                        delivery_fee_cents: Number.parseInt(row.fee, 10) || 0,
                        sort_order: Number.parseInt(row.order, 10) || 0,
                      });
                      setNewQ((m) => ({ ...m, [city.id]: { name: "", fee: "10000", order: "0" } }));
                      await load();
                      setMsg("Quartier added.");
                    } catch (e: unknown) {
                      setMsg(e instanceof Error ? e.message : "Error");
                    }
                  }}
                >
                  Add quartier
                </Button>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
}
