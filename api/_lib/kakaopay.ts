const KAKAOPAY_BASE = "https://kapi.kakao.com/v1/payment";

export interface KakaoPayConfig {
  cid: string;
  adminKey: string;
}

export function getKakaoPayConfig(): KakaoPayConfig {
  const adminKey = process.env.KAKAO_ADMIN_KEY;
  if (!adminKey) {
    throw new Error("KAKAO_ADMIN_KEY 환경변수가 설정되지 않았습니다.");
  }
  return {
    cid: process.env.KAKAOPAY_CID || "TC0ONETIME",
    adminKey,
  };
}

export interface KakaoPayReadyParams {
  partnerOrderId: string;
  partnerUserId: string;
  itemName: string;
  totalAmount: number;
  approvalUrl: string;
  cancelUrl: string;
  failUrl: string;
}

export interface KakaoPayReadyResponse {
  tid: string;
  next_redirect_pc_url: string;
  next_redirect_mobile_url: string;
  next_redirect_app_url: string;
  android_app_scheme: string;
  ios_app_scheme: string;
  created_at: string;
}

function authHeaders(adminKey: string): HeadersInit {
  return {
    Authorization: `KakaoAK ${adminKey}`,
    "Content-Type": "application/x-www-form-urlencoded;charset=utf-8",
  };
}

export async function kakaoPayReady(params: KakaoPayReadyParams): Promise<KakaoPayReadyResponse> {
  const cfg = getKakaoPayConfig();
  const body = new URLSearchParams({
    cid: cfg.cid,
    partner_order_id: params.partnerOrderId,
    partner_user_id: params.partnerUserId,
    item_name: params.itemName,
    quantity: "1",
    total_amount: String(params.totalAmount),
    tax_free_amount: "0",
    approval_url: params.approvalUrl,
    cancel_url: params.cancelUrl,
    fail_url: params.failUrl,
  });

  const res = await fetch(`${KAKAOPAY_BASE}/ready`, {
    method: "POST",
    headers: authHeaders(cfg.adminKey),
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KakaoPay ready 실패: ${res.status} ${text}`);
  }
  return (await res.json()) as KakaoPayReadyResponse;
}

export interface KakaoPayApproveParams {
  tid: string;
  partnerOrderId: string;
  partnerUserId: string;
  pgToken: string;
}

export interface KakaoPayApproveResponse {
  aid: string;
  tid: string;
  cid: string;
  partner_order_id: string;
  partner_user_id: string;
  payment_method_type: string;
  amount: { total: number; tax_free: number; vat: number };
  approved_at: string;
}

export async function kakaoPayApprove(
  params: KakaoPayApproveParams,
): Promise<KakaoPayApproveResponse> {
  const cfg = getKakaoPayConfig();
  const body = new URLSearchParams({
    cid: cfg.cid,
    tid: params.tid,
    partner_order_id: params.partnerOrderId,
    partner_user_id: params.partnerUserId,
    pg_token: params.pgToken,
  });

  const res = await fetch(`${KAKAOPAY_BASE}/approve`, {
    method: "POST",
    headers: authHeaders(cfg.adminKey),
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`KakaoPay approve 실패: ${res.status} ${text}`);
  }
  return (await res.json()) as KakaoPayApproveResponse;
}
