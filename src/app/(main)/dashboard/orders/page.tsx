/* eslint-disable @next/next/no-async-client-component */
"use client";

import { useEffect, useState } from "react";

import { useRouter } from "next/navigation";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";

import { columns } from "./table-columns";

export default function OrdersPage() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [orders, setOrders] = useState<unknown[]>([]);
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
        setOrders(list);
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [apiBase, router]);

  const table = useReactTable({
    data: orders,
    columns,
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
        <DataTable table={table} columns={columns} />
      )}
    </div>
  );
}
