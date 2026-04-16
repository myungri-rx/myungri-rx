import { Redis } from "@upstash/redis";

export const runtime = "edge";

function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis 환경변수가 설정되지 않았습니다.");
  }
  return new Redis({ url, token });
}

// Save result — POST { resultText, sajuData?, person1?, person2? }
export async function POST(request: Request) {
  try {
    const redis = getRedis();
    const body = await request.json();
    const id = crypto.randomUUID().slice(0, 8);

    // Expire after 30 days
    await redis.set(`share:${id}`, JSON.stringify(body), { ex: 60 * 60 * 24 * 30 });

    return Response.json({ id });
  } catch (error) {
    console.error("Share save error:", error);
    return Response.json({ error: "저장에 실패했습니다." }, { status: 500 });
  }
}

// Load result — GET ?id=xxx
export async function GET(request: Request) {
  try {
    const redis = getRedis();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) {
      return Response.json({ error: "ID가 필요합니다." }, { status: 400 });
    }

    const data = await redis.get<string>(`share:${id}`);
    if (!data) {
      return Response.json({ error: "결과를 찾을 수 없습니다." }, { status: 404 });
    }

    return Response.json(typeof data === "string" ? JSON.parse(data) : data);
  } catch (error) {
    console.error("Share load error:", error);
    return Response.json({ error: "조회에 실패했습니다." }, { status: 500 });
  }
}
