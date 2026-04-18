import { Redis } from "@upstash/redis";

export interface SessionUser {
  id: string;
  provider: "kakao" | "naver";
  providerId: string;
  nickname: string;
  profileImage?: string;
  email?: string;
  createdAt: number;
}

export interface Session {
  userId: string;
  provider: SessionUser["provider"];
  createdAt: number;
}

export const SESSION_COOKIE = "sid";
export const STATE_COOKIE = "oauth_state";
const SESSION_TTL_SEC = 60 * 60 * 24 * 30;

export function getRedis() {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;
  if (!url || !token) {
    throw new Error("Redis 환경변수가 설정되지 않았습니다.");
  }
  return new Redis({ url, token });
}

export function parseCookies(header: string | null): Record<string, string> {
  const out: Record<string, string> = {};
  if (!header) return out;
  for (const part of header.split(";")) {
    const [k, ...v] = part.trim().split("=");
    if (!k) continue;
    out[k] = decodeURIComponent(v.join("="));
  }
  return out;
}

interface CookieOptions {
  maxAge?: number;
  path?: string;
  httpOnly?: boolean;
  secure?: boolean;
  sameSite?: "Lax" | "Strict" | "None";
}

export function serializeCookie(name: string, value: string, opts: CookieOptions = {}): string {
  const parts = [`${name}=${encodeURIComponent(value)}`];
  parts.push(`Path=${opts.path ?? "/"}`);
  if (opts.maxAge !== undefined) parts.push(`Max-Age=${opts.maxAge}`);
  if (opts.httpOnly !== false) parts.push("HttpOnly");
  if (opts.secure) parts.push("Secure");
  parts.push(`SameSite=${opts.sameSite ?? "Lax"}`);
  return parts.join("; ");
}

export function clearCookie(name: string): string {
  return serializeCookie(name, "", { maxAge: 0 });
}

function isProd(): boolean {
  return process.env.VERCEL_ENV === "production" || process.env.NODE_ENV === "production";
}

export function sessionCookie(sessionId: string): string {
  return serializeCookie(SESSION_COOKIE, sessionId, {
    maxAge: SESSION_TTL_SEC,
    secure: isProd(),
  });
}

export function stateCookie(state: string): string {
  return serializeCookie(STATE_COOKIE, state, {
    maxAge: 60 * 10,
    secure: isProd(),
  });
}

function newId(): string {
  return crypto.randomUUID().replace(/-/g, "");
}

export async function createSession(user: SessionUser): Promise<string> {
  const redis = getRedis();
  const sessionId = newId();
  const session: Session = {
    userId: user.id,
    provider: user.provider,
    createdAt: Date.now(),
  };
  await redis.set(`session:${sessionId}`, JSON.stringify(session), { ex: SESSION_TTL_SEC });
  return sessionId;
}

export async function getSession(request: Request): Promise<{ session: Session; user: SessionUser } | null> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return null;

  const redis = getRedis();
  const raw = await redis.get<string>(`session:${sessionId}`);
  if (!raw) return null;
  const session: Session = typeof raw === "string" ? JSON.parse(raw) : (raw as Session);

  const userRaw = await redis.get<string>(`user:${session.userId}`);
  if (!userRaw) return null;
  const user: SessionUser = typeof userRaw === "string" ? JSON.parse(userRaw) : (userRaw as SessionUser);

  return { session, user };
}

export async function destroySession(request: Request): Promise<void> {
  const cookies = parseCookies(request.headers.get("cookie"));
  const sessionId = cookies[SESSION_COOKIE];
  if (!sessionId) return;
  const redis = getRedis();
  await redis.del(`session:${sessionId}`);
}

export async function upsertUser(params: {
  provider: SessionUser["provider"];
  providerId: string;
  nickname: string;
  profileImage?: string;
  email?: string;
}): Promise<SessionUser> {
  const redis = getRedis();
  const key = `user:provider:${params.provider}:${params.providerId}`;
  const existingId = await redis.get<string>(key);

  if (existingId) {
    const raw = await redis.get<string>(`user:${existingId}`);
    if (raw) {
      const existing: SessionUser = typeof raw === "string" ? JSON.parse(raw) : (raw as SessionUser);
      const merged: SessionUser = {
        ...existing,
        nickname: params.nickname,
        profileImage: params.profileImage,
        email: params.email ?? existing.email,
      };
      await redis.set(`user:${existingId}`, JSON.stringify(merged));
      return merged;
    }
  }

  const id = newId();
  const user: SessionUser = {
    id,
    provider: params.provider,
    providerId: params.providerId,
    nickname: params.nickname,
    profileImage: params.profileImage,
    email: params.email,
    createdAt: Date.now(),
  };
  await redis.set(`user:${id}`, JSON.stringify(user));
  await redis.set(key, id);
  return user;
}
