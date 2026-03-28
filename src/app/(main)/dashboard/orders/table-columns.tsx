import Link from "next/link";

import type { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { fr } from "date-fns/locale";

import { Badge } from "@/components/ui/badge";

type OrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  discount_cents?: number | null;
  discount_code?: string | null;
  currency: string;
  shipping_city?: string | null;
  payment_method?: string | null;
  payment_proof_url?: string | null;
  created_at: string;
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

export const columns: ColumnDef<OrderRow>[] = [
  {
    accessorKey: "order_number",
    header: "N° commande",
  },
  {
    accessorKey: "discount_code",
    header: "Code promo",
    cell: ({ getValue }) => {
      const v = String(getValue() ?? "").trim();
      return <span className="text-xs">{v || "—"}</span>;
    },
  },
  {
    accessorKey: "status",
    header: "Statut",
    cell: ({ getValue }) => {
      const v = String(getValue() ?? "");
      return <Badge variant="outline">{statusLabel(v)}</Badge>;
    },
  },
  {
    accessorKey: "total_cents",
    header: "Total",
    cell: ({ row }) => {
      const cents = row.getValue("total_cents") as number;
      const currency = (row.original.currency as string) || "MRU";
      return <span>{fmtAmount(cents, currency)}</span>;
    },
  },
  {
    accessorKey: "discount_cents",
    header: "Remise",
    cell: ({ row }) => {
      const cents = Number(row.original.discount_cents ?? 0) || 0;
      if (cents <= 0) return <span className="text-muted-foreground">—</span>;
      const currency = (row.original.currency as string) || "MRU";
      return <span className="text-emerald-600">- {fmtAmount(cents, currency)}</span>;
    },
  },
  {
    accessorKey: "created_at",
    header: "Créée le",
    cell: ({ getValue }) => {
      const v = getValue() as string;
      const d = v ? new Date(v) : null;
      return <span>{d ? format(d, "dd/MM/yyyy HH:mm", { locale: fr }) : "—"}</span>;
    },
  },
  {
    accessorKey: "shipping_city",
    header: "Ville",
    cell: ({ getValue }) => {
      const v = (getValue() as string) || "";
      return <span>{v || "—"}</span>;
    },
  },
  {
    id: "payment",
    header: "Paiement",
    cell: ({ row }) => {
      const method = row.original.payment_method;
      const hasProof = !!row.original.payment_proof_url;
      return (
        <div className="flex flex-col text-xs">
          <span>{method || "—"}</span>
          <span className="text-muted-foreground">Preuve: {hasProof ? "oui" : "non"}</span>
        </div>
      );
    },
  },
  {
    id: "actions",
    header: "",
    cell: ({ row }) => {
      const id = row.original.id;
      return (
        <Link href={`/dashboard/orders/${id}`} className="text-xs text-primary underline">
          Détails
        </Link>
      );
    },
  },
];
