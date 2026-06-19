import "server-only";

import { callGroq } from "@/brain/ai/groqClient";
import { extractJSON } from "@/brain/ai/server/parser";

export async function generateAIInsight(signal: any) {

  const prompt = `
You are a senior market intelligence analyst.

Analyze:

Demand: ${signal.demand}
Sentiment: ${signal.sentiment}
Google Trends: ${signal.externalSignals?.googleTrends}
Reddit: ${signal.externalSignals?.redditSentiment}
News: ${signal.externalSignals?.newsSpike}

Return STRICT JSON only:
{
  "insight": string,
  "confidence": number,
  "risk": "low | medium | high"
}
`;

  const res = await callGroq(prompt);

  return extractJSON(res);
}