import { getSession } from "../_lib/session";

export const config = { runtime: "edge" };

export default async function handler(request: Request): Promise<Response> {
  try {
    const result = await getSession(request);
    if (!result) return Response.json({ user: null });
    const { user } = result;
    return Response.json({
      user: {
        id: user.id,
        provider: user.provider,
      },
    });
  } catch (error) {
    console.error("auth/me error:", error);
    return Response.json({ user: null, error: "세션 조회 실패" }, { status: 500 });
  }
}
