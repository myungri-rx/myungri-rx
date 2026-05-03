import { clearCookie, destroySession, SESSION_COOKIE } from "../_lib/session";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }
  try {
    await destroySession(request);
    return new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": clearCookie(SESSION_COOKIE),
      },
    });
  } catch (error) {
    console.error("logout error:", error);
    return Response.json({ error: "로그아웃 실패" }, { status: 500 });
  }
}
