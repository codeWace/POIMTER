import "server-only";
import { callGroq } from "@/brain/ai/groqClient";
import { extractJSON } from "@/brain/ai/server/parser";
import { getNewsSignals } from "@/dataIngestion/newsSignals";

export async function newsAgent(query: string) {
  const cleaned = query
    .toLowerCase()
    .replace(/we are|i am|our company|wanting to|looking to|expand|anywhere|in the world|where there are|less|fewer|making|manufacturers|manufacturer|companies|business|united states|usa|texas|world/gi, "")
    .trim()
    .split(/\s+/)
    .filter((w: string) => w.length > 2)
    .slice(0, 2)
    .join(" ");

  const newsQuery = query; // let newsSignals.ts handle query extraction
  console.log("NEWS AGENT QUERY:", newsQuery);

  const news = await getNewsSignals(newsQuery);

  const articleSummaries = news.articles
  .slice(0, 5)
  .map((a: any) => `- ${a.title}: ${a.description ?? ""}`)
  .join("\n");

  const prompt = `
You are a news intelligence analyst.

Query context: "${query}"

Here are recent news articles:
${articleSummaries || "No articles found"}

Analyze the sentiment, market signals, and business relevance.

Return STRICT JSON only:
{
  "sentiment": <number 0-1>,
  "businessRelevance": <number 0-1>,
  "marketSignal": "bullish" | "bearish" | "neutral",
  "keyTheme": "<one sentence summary of what the news means for this business>",
  "riskFlag": true | false
}
`;

  const raw = await callGroq(prompt);
  const ai = extractJSON(raw);

  return {
    agent: "news",
    articles: news.articles ?? [],
    spike: news.spike,
    severity: news.severity,
    articleCount: news.articles?.length ?? 0,
    aiSentiment: ai?.sentiment ?? 0.5,
    businessRelevance: ai?.businessRelevance ?? 0.5,
    marketSignal: ai?.marketSignal ?? "neutral",
    keyTheme: ai?.keyTheme ?? "No theme detected",
    riskFlag: ai?.riskFlag ?? false,
  };
}