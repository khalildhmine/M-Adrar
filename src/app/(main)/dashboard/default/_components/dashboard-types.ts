export type AdminOrderRow = {
  id: string;
  order_number: string;
  status: string;
  total_cents: number;
  discount_cents?: number | null;
  discount_code?: string | null;
  currency: string;
  created_at: string;
};

export type AdminProductRow = {
  id: string;
  is_active?: boolean;
};

export const PENDING_STATUSES = new Set(["pending_payment", "processing"]);
export const SUCCESS_STATUSES = new Set(["shipped", "delivered"]);
