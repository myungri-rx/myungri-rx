import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PERSONAL_SYSTEM_PROMPT_TEASER, PERSONAL_SYSTEM_PROMPT_FULL, buildPersonalUserPrompt } from "../src/lib/prompts/personal.js";
import type { SajuAnalysisData, AnalysisMode } from "../src/lib/types.js";

export const config = { maxDuration: 300 };

const TOKEN_LIMITS = {
  teaser: { prod: 1000, test: 200 },
  full: { prod: 8500, test: 200 },
};

export default async function handler(request: Request) {
  if (request.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  const body = await request.json();
  const { sajuData, concern, mode = "teaser", teaserContent } = body as {
    sajuData: SajuAnalysisData;
    concern?: string;
    mode?: AnalysisMode;
    teaserContent?: string;
  };

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

    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.textStream) {
            controller.enqueue(encoder.encode(chunk));
          }
          controller.close();
        } catch (err) {
          const msg = err instanceof Error ? err.message : "AI 분석 중 오류 발생";
          console.error("Stream error:", msg);
          controller.enqueue(encoder.encode(`\n\n[오류] ${msg}`));
          controller.close();
        }
      },
    });

    return new Response(stream, {
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  } catch (error) {
    console.error("Analyze API error:", error);
    const message = error instanceof Error ? error.message : "AI 분석 중 오류 발생";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
