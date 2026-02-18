import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PERSONAL_SYSTEM_PROMPT, buildPersonalUserPrompt } from "@/lib/prompts/personal";
import type { SajuAnalysisData } from "@/lib/types";

export const maxDuration = 60;

export async function POST(request: Request) {
  const body = await request.json();
  const { sajuData, concern } = body as {
    sajuData: SajuAnalysisData;
    concern?: string;
  };

  const userPrompt = buildPersonalUserPrompt(sajuData, concern);

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: PERSONAL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      maxOutputTokens: 4096,
    });

    // Consume the textStream into a ReadableStream, catching errors properly
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
