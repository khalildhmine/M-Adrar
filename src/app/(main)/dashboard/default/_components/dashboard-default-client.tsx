"use client";

import { useEffect, useMemo, useState } from "react";

import { useRouter } from "next/navigation";

import { fetchAllAdminOrders, fetchAllAdminProducts } from "./dashboard-api";
import { DashboardRevenueChart } from "./dashboard-revenue-chart";
import type { AdminOrderRow } from "./dashboard-types";
import { PENDING_STATUSES, SUCCESS_STATUSES } from "./dashboard-types";
import { DashboardRecentOrders } from "./dashboard-recent-orders";
import { SectionCards } from "./section-cards";

function buildDailyRevenueSeries(orders: AdminOrderRow[], days: number): { date: string; revenue: number }[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setUTCDate(d.getUTCDate() - i);
    keys.push(d.toISOString().slice(0, 10));
  }
  const byDay = new Map<string, number>();
  for (const k of keys) byDay.set(k, 0);
  for (const o of orders) {
    if (!SUCCESS_STATUSES.has(o.status)) continue;
    const day = o.created_at?.slice(0, 10);
    if (!day || !byDay.has(day)) continue;
    byDay.set(day, (byDay.get(day) ?? 0) + (o.total_cents ?? 0));
  }
  return keys.map((date) => ({ date, revenue: (byDay.get(date) ?? 0) / 100 }));
}

export function DashboardDefaultClient() {
  const router = useRouter();
  const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

  const [orders, setOrders] = useState<AdminOrderRow[]>([]);
  const [productCount, setProductCount] = useState({ total: 0, active: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("admin_token");
    if (!token) {
      setLoading(false);
      router.push("/auth/v1/login");
      return;
    }
    const load = async () => {
      setError(null);
      try {
        const [orderList, productList] = await Promise.all([
          fetchAllAdminOrders(apiBase ?? "", token),
          fetchAllAdminProducts(apiBase ?? "", token),
        ]);
        setOrders(orderList);
        setProductCount({
          total: productList.length,
          active: productList.filter((p) => p.is_active !== false).length,
        });
      } catch (e) {
        setError(e instanceof Error ? e.message : "Échec du chargement");
      } finally {
        setLoading(false);
      }
    };
    void load();
  }, [apiBase, router]);

  const currency = orders[0]?.currency ?? "MRU";

  const stats = useMemo(() => {
    let revenueCents = 0;
    let pending = 0;
    let success = 0;
    let ordersWithPromo = 0;
    let totalDiscountCents = 0;
    for (const o of orders) {
      if (PENDING_STATUSES.has(o.status)) pending += 1;
      if (SUCCESS_STATUSES.has(o.status)) {
        success += 1;
        revenueCents += o.total_cents ?? 0;
      }
      const code = String(o.discount_code ?? "").trim();
      if (code) {
        ordersWithPromo += 1;
        totalDiscountCents += o.discount_cents ?? 0;
      }
    }
    return {
      totalOrders: orders.length,
      pendingOrders: pending,
      successOrders: success,
      revenueCents,
      ordersWithPromo,
      totalDiscountCents,
      productsTotal: productCount.total,
      productsActive: productCount.active,
      currency,
    };
  }, [orders, productCount, currency]);

  const chartData = useMemo(() => buildDailyRevenueSeries(orders, 14), [orders]);

  const recentOrders = useMemo(() => {
    return [...orders].sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 12);
  }, [orders]);

  return (
    <div className="@container/main flex flex-col gap-4 md:gap-6">
      {error && (
        <div className="rounded-md border border-destructive/40 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          {error}
        </div>
      )}
      <SectionCards stats={stats} loading={loading} />
      <DashboardRevenueChart data={chartData} currency={stats.currency} loading={loading} />
      <DashboardRecentOrders orders={recentOrders} loading={loading} />
    </div>
  );
}
