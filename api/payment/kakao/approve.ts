import { kakaoPayApprove } from "../../_lib/kakaopay";
import { getOrder, markOrderPaid } from "../../_lib/orders";

export const config = { runtime: "edge" };

function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

function redirect(target: string): Response {
  return new Response(null, { status: 302, headers: { Location: target } });
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const orderId = url.searchParams.get("orderId");
  const pgToken = url.searchParams.get("pg_token");

  if (!orderId || !pgToken) {
    return redirect(`${appUrl()}/?payment=error&reason=missing_params`);
  }

  const order = await getOrder(orderId);
  if (!order) {
    return redirect(`${appUrl()}/?payment=error&reason=order_not_found`);
  }
  if (!order.tid) {
    return redirect(`${appUrl()}/?payment=error&reason=missing_tid&orderId=${orderId}`);
  }
  if (order.status !== "pending") {
    // already processed — let the SPA decide what to show
    return redirect(`${appUrl()}/?orderId=${orderId}&payment=already`);
  }

  try {
    await kakaoPayApprove({
      tid: order.tid,
      partnerOrderId: order.orderId,
      partnerUserId: order.userId,
      pgToken,
    });
    await markOrderPaid(orderId, pgToken);
    return redirect(`${appUrl()}/?orderId=${orderId}&payment=success`);
  } catch (err) {
    console.error("payment/kakao/approve error:", err);
    const msg = err instanceof Error ? err.message : "approve_failed";
    return redirect(`${appUrl()}/?orderId=${orderId}&payment=error&reason=${encodeURIComponent(msg)}`);
  }
}
