"use client";

import { useEffect, useState } from "react";

import { useParams, useRouter } from "next/navigation";

import { Badge } from "@/components/ui/badge";

type Order = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  shipping_fee_cents?: number;
  tax_cents?: number;
  discount_cents?: number;
  discount_code?: string | null;
  currency: string;
  payment_method?: string | null;
  payment_method_id?: string | null;
  payment_proof_url?: string | null;
  shipping_city?: string | null;
  shipping_address_line1?: string | null;
  shipping_address_line2?: string | null;
  user_id: string;
  created_at: string;
};

type OrderItem = {
  id: string;
  product_variant_id: string;
  quantity: number;
  unit_price_cents: number;
  metadata: string;
  product_name?: string | null;
  product_main_image_url?: string | null;
  engraving_text?: string | null;
  engraving_status?: string | null;
  gift_wrap_selected?: boolean | null;
};

function fmtAmount(cents: number, currency: string) {
  const v = (cents ?? 0) / 100;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: currency || "MRU",
    maximumFractionDigits: 0,
  }).format(v);
}

function statusLabel(status: string) {
  switch (status) {
    case "pending_payment":
      return "En attente de paiement";
    case "processing":
      return "En préparation";
    case "shipped":
      return "Expédiée";
    case "delivered":
      return "Livrée";
    case "cancelled":
      return "Annulée";
    default:
      return status;
  }
}

export default function OrderDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showProofModal, setShowProofModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      router.push("/auth/v1/login");
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/v1/admin/orders/${params.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        if (!res.ok) {
          throw new Error(json.error ?? "Erreur lors du chargement.");
        }
        setOrder(json.order ?? null);
        setItems(Array.isArray(json.items) ? json.items : []);
      } catch {
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [apiBase, params.id, router]);

  if (loading) {
    return (
      <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
        Chargement de la commande...
      </div>
    );
  }

  if (!order) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          className="text-sm text-muted-foreground underline"
          onClick={() => router.push("/dashboard/orders")}
        >
          ← Retour aux commandes
        </button>
        <div className="rounded-md border bg-card p-4 text-sm text-destructive">
          Commande introuvable.
        </div>
      </div>
    );
  }

  const total = fmtAmount(order.total_cents, order.currency);
  const computedSubtotalCents = items.reduce(
    (sum, it) => sum + (it.unit_price_cents ?? 0) * (it.quantity ?? 0),
    0,
  );
  const shippingFeeCents = Number(order.shipping_fee_cents ?? 0) || 0;
  const taxCents = Number(order.tax_cents ?? 0) || 0;
  const discountCents = Number(order.discount_cents ?? 0) || 0;
  const discountCode = (order.discount_code ?? "").trim() || null;
  const totalBeforeDiscountCents =
    computedSubtotalCents + shippingFeeCents + taxCents;
  const inferredDiscountPercent =
    computedSubtotalCents > 0 && discountCents > 0
      ? Math.round((discountCents * 1000) / computedSubtotalCents) / 10
      : null;
  const hasAnyEngraving = items.some((it) => {
    // If backend already tells us there is an engraving request, trust it.
    if (it.engraving_status || it.engraving_text) {
      return true;
    }
    // Fallback: inspect metadata for legacy engraving flags.
    try {
      const meta = it.metadata ? JSON.parse(it.metadata) : {};
      return !!meta.engraving_text;
    } catch {
      return false;
    }
  });
  const firstEngravingName =
    items
      .map((it) => {
        try {
          const meta = it.metadata ? JSON.parse(it.metadata) : {};
          return it.engraving_text ?? meta.engraving_text;
        } catch {
          return it.engraving_text ?? null;
        }
      })
      .find((txt) => typeof txt === "string" && txt.trim().length > 0) || null;
  const hasAnyGiftWrap = items.some((it) => {
    try {
      const meta = it.metadata ? JSON.parse(it.metadata) : {};
      const giftWrap =
        typeof it.gift_wrap_selected === "boolean"
          ? it.gift_wrap_selected
          : !!meta.gift_wrap_selected;
      return giftWrap;
    } catch {
      return false;
    }
  });

  const updateStatus = async (nextStatus: string) => {
    const token = localStorage.getItem("admin_token");
    if (!token) return;
    setUpdatingStatus(true);
    try {
      const res = await fetch(`${apiBase}/v1/admin/orders/${order.id}/status`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "content-type": "application/json",
        },
        body: JSON.stringify({ status: nextStatus }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        // eslint-disable-next-line no-console
        console.error("[admin] update order status failed", json);
      } else if (json.order) {
        setOrder(json.order);
      }
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error("[admin] update order status error", err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  return (
    <div className="space-y-6">
      <button
        type="button"
        className="text-sm text-muted-foreground underline"
        onClick={() => router.push("/dashboard/orders")}
      >
        ← Retour aux commandes
      </button>

      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            Commande {order.order_number}
          </h1>
          <p className="text-sm text-muted-foreground">
            Total: {total} · Client ID: {order.user_id}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline">{statusLabel(order.status)}</Badge>
          {order.status === "pending_payment" && (
            <>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={updatingStatus}
                onClick={() => updateStatus("processing")}
              >
                {updatingStatus ? "Validation..." : "Confirmer la commande"}
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                disabled={updatingStatus}
                onClick={() => updateStatus("cancelled")}
              >
                Annuler
              </button>
            </>
          )}
          {order.status === "processing" && (
            <>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
                disabled={updatingStatus}
                onClick={() => updateStatus("shipped")}
              >
                {updatingStatus ? "Mise à jour..." : "Marquer comme expédiée"}
              </button>
              <button
                type="button"
                className="inline-flex items-center rounded-md bg-destructive px-3 py-1 text-xs font-medium text-destructive-foreground hover:bg-destructive/90 disabled:opacity-50"
                disabled={updatingStatus}
                onClick={() => updateStatus("cancelled")}
              >
                Annuler
              </button>
            </>
          )}
          {order.status === "shipped" && (
            <button
              type="button"
              className="inline-flex items-center rounded-md bg-primary px-3 py-1 text-xs font-medium text-primary-foreground hover:bg-primary/90 disabled:opacity-50"
              disabled={updatingStatus}
              onClick={() => updateStatus("delivered")}
            >
              {updatingStatus ? "Mise à jour..." : "Marquer comme livrée"}
            </button>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-md border bg-card p-4">
          <h2 className="text-sm font-semibold">Paiement</h2>
          <p className="text-sm text-muted-foreground">
            Méthode: {order.payment_method || "—"}
          </p>
          <p className="text-xs text-muted-foreground">
            ID méthode: {order.payment_method_id || "—"}
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Preuve de paiement:
          </p>
          {order.payment_proof_url ? (
            <div className="flex flex-col gap-2">
              <button
                type="button"
                className="inline-flex h-16 w-24 overflow-hidden rounded-md border bg-muted"
                onClick={() => setShowProofModal(true)}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={order.payment_proof_url}
                  alt="Preuve de paiement"
                  className="h-full w-full object-cover"
                />
              </button>
              <a
                href={order.payment_proof_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-primary underline break-all"
              >
                Ouvrir dans un nouvel onglet
              </a>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Aucune</p>
          )}
        </div>

        <div className="space-y-2 rounded-md border bg-card p-4">
          <h2 className="text-sm font-semibold">Livraison</h2>
          <p className="text-sm text-muted-foreground">
            Ville: {order.shipping_city || "—"}
          </p>
          <p className="text-sm text-muted-foreground">
            Adresse: {order.shipping_address_line1 || "—"}
          </p>
          {order.shipping_address_line2 ? (
            <p className="text-sm text-muted-foreground">
              Complément: {order.shipping_address_line2}
            </p>
          ) : null}
        </div>

        <div className="space-y-2 rounded-md border bg-card p-4">
          <h2 className="text-sm font-semibold">Prix</h2>
          <div className="space-y-1 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Sous-total</span>
              <span>{fmtAmount(computedSubtotalCents, order.currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Livraison</span>
              <span>{fmtAmount(shippingFeeCents, order.currency)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Total avant remise</span>
              <span>{fmtAmount(totalBeforeDiscountCents, order.currency)}</span>
            </div>
            {discountCents > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Remise</span>
                <span className="text-emerald-600">
                  - {fmtAmount(discountCents, order.currency)}
                  {inferredDiscountPercent != null
                    ? ` (≈ ${inferredDiscountPercent}%)`
                    : ""}
                </span>
              </div>
            ) : null}
            {discountCode ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">Code promo</span>
                <span className="font-medium">{discountCode}</span>
              </div>
            ) : null}
            {discountCode && discountCents <= 0 ? (
              <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 text-xs text-amber-900">
                Code promo enregistré, mais remise = 0. Cette commande a
                probablement été créée avant le fix serveur (type du code promo
                non reconnu), donc le total n’a pas été réduit.
              </div>
            ) : null}
            {taxCents > 0 ? (
              <div className="flex items-center justify-between gap-3">
                <span className="text-muted-foreground">TVA</span>
                <span>{fmtAmount(taxCents, order.currency)}</span>
              </div>
            ) : null}
            <div className="mt-2 flex items-center justify-between gap-3 border-t pt-2">
              <span className="font-semibold">Total après remise</span>
              <span className="font-semibold">
                {fmtAmount(order.total_cents, order.currency)}
              </span>
            </div>
          </div>
          <div className="mt-3 space-y-1">
            <p className="text-sm text-muted-foreground">
              Articles: {items.length}
            </p>
            <p className="text-sm text-muted-foreground">
              Créée le:{" "}
              {order.created_at
                ? new Date(order.created_at).toLocaleString("fr-FR")
                : "—"}
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="space-y-2 rounded-md border bg-card p-4">
          <h2 className="text-sm font-semibold">Personnalisation</h2>
          <p className="text-sm text-muted-foreground">
            Gravure: {hasAnyEngraving ? "Oui" : "Non"}
          </p>
          {firstEngravingName ? (
            <p className="text-sm text-muted-foreground">
              Nom gravure: {firstEngravingName}
            </p>
          ) : null}
          <p className="text-sm text-muted-foreground">
            Emballage cadeau: {hasAnyGiftWrap ? "Oui" : "Non"}
          </p>
          <p className="text-xs text-muted-foreground">
            Les détails complets sont visibles dans la liste des articles
            ci‑dessous.
          </p>
        </div>

        <div className="space-y-2 rounded-md border bg-card p-4">
          <h2 className="text-sm font-semibold">Client</h2>
          <p className="text-sm text-muted-foreground">
            ID client: {order.user_id}
          </p>
        </div>
      </div>

      <div className="space-y-2 rounded-md border bg-card p-4">
        <h2 className="text-sm font-semibold">Articles</h2>
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Aucun article dans cette commande.
          </p>
        ) : (
          <div className="space-y-2 text-sm">
            {items.map((it) => {
              let meta: unknown = {};
              try {
                meta = it.metadata ? JSON.parse(it.metadata) : {};
              } catch {
                meta = {};
              }
              const metaObj = meta as Record<string, unknown>;
              const engravingText =
                it.engraving_text ??
                (typeof metaObj.engraving_text === "string"
                  ? metaObj.engraving_text
                  : null);
              const giftWrap =
                typeof it.gift_wrap_selected === "boolean"
                  ? it.gift_wrap_selected
                  : !!metaObj.gift_wrap_selected;
              return (
                <div
                  key={it.id}
                  className="rounded-md border bg-background p-3 flex flex-col gap-2"
                >
                  <div className="flex gap-3">
                    {it.product_main_image_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={it.product_main_image_url}
                        alt={it.product_name || "Produit"}
                        className="h-16 w-16 rounded-md border object-cover"
                      />
                    ) : null}
                    <div className="flex flex-1 flex-col">
                      <div className="flex justify-between gap-2">
                        <span className="font-medium">
                          {it.product_name || "Produit"}
                        </span>
                        <span>
                          Qté: {it.quantity} ·{" "}
                          {fmtAmount(it.unit_price_cents, order.currency)}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        Variant ID: {it.product_variant_id}
                      </span>
                    </div>
                  </div>
                  {engravingText ? (
                    <p className="text-xs text-muted-foreground">
                      Gravure: {engravingText}
                    </p>
                  ) : null}
                  {it.engraving_status ? (
                    <p className="text-xs text-muted-foreground">
                      Statut gravure: {it.engraving_status}
                    </p>
                  ) : null}
                  {giftWrap ? (
                    <p className="text-xs text-muted-foreground">
                      Emballage cadeau: oui
                    </p>
                  ) : null}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {showProofModal && order.payment_proof_url ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
          <div className="relative max-h-[90vh] max-w-[90vw] overflow-hidden rounded-lg bg-background p-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={order.payment_proof_url}
              alt="Preuve de paiement"
              className="max-h-[80vh] max-w-full object-contain"
            />
            <button
              type="button"
              className="absolute right-2 top-2 rounded bg-black/60 px-2 py-1 text-xs text-white"
              onClick={() => setShowProofModal(false)}
            >
              Fermer
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
