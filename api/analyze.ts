import type { IncomingMessage, ServerResponse } from "node:http";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PERSONAL_SYSTEM_PROMPT_TEASER, PERSONAL_SYSTEM_PROMPT_FULL, buildPersonalUserPrompt } from "../src/lib/prompts/personal.js";
import type { SajuAnalysisData, AnalysisMode } from "../src/lib/types.js";
import { getOrder } from "./_lib/orders.js";
import { getSession } from "./_lib/session.js";

export const config = { maxDuration: 300 };

const TOKEN_LIMITS = {
  teaser: { prod: 1000, test: 200 },
  full: { prod: 8500, test: 200 },
};

interface AnalyzeBody {
  sajuData: SajuAnalysisData;
  concern?: string;
  mode?: AnalysisMode;
  teaserContent?: string;
  orderId?: string;
}

function toWebRequest(req: IncomingMessage): Request {
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) {
    if (v) headers.set(k, Array.isArray(v) ? v[0] : v);
  }
  const proto = (req.headers["x-forwarded-proto"] as string) || "http";
  const host = (req.headers["host"] as string) || "localhost";
  return new Request(`${proto}://${host}${req.url || "/"}`, { method: req.method, headers });
}

async function readJsonBody<T>(req: IncomingMessage): Promise<T> {
  const preParsed = (req as IncomingMessage & { body?: unknown }).body;
  if (preParsed && typeof preParsed === "object") return preParsed as T;
  let raw = "";
  for await (const chunk of req) {
    raw += typeof chunk === "string" ? chunk : chunk.toString("utf8");
  }
  return (raw ? JSON.parse(raw) : {}) as T;
}

export default async function handler(req: IncomingMessage, res: ServerResponse): Promise<void> {
  if (req.method !== "POST") {
    res.statusCode = 405;
    res.end("Method not allowed");
    return;
  }

  let body: AnalyzeBody;
  try {
    body = await readJsonBody<AnalyzeBody>(req);
  } catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "잘못된 요청 바디" }));
    return;
  }

  const { sajuData, concern, mode = "teaser", teaserContent, orderId } = body;

  if (mode === "full") {
    const session = await getSession(toWebRequest(req));
    if (!session) {
      res.statusCode = 401;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "auth_required" }));
      return;
    }
    if (!orderId) {
      res.statusCode = 402;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "payment_required" }));
      return;
    }
    const order = await getOrder(orderId);
    if (!order || order.userId !== session.user.id) {
      res.statusCode = 404;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "order_not_found" }));
      return;
    }
    if (order.status !== "paid") {
      res.statusCode = 403;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: "order_not_paid", status: order.status }));
      return;
    }
  }

  console.log("[analyze]", JSON.stringify({
    name: sajuData.input.name,
    gender: sajuData.input.gender,
    birthDate: sajuData.input.birthDate,
    birthTime: sajuData.input.birthTime,
    calendarType: sajuData.input.calendarType,
    concern: concern || null,
    mode,
    timestamp: new Date().toISOString(),
  }));

  const userPrompt = buildPersonalUserPrompt(sajuData, concern);
  const isTest = process.env.TEST_MODE === "true";
  const maxOutputTokens = TOKEN_LIMITS[mode][isTest ? "test" : "prod"];
  const systemPrompt = mode === "teaser" ? PERSONAL_SYSTEM_PROMPT_TEASER : PERSONAL_SYSTEM_PROMPT_FULL;

  const messages = mode === "full" && teaserContent
    ? [
        { role: "user" as const, content: userPrompt },
        { role: "assistant" as const, content: teaserContent },
        { role: "user" as const, content: "이어서 나머지 섹션을 분석해주세요." },
      ]
    : [{ role: "user" as const, content: userPrompt }];

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: systemPrompt,
      messages,
      maxOutputTokens,
    });

    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });

    for await (const chunk of result.textStream) {
      res.write(chunk);
    }
    res.end();
  } catch (error) {
    const message = error instanceof Error ? error.message : "AI 분석 중 오류 발생";
    console.error("Analyze API error:", message);
    if (!res.headersSent) {
      res.statusCode = 500;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: message }));
    } else {
      res.write(`\n\n[오류] ${message}`);
      res.end();
    }
  }
}
