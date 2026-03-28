const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL;

export type ContentPage = {
  slug: string;
  title_en?: string | null;
  title_fr?: string | null;
  title_ar?: string | null;
  body_en?: string | null;
  body_fr?: string | null;
  body_ar?: string | null;
  updated_at?: string;
};

export type FAQ = {
  id: string;
  order: number;
  is_active: boolean;
  question_en?: string | null;
  question_fr?: string | null;
  question_ar?: string | null;
  answer_en?: string | null;
  answer_fr?: string | null;
  answer_ar?: string | null;
};

function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("admin_token");
}

export async function getPage(slug: string) {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(
    `${apiBase}/v1/admin/pages/${encodeURIComponent(slug)}`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to load page");
  return data.page as ContentPage;
}

export async function upsertPage(slug: string, page: Partial<ContentPage>) {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(
    `${apiBase}/v1/admin/pages/${encodeURIComponent(slug)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(page),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to save page");
  return data.page as ContentPage;
}

export async function listFaqs() {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/faqs`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to load FAQs");
  return (data.faqs ?? []) as FAQ[];
}

export async function createFaq(payload: Partial<FAQ>) {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(`${apiBase}/v1/admin/faqs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to create FAQ");
  return data.faq as FAQ;
}

export async function updateFaq(id: string, payload: Partial<FAQ>) {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(
    `${apiBase}/v1/admin/faqs/${encodeURIComponent(id)}`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(payload),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to save FAQ");
  return data.faq as FAQ;
}

export async function deleteFaq(id: string) {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(
    `${apiBase}/v1/admin/faqs/${encodeURIComponent(id)}`,
    {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to delete FAQ");
  return data as { status: string };
}

export async function getFreeShippingThreshold() {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(
    `${apiBase}/v1/admin/settings/free-shipping-threshold`,
    {
      headers: { Authorization: `Bearer ${token}` },
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to load setting");
  return Number(data.free_shipping_threshold_cents ?? 500000) as number;
}

export async function setFreeShippingThreshold(cents: number) {
  const token = getToken();
  if (!token) throw new Error("Not signed in");
  const res = await fetch(
    `${apiBase}/v1/admin/settings/free-shipping-threshold`,
    {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ free_shipping_threshold_cents: cents }),
    },
  );
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data?.error || "Failed to save setting");
  return data as { status: string };
}
