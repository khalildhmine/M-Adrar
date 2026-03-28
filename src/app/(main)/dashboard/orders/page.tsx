/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import {
  getCoreRowModel,
  useReactTable,
  ColumnDef,
} from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";

import { columns } from "./table-columns";

// Import or define the OrderRow type
// You should export this type from your table-columns or create it here if it does not yet exist.
// Here is a placeholder; update this to match your data shape!
export type OrderRow = {
  // Example fields -- update to match your order data structure
  id: string;
  customerName: string;
  status: string;
  createdAt: string;
  // ...other order fields
};

export default function OrdersPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      router.push("/auth/v1/login");
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`${apiBase}/v1/admin/orders`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const json = await res.json().catch(() => ({}));
        const list = Array.isArray(json.orders) ? json.orders : [];
        setOrders(list as OrderRow[]);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [apiBase, router]);

  const table = useReactTable<OrderRow>({
    data: orders,
    columns: columns as ColumnDef<OrderRow, any>[],
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Commandes</h1>
        <p className="text-sm text-muted-foreground">
          Gérez les commandes clients, leurs paiements et le suivi de livraison.
        </p>
      </div>
      {loading ? (
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">
          Chargement des commandes...
        </div>
      ) : (
        <DataTable
          table={table}
          columns={columns as ColumnDef<OrderRow, any>[]}
        />
      )}
    </div>
  );
}
