import { getSession, getRedis } from "./_lib/session";
import { getOrder, markOrderConsumed, HISTORY_LIMIT } from "./_lib/orders";

export const config = { runtime: "edge" };

type HistoryType = "personal" | "compatibility";

interface HistoryPreview {
  name?: string;
  names?: [string, string];
  relationshipType?: string;
  birthDate?: string;
  concern?: string;
  phase: "teaser" | "full";
}

interface HistoryRecord {
  id: string;
  type: HistoryType;
  preview: HistoryPreview;
  createdAt: number;
  updatedAt: number;
  data: unknown;
}

function newAnalysisId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function buildPreview(
  type: HistoryType,
  data: Record<string, unknown>,
  phase: "teaser" | "full",
): HistoryPreview {
  if (type === "personal") {
    const input = (data.input as { name?: string; birthDate?: string }) || {};
    return {
      name: input.name,
      birthDate: input.birthDate,
      concern: (data.concern as string | undefined)?.slice(0, 80),
      phase,
    };
  }
  const p1 = (data.person1 as { input?: { name?: string } })?.input;
  const p2 = (data.person2 as { input?: { name?: string } })?.input;
  return {
    names: [p1?.name ?? "?", p2?.name ?? "?"],
    relationshipType: data.relationshipType as string | undefined,
    phase,
  };
}

async function parseJson<T>(raw: string | T | null): Promise<T | null> {
  if (raw == null) return null;
  return (typeof raw === "string" ? JSON.parse(raw) : raw) as T;
}

export default async function handler(request: Request): Promise<Response> {
  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: "로그인이 필요합니다." }, { status: 401 });
  }
  const userId = session.user.id;
  const redis = getRedis();
  const url = new URL(request.url);
  const id = url.searchParams.get("id");

  // GET detail
  if (request.method === "GET" && id) {
    const raw = await redis.get<string>(`history:${userId}:${id}`);
    const rec = await parseJson<HistoryRecord>(raw);
    if (!rec) return Response.json({ error: "기록을 찾을 수 없습니다." }, { status: 404 });
    return Response.json(rec);
  }

  // GET list
  if (request.method === "GET") {
    const ids = ((await redis.lrange(`history:${userId}`, 0, HISTORY_LIMIT - 1)) || []) as string[];
    const items: Omit<HistoryRecord, "data">[] = [];
    const staleIds: string[] = [];
    for (const itemId of ids) {
      const raw = await redis.get<string>(`history:${userId}:${itemId}`);
      const rec = await parseJson<HistoryRecord>(raw);
      if (!rec) {
        staleIds.push(itemId);
        continue;
      }
      items.push({
        id: rec.id,
        type: rec.type,
        preview: rec.preview,
        createdAt: rec.createdAt,
        updatedAt: rec.updatedAt,
      });
    }
    for (const staleId of staleIds) {
      await redis.lrem(`history:${userId}`, 0, staleId);
    }
    return Response.json({ items, slotMax: HISTORY_LIMIT });
  }

  // POST create or update
  if (request.method === "POST") {
    let body: {
      id?: string;
      type: HistoryType;
      data: Record<string, unknown>;
      phase?: "teaser" | "full";
      orderId?: string;
    };
    try {
      body = await request.json();
    } catch {
      return Response.json({ error: "잘못된 요청 바디" }, { status: 400 });
    }
    if (body.type !== "personal" && body.type !== "compatibility") {
      return Response.json({ error: "invalid type" }, { status: 400 });
    }
    const now = Date.now();
    const preview = buildPreview(body.type, body.data, body.phase || "full");

    // Update existing
    if (body.id) {
      const raw = await redis.get<string>(`history:${userId}:${body.id}`);
      const existing = await parseJson<HistoryRecord>(raw);
      if (existing) {
        const updated: HistoryRecord = {
          ...existing,
          preview,
          data: body.data,
          updatedAt: now,
        };
        await redis.set(`history:${userId}:${body.id}`, JSON.stringify(updated));
        return Response.json({ id: body.id });
      }
      // fall through to create new if existing is gone
    }

    // New record requires a paid order
    if (!body.orderId) {
      return Response.json({ error: "payment_required" }, { status: 402 });
    }

    const order = await getOrder(body.orderId);
    if (!order || order.userId !== userId) {
      return Response.json({ error: "order_not_found" }, { status: 404 });
    }
    if (order.status === "consumed" && order.historyId) {
      // Idempotent: already saved — return existing id
      return Response.json({ id: order.historyId });
    }
    if (order.status !== "paid") {
      return Response.json({ error: "order_not_paid", status: order.status }, { status: 403 });
    }

    // Slot check
    const len = ((await redis.llen(`history:${userId}`)) as number) || 0;
    if (len >= HISTORY_LIMIT) {
      return Response.json(
        { error: "slot_full", slotCount: len, slotMax: HISTORY_LIMIT },
        { status: 403 },
      );
    }

    // Create
    const analysisId = newAnalysisId();
    const record: HistoryRecord = {
      id: analysisId,
      type: body.type,
      preview,
      createdAt: now,
      updatedAt: now,
      data: body.data,
    };
    await redis.set(`history:${userId}:${analysisId}`, JSON.stringify(record));
    await redis.lpush(`history:${userId}`, analysisId);

    // Consume order
    await markOrderConsumed(order.orderId, analysisId);

    return Response.json({ id: analysisId });
  }

  // DELETE
  if (request.method === "DELETE") {
    if (!id) return Response.json({ error: "id required" }, { status: 400 });
    await redis.del(`history:${userId}:${id}`);
    await redis.lrem(`history:${userId}`, 0, id);
    return Response.json({ ok: true });
  }

  return new Response("Method not allowed", { status: 405 });
}
