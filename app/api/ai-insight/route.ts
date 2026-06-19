import { generateAIInsight } from "@/brain/ai/server/llmInsightEngine";

export async function POST(req: Request) {
  try {
    const signal = await req.json();

    const result = await generateAIInsight(signal);

    return Response.json(result);
  } catch (err) {
    console.error("AI Insight API Error:", err);

    return Response.json(
      {
        insight: "fallback",
        confidence: 0,
        risk: "unknown",
      },
      { status: 200 }
    );
  }
}