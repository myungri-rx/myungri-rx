import { getSession } from "../_lib/session";
import {
  ANALYSIS_PRICE,
  HISTORY_LIMIT,
  countUserHistory,
  createOrder,
  setOrderTid,
  type OrderPayload,
  type PgProvider,
} from "../_lib/orders";
import { kakaoPayReady } from "../_lib/kakaopay";

export const config = { runtime: "edge" };

function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

interface StartBody {
  pgProvider: PgProvider;
  payload: OrderPayload;
  teaserText: string;
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const session = await getSession(request);
  if (!session) {
    return Response.json({ error: "auth_required" }, { status: 401 });
  }

  let body: StartBody;
  try {
    body = (await request.json()) as StartBody;
  } catch {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (!body || !body.pgProvider || !body.payload || typeof body.teaserText !== "string") {
    return Response.json({ error: "invalid_body" }, { status: 400 });
  }

  if (body.pgProvider !== "kakao") {
    return Response.json(
      { error: "provider_not_supported", message: "현재는 카카오페이만 지원됩니다." },
      { status: 400 },
    );
  }

  const count = await countUserHistory(session.user.id);
  if (count >= HISTORY_LIMIT) {
    return Response.json(
      {
        error: "slot_full",
        message: `저장 가능한 분석은 최대 ${HISTORY_LIMIT}개입니다. 기존 기록을 삭제한 뒤 다시 시도해주세요.`,
        slotCount: count,
        slotMax: HISTORY_LIMIT,
      },
      { status: 403 },
    );
  }

  try {
    const order = await createOrder({
      userId: session.user.id,
      pgProvider: body.pgProvider,
      payload: body.payload,
      teaserText: body.teaserText,
      amount: ANALYSIS_PRICE,
    });

    const itemName =
      body.payload.type === "personal" ? "사주 상세 분석 1건" : "궁합 상세 분석 1건";

    const ready = await kakaoPayReady({
      partnerOrderId: order.orderId,
      partnerUserId: session.user.id,
      itemName,
      totalAmount: ANALYSIS_PRICE,
      approvalUrl: `${appUrl()}/api/payment/kakao/approve?orderId=${order.orderId}`,
      cancelUrl: `${appUrl()}/api/payment/kakao/cancel?orderId=${order.orderId}`,
      failUrl: `${appUrl()}/api/payment/kakao/fail?orderId=${order.orderId}`,
    });

    await setOrderTid(order.orderId, ready.tid);

    return Response.json({
      orderId: order.orderId,
      redirectUrl: ready.next_redirect_pc_url,
      mobileRedirectUrl: ready.next_redirect_mobile_url,
    });
  } catch (err) {
    console.error("payment/start error:", err);
    const message = err instanceof Error ? err.message : "결제 준비에 실패했습니다.";
    return Response.json({ error: "payment_start_failed", message }, { status: 500 });
  }
}
