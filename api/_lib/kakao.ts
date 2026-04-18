const KAKAO_AUTHORIZE_URL = "https://kauth.kakao.com/oauth/authorize";
const KAKAO_TOKEN_URL = "https://kauth.kakao.com/oauth/token";
const KAKAO_USER_URL = "https://kapi.kakao.com/v2/user/me";

export interface KakaoConfig {
  clientId: string;
  clientSecret?: string;
  redirectUri: string;
}

export function getKakaoConfig(): KakaoConfig {
  const clientId = process.env.KAKAO_CLIENT_ID;
  const redirectUri = process.env.KAKAO_REDIRECT_URI;
  if (!clientId || !redirectUri) {
    throw new Error("KAKAO_CLIENT_ID / KAKAO_REDIRECT_URI 환경변수가 설정되지 않았습니다.");
  }
  return { clientId, clientSecret: process.env.KAKAO_CLIENT_SECRET, redirectUri };
}

export function buildAuthorizeUrl(state: string): string {
  const cfg = getKakaoConfig();
  const params = new URLSearchParams({
    response_type: "code",
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    state,
    scope: "profile_nickname,profile_image",
  });
  return `${KAKAO_AUTHORIZE_URL}?${params.toString()}`;
}

interface KakaoTokenResponse {
  access_token: string;
  token_type: string;
  refresh_token?: string;
  expires_in: number;
  scope?: string;
  refresh_token_expires_in?: number;
}

export async function exchangeCodeForToken(code: string): Promise<KakaoTokenResponse> {
  const cfg = getKakaoConfig();
  const body = new URLSearchParams({
    grant_type: "authorization_code",
    client_id: cfg.clientId,
    redirect_uri: cfg.redirectUri,
    code,
  });
  if (cfg.clientSecret) body.set("client_secret", cfg.clientSecret);

  const res = await fetch(KAKAO_TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded;charset=utf-8" },
    body: body.toString(),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao 토큰 교환 실패: ${res.status} ${text}`);
  }
  return (await res.json()) as KakaoTokenResponse;
}

export interface KakaoUser {
  id: string;
  nickname: string;
  profileImage?: string;
  email?: string;
}

interface KakaoUserRaw {
  id: number;
  kakao_account?: {
    email?: string;
    profile?: {
      nickname?: string;
      profile_image_url?: string;
      thumbnail_image_url?: string;
    };
  };
  properties?: {
    nickname?: string;
    profile_image?: string;
    thumbnail_image?: string;
  };
}

export async function fetchKakaoUser(accessToken: string): Promise<KakaoUser> {
  const res = await fetch(KAKAO_USER_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Kakao 사용자 조회 실패: ${res.status} ${text}`);
  }
  const data = (await res.json()) as KakaoUserRaw;
  const nickname =
    data.kakao_account?.profile?.nickname ?? data.properties?.nickname ?? "카카오 사용자";
  const profileImage =
    data.kakao_account?.profile?.profile_image_url ??
    data.properties?.profile_image ??
    data.kakao_account?.profile?.thumbnail_image_url;
  return {
    id: String(data.id),
    nickname,
    profileImage,
    email: data.kakao_account?.email,
  };
}
