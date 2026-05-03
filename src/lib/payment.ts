import type { SajuAnalysisData, SajuInput } from "@/lib/types";

export type PgProvider = "kakao" | "naver" | "toss";

export interface PersonalOrderPayload {
  type: "personal";
  input: SajuInput;
  sajuData: SajuAnalysisData;
  concern?: string;
}

export interface CompatibilityOrderPayload {
  type: "compatibility";
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
  relationshipType: string;
}

export type OrderPayload = PersonalOrderPayload | CompatibilityOrderPayload;

export interface OrderResponse {
  orderId: string;
  status: "pending" | "paid" | "consumed" | "cancelled" | "failed";
  amount: number;
  pgProvider: PgProvider;
  payload: OrderPayload;
  teaserText: string;
  historyId?: string;
  paidAt?: number;
  consumedAt?: number;
}

export async function fetchOrder(orderId: string): Promise<OrderResponse | null> {
  const res = await fetch(`/api/payment/order?orderId=${encodeURIComponent(orderId)}`, {
    credentials: "include",
  });
  if (!res.ok) return null;
  return (await res.json()) as OrderResponse;
}
