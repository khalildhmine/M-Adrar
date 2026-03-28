import type { AdminOrderRow, AdminProductRow } from "./dashboard-types";

export async function fetchAllAdminOrders(apiBase: string, token: string): Promise<AdminOrderRow[]> {
  const limit = 200;
  let offset = 0;
  const all: AdminOrderRow[] = [];
  for (;;) {
    const res = await fetch(`${apiBase}/v1/admin/orders?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json().catch(() => ({}))) as { orders?: AdminOrderRow[]; error?: string };
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load orders");
    }
    const batch = Array.isArray(json.orders) ? json.orders : [];
    all.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
    if (offset > 20_000) break;
  }
  return all;
}

export async function fetchAllAdminProducts(apiBase: string, token: string): Promise<AdminProductRow[]> {
  const limit = 100;
  let offset = 0;
  const all: AdminProductRow[] = [];
  for (;;) {
    const res = await fetch(`${apiBase}/v1/admin/products?limit=${limit}&offset=${offset}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = (await res.json().catch(() => ({}))) as { products?: AdminProductRow[]; error?: string };
    if (!res.ok) {
      throw new Error(json.error ?? "Failed to load products");
    }
    const batch = Array.isArray(json.products) ? json.products : [];
    all.push(...batch);
    if (batch.length < limit) break;
    offset += limit;
    if (offset > 20_000) break;
  }
  return all;
}
