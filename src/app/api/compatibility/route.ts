import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getCompatibilitySystemPrompt, buildCompatibilityUserPrompt } from "@/lib/prompts/compatibility";
import type { SajuAnalysisData, AnalysisMode } from "@/lib/types";

export const maxDuration = 300;

const TOKEN_LIMITS = {
  teaser: { prod: 1000, test: 200 },
  full: { prod: 8500, test: 200 },
};

export async function POST(request: Request) {
  const body = await request.json();
  const { person1, person2, relationshipType = "romantic", mode = "teaser", teaserContent } = body as {
    person1: SajuAnalysisData;
    person2: SajuAnalysisData;
    relationshipType?: string;
    mode?: AnalysisMode;
    teaserContent?: string;
  };

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
    // FUTURE: if (mode === "full") { verify payment token }
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: getCompatibilitySystemPrompt(relationshipType, mode),
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
    console.error("Compatibility API error:", error);
    const message = error instanceof Error ? error.message : "AI 분석 중 오류 발생";
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
