import "server-only";
import { callGroq } from "@/brain/ai/groqClient";
import { extractJSON } from "@/brain/ai/server/parser";
import { getGoogleTrends } from "@/dataIngestion/googleTrends";
import { getRedditSentiment } from "@/dataIngestion/redditSentiment";

export async function marketAgent(query: string) {
  const [trends, reddit] = await Promise.all([
    getGoogleTrends(query),
    getRedditSentiment(query),
  ]);

  const prompt = `
You are a senior market intelligence analyst at a hedge fund.

Analyze this business query and the data signals below.
Query: "${query}"
Google Trends Interest: ${trends.interest}
Reddit Volume: ${reddit.volume}
Reddit Sentiment: ${reddit.sentiment}

Return STRICT JSON only, no explanation:
{
  "demand": <number 0-1>,
  "competition": <number 0-1>,
  "opportunity": "high" | "medium" | "low",
  "confidence": <number 0-1>,
  "reasoning": "<one sentence why>"
}
`;

  const raw = await callGroq(prompt);
  const ai = extractJSON(raw);

  // fallback to math if AI fails
  const demand = ai?.demand ?? Math.max(0, Math.min(1,
    trends.interest * 0.6 + reddit.volume * 0.4
  ));
  const competition = ai?.competition ?? (demand > 0.7 ? 0.75 : demand > 0.5 ? 0.55 : 0.35);

  const sentiment = reddit.sentiment > 0 ? reddit.sentiment : (ai?.demand ?? 0.5) * 0.8;
const volume = reddit.volume > 0 ? reddit.volume : (ai?.demand ?? 0.5) * 0.6;

  return {
    agent: "market",
    demand,
    competition,
    opportunity: ai?.opportunity ?? (demand > 0.6 ? "high" : demand > 0.4 ? "medium" : "low"),
    confidence: ai?.confidence ?? Math.max(0.3, Math.min(0.95, demand - competition * 0.3)),
    reasoning: ai?.reasoning ?? "Derived from signal fusion",
    sentiment,
    googleTrends: trends.interest,
    redditVolume: volume,
  };
}