import { markOrderCancelled } from "../../_lib/orders";

export const config = { runtime: "edge" };

function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  if (orderId) {
    await markOrderCancelled(orderId);
  }
  return new Response(null, {
    status: 302,
    headers: { Location: `${appUrl()}/?orderId=${orderId ?? ""}&payment=cancelled` },
  });
}
