import { getSession } from "../_lib/session";
import { getOrder } from "../_lib/orders";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "GET") {
    return new Response("Method not allowed", { status: 405 });
  }

  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: "auth_required" }, { status: 401 });
  }

  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  if (!orderId) {
    return Response.json({ error: "orderId required" }, { status: 400 });
  }

  const order = await getOrder(orderId);
  if (!order) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  if (order.userId !== session.user.id) {
    return Response.json({ error: "forbidden" }, { status: 403 });
  }

  return Response.json({
    orderId: order.orderId,
    status: order.status,
    amount: order.amount,
    pgProvider: order.pgProvider,
    payload: order.payload,
    teaserText: order.teaserText,
    historyId: order.historyId,
    paidAt: order.paidAt,
    consumedAt: order.consumedAt,
  });
}
