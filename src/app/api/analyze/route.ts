import { streamText } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { PERSONAL_SYSTEM_PROMPT, buildPersonalUserPrompt } from "@/lib/prompts/personal";
import type { SajuAnalysisData } from "@/lib/types";

export const runtime = "edge";
export const maxDuration = 300;

export async function POST(request: Request) {
  const body = await request.json();
  const { sajuData, concern } = body as {
    sajuData: SajuAnalysisData;
    concern?: string;
  };

  console.log("[analyze]", JSON.stringify({
    name: sajuData.input.name,
    gender: sajuData.input.gender,
    birthDate: sajuData.input.birthDate,
    birthTime: sajuData.input.birthTime,
    calendarType: sajuData.input.calendarType,
    concern: concern || null,
    timestamp: new Date().toISOString(),
  }));

  const userPrompt = buildPersonalUserPrompt(sajuData, concern);

  try {
    const result = streamText({
      model: anthropic("claude-sonnet-4-20250514"),
      system: PERSONAL_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userPrompt }],
      maxOutputTokens: process.env.TEST_MODE === "true" ? 200 : 12000,
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
