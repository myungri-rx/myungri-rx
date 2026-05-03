import { getRedis } from "./session";

export const ANALYSIS_PRICE = 1650;
export const HISTORY_LIMIT = 10;
export const PG_PROVIDERS = ["kakao", "naver", "toss"] as const;
export type PgProvider = (typeof PG_PROVIDERS)[number];

export type OrderStatus = "pending" | "paid" | "consumed" | "cancelled" | "failed";
export type OrderType = "personal" | "compatibility";

export interface PersonalOrderPayload {
  type: "personal";
  input: unknown;
  sajuData: unknown;
  concern?: string;
}

export interface CompatibilityOrderPayload {
  type: "compatibility";
  person1: unknown;
  person2: unknown;
  relationshipType: string;
}

export type OrderPayload = PersonalOrderPayload | CompatibilityOrderPayload;

export interface Order {
  orderId: string;
  userId: string;
  amount: number;
  status: OrderStatus;
  pgProvider: PgProvider;
  payload: OrderPayload;
  teaserText: string;
  tid?: string;
  pgToken?: string;
  createdAt: number;
  paidAt?: number;
  consumedAt?: number;
  cancelledAt?: number;
  failedAt?: number;
  historyId?: string;
}

const PENDING_TTL_SEC = 60 * 60; // 1h
const PAID_TTL_SEC = 60 * 60 * 24; // 24h
const CONSUMED_TTL_SEC = 60 * 60 * 24 * 30; // 30d (audit trail)

function newOrderId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 24);
}

function key(orderId: string): string {
  return `order:${orderId}`;
}

async function readJson<T>(raw: string | T | null): Promise<T | null> {
  if (raw == null) return null;
  return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
}

export async function createOrder(params: {
  userId: string;
  pgProvider: PgProvider;
  payload: OrderPayload;
  teaserText: string;
  amount?: number;
}): Promise<Order> {
  const redis = getRedis();
  const orderId = newOrderId();
  const order: Order = {
    orderId,
    userId: params.userId,
    amount: params.amount ?? ANALYSIS_PRICE,
    status: "pending",
    pgProvider: params.pgProvider,
    payload: params.payload,
    teaserText: params.teaserText,
    createdAt: Date.now(),
  };
  await redis.set(key(orderId), JSON.stringify(order), { ex: PENDING_TTL_SEC });
  return order;
}

export async function getOrder(orderId: string): Promise<Order | null> {
  const redis = getRedis();
  const raw = await redis.get<string>(key(orderId));
  return readJson<Order>(raw);
}

async function saveOrder(order: Order, ttlSec: number): Promise<void> {
  const redis = getRedis();
  await redis.set(key(order.orderId), JSON.stringify(order), { ex: ttlSec });
}

export async function setOrderTid(orderId: string, tid: string): Promise<void> {
  const order = await getOrder(orderId);
  if (!order) return;
  order.tid = tid;
  await saveOrder(order, PENDING_TTL_SEC);
}

export async function markOrderPaid(orderId: string, pgToken: string): Promise<Order | null> {
  const order = await getOrder(orderId);
  if (!order) return null;
  order.status = "paid";
  order.pgToken = pgToken;
  order.paidAt = Date.now();
  await saveOrder(order, PAID_TTL_SEC);
  return order;
}

export async function markOrderConsumed(
  orderId: string,
  historyId: string,
): Promise<Order | null> {
  const order = await getOrder(orderId);
  if (!order) return null;
  order.status = "consumed";
  order.consumedAt = Date.now();
  order.historyId = historyId;
  await saveOrder(order, CONSUMED_TTL_SEC);
  return order;
}

export async function markOrderCancelled(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  if (!order) return;
  order.status = "cancelled";
  order.cancelledAt = Date.now();
  await saveOrder(order, PENDING_TTL_SEC);
}

export async function markOrderFailed(orderId: string): Promise<void> {
  const order = await getOrder(orderId);
  if (!order) return;
  order.status = "failed";
  order.failedAt = Date.now();
  await saveOrder(order, PENDING_TTL_SEC);
}

export async function countUserHistory(userId: string): Promise<number> {
  const redis = getRedis();
  const len = (await redis.llen(`history:${userId}`)) as number;
  return len ?? 0;
}
