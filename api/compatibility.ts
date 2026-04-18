import type { IncomingMessage, ServerResponse } from "node:http";
import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getCompatibilitySystemPrompt, buildCompatibilityUserPrompt } from "../src/lib/prompts/compatibility.js";
import type { SajuAnalysisData, AnalysisMode } from "../src/lib/types.js";

export const config = { maxDuration: 300 };

const TOKEN_LIMITS = {
  teaser: { prod: 1000, test: 200 },
  full: { prod: 8500, test: 200 },
};

interface CompatibilityBody {
  person1: SajuAnalysisData;
  person2: SajuAnalysisData;
  relationshipType?: string;
  mode?: AnalysisMode;
  teaserContent?: string;
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

  let body: CompatibilityBody;
  try {
    body = await readJsonBody<CompatibilityBody>(req);
  } catch {
    res.statusCode = 400;
    res.setHeader("Content-Type", "application/json");
    res.end(JSON.stringify({ error: "잘못된 요청 바디" }));
    return;
  }

  const { person1, person2, relationshipType = "romantic", mode = "teaser", teaserContent } = body;

  console.log("[compatibility]", JSON.stringify({
    person1: { name: person1.input.name, gender: person1.input.gender, birthDate: person1.input.birthDate, birthTime: person1.input.birthTime },
    person2: { name: person2.input.name, gender: person2.input.gender, birthDate: person2.input.birthDate, birthTime: person2.input.birthTime },
    relationshipType,
    mode,
    timestamp: new Date().toISOString(),
  }));

  const isTest = process.env.TEST_MODE === "true";
  const maxOutputTokens = TOKEN_LIMITS[mode][isTest ? "test" : "prod"];
  const userPrompt = buildCompatibilityUserPrompt(person1, person2, relationshipType);

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
      system: getCompatibilitySystemPrompt(relationshipType, mode),
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
    console.error("Compatibility API error:", message);
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
