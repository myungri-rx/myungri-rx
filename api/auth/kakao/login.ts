import { buildAuthorizeUrl } from "../../_lib/kakao";
import { stateCookie } from "../../_lib/session";

export const config = { runtime: "edge" };

export default async function handler(_request: Request): Promise<Response> {
  try {
    const state = crypto.randomUUID().replace(/-/g, "");
    const url = buildAuthorizeUrl(state);
    return new Response(null, {
      status: 302,
      headers: {
        Location: url,
        "Set-Cookie": stateCookie(state),
      },
    });
  } catch (error) {
    console.error("Kakao login error:", error);
    const message = error instanceof Error ? error.message : "로그인 시작에 실패했습니다.";
    return new Response(message, { status: 500 });
  }
}
