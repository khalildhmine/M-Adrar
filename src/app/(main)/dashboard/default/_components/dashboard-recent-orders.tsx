"use client";

import Link from "next/link";

import { getCoreRowModel, useReactTable } from "@tanstack/react-table";

import { DataTable } from "@/components/data-table/data-table";

import { columns } from "../../orders/table-columns";
import type { AdminOrderRow } from "./dashboard-types";

export function DashboardRecentOrders({ orders, loading }: { orders: AdminOrderRow[]; loading: boolean }) {
  const table = useReactTable({
    data: orders,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold">Dernières commandes</h2>
          <p className="text-sm text-muted-foreground">Les 12 commandes les plus récentes.</p>
        </div>
        <Link href="/dashboard/orders" className="text-sm font-medium text-primary underline-offset-4 hover:underline">
          Voir toutes les commandes
        </Link>
      </div>
      {loading ? (
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Chargement…</div>
      ) : orders.length === 0 ? (
        <div className="rounded-md border bg-card p-4 text-sm text-muted-foreground">Aucune commande pour le moment.</div>
      ) : (
        <DataTable table={table} columns={columns} />
      )}
    </div>
  );
}
