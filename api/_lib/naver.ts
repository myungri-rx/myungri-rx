const NAVER_AUTHORIZE_URL = "https://nid.naver.com/oauth2.0/authorize";
const NAVER_TOKEN_URL = "https://nid.naver.com/oauth2.0/token";
const NAVER_USER_URL = "https://openapi.naver.com/v1/nid/me";

export interface NaverConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
}

export function getNaverConfig(): NaverConfig {
  const clientId = process.env.NAVER_CLIENT_ID;
  const clientSecret = process.env.NAVER_CLIENT_SECRET;
  const redirectUri = process.env.NAVER_REDIRECT_URI;
  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error(
      "NAVER_CLIENT_ID / NAVER_CLIENT_SECRET / NAVER_REDIRECT_URI 환경변수가 설정되지 않았습니다.",
    );
  }
  return { clientId, clientSecret, redirectUri };
}

export function buildAuthorizeUrl(state: string): string {
  const cfg = getNaverConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    state,
  });
  return `${NAVER_AUTHORIZE_URL}?${params.toString()}`;
}

interface NaverTokenResponse {
  access_token: string;
  refresh_token?: string;
  token_type: string;
  expires_in: string;
  error?: string;
  error_description?: string;
}

export async function exchangeCodeForToken(
  code: string,
  state: string,
): Promise<NaverTokenResponse> {
  const cfg = getNaverConfig();
  const params = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: cfg.clientId,
    client_secret: cfg.clientSecret,
    code,
    state,
  });

  const res = await fetch(`${NAVER_TOKEN_URL}?${params.toString()}`, {
    method: "GET",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Naver 토큰 교환 실패: ${res.status} ${text}`);
  }
  const data = (await res.json()) as NaverTokenResponse;
  if (data.error) {
    throw new Error(`Naver 토큰 교환 실패: ${data.error} ${data.error_description ?? ""}`);
  }
  return data;
}

export interface NaverUser {
  id: string;
}

export async function fetchNaverUser(accessToken: string): Promise<NaverUser> {
  const res = await fetch(NAVER_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Naver 사용자 조회 실패: ${res.status} ${text}`);
  }
  const data = (await res.json()) as {
    resultcode: string;
    message: string;
    response?: { id: string };
  };
  if (data.resultcode !== "00" || !data.response?.id) {
    throw new Error(`Naver 사용자 조회 실패: ${data.message}`);
  }
  return { id: data.response.id };
}
