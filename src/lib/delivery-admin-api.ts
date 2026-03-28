const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export type DeliveryQuartier = {
  id: string;
  name: string;
  delivery_fee_cents: number;
  sort_order: number;
};

export type DeliveryCity = {
  id: string;
  name: string;
  default_shipping_fee_cents: number;
  quartiers: DeliveryQuartier[];
};

export async function listDeliveryCities(): Promise<DeliveryCity[]> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/delivery-cities`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = (await res.json().catch(() => ({}))) as { cities?: DeliveryCity[] };
  if (!res.ok) throw new Error((data as { error?: string }).error ?? "Failed to load cities");
  return Array.isArray(data.cities) ? data.cities : [];
}

export async function createDeliveryCity(body: {
  name: string;
  default_shipping_fee_cents: number;
}): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/delivery-cities`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Create failed");
  }
}

export async function updateDeliveryCity(
  id: string,
  body: { name: string; default_shipping_fee_cents: number },
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/delivery-cities/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Update failed");
  }
}

export async function deleteDeliveryCity(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/delivery-cities/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Delete failed");
}

export async function createQuartier(
  cityId: string,
  body: { name: string; delivery_fee_cents: number; sort_order: number },
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(
    `${apiBase}/v1/admin/delivery-cities/${encodeURIComponent(cityId)}/quartiers`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    },
  );
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Create quartier failed");
  }
}

export async function updateQuartier(
  id: string,
  body: { name: string; delivery_fee_cents: number; sort_order: number },
): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/delivery-quartiers/${encodeURIComponent(id)}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error((err as { error?: string }).error ?? "Update quartier failed");
  }
}

export async function deleteQuartier(id: string): Promise<void> {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/delivery-quartiers/${encodeURIComponent(id)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error("Delete failed");
}
