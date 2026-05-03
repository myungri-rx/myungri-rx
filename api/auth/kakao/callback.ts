import { exchangeCodeForToken, fetchKakaoUser } from "../../_lib/kakao";
import {
  createSession,
  parseCookies,
  sessionCookie,
  STATE_COOKIE,
  clearCookie,
  upsertUser,
} from "../../_lib/session";

export const config = { runtime: "edge" };

function appUrl(): string {
  return process.env.APP_URL || "http://localhost:3000";
}

export default async function handler(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const error = url.searchParams.get("error");

  if (error) {
    return Response.redirect(`${appUrl()}/?auth_error=${encodeURIComponent(error)}`, 302);
  }
  if (!code || !state) {
    return Response.redirect(`${appUrl()}/?auth_error=missing_code`, 302);
  }

  const cookies = parseCookies(request.headers.get("cookie"));
  if (cookies[STATE_COOKIE] !== state) {
    return Response.redirect(`${appUrl()}/?auth_error=state_mismatch`, 302);
  }

  try {
    const token = await exchangeCodeForToken(code);
    const kakaoUser = await fetchKakaoUser(token.access_token);

    const user = await upsertUser({
      provider: "kakao",
      providerId: kakaoUser.id,
    });

    const sessionId = await createSession(user);

    const headers = new Headers({ Location: `${appUrl()}/` });
    headers.append("Set-Cookie", sessionCookie(sessionId));
    headers.append("Set-Cookie", clearCookie(STATE_COOKIE));
    return new Response(null, { status: 302, headers });
  } catch (err) {
    console.error("Kakao callback error:", err);
    const msg = err instanceof Error ? err.message : "로그인에 실패했습니다.";
    return Response.redirect(`${appUrl()}/?auth_error=${encodeURIComponent(msg)}`, 302);
  }
}
