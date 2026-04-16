import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { getCompatibilitySystemPrompt, buildCompatibilityUserPrompt } from "@/lib/prompts/compatibility";
import type { SajuAnalysisData } from "@/lib/types";

export const runtime = "edge";
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json();
  const { person1, person2, relationshipType = "romantic" } = body as {
    person1: SajuAnalysisData;
    person2: SajuAnalysisData;
    relationshipType?: string;
  };

  console.log("[compatibility]", JSON.stringify({
    person1: { name: person1.input.name, gender: person1.input.gender, birthDate: person1.input.birthDate, birthTime: person1.input.birthTime },
    person2: { name: person2.input.name, gender: person2.input.gender, birthDate: person2.input.birthDate, birthTime: person2.input.birthTime },
    relationshipType,
    timestamp: new Date().toISOString(),
  }));

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: getCompatibilitySystemPrompt(relationshipType),
      messages: [
        { role: "user", content: buildCompatibilityUserPrompt(person1, person2, relationshipType) },
      ],
      maxOutputTokens: process.env.TEST_MODE === "true" ? 200 : 12000,
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
