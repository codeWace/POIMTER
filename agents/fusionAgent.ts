import "server-only";
import { callGroq } from "@/brain/ai/groqClient";
import { extractJSON } from "@/brain/ai/server/parser";

export async function fusionAgent(market: any, geo: any, news: any, query: string) {
  const prompt = `You are the Chief Intelligence Officer of a hedge fund AI. Three agents analyzed: "${query}". MARKET: demand=${market.demand}, competition=${market.competition}, opportunity=${market.opportunity}, reasoning=${market.reasoning}. GEO: topMarkets=${geo.topMarkets?.join(", ")}, primaryMarket=${geo.primaryMarket?.name}, reasoning=${geo.aiReasoning}. NEWS: signal=${news.marketSignal}, relevance=${news.businessRelevance}, theme=${news.keyTheme}, riskFlag=${news.riskFlag}. Return STRICT JSON only: { "demandScore": <0-100>, "finalOpportunity": "high" | "medium" | "low", "confidence": <0-1>, "recommendation": "<2 sentences>", "topRisk": "<one sentence>", "bestMarket": "<single country>", "timing": "immediate" | "3-6 months" | "wait" }`;

  const raw = await callGroq(prompt);
  // ADD THIS after the first callGroq call in fusionAgent:

const riskPrompt = `You are a risk analyst at a hedge fund. Analyze this business expansion query: "${query}"

Market demand: ${market.demand}, Competition: ${market.competition}
Best markets: ${geo.topMarkets?.join(", ")}
News signal: ${news.marketSignal}, Key theme: ${news.keyTheme}

Return STRICT JSON only:
{
  "marketRisks": ["<risk 1>", "<risk 2>"],
  "financialRisks": ["<risk 1>"],
  "operationalRisks": ["<risk 1>"],
  "regulatoryRisks": ["<risk 1>"],
  "topActions": ["<action 1>", "<action 2>", "<action 3>"],
  "executiveSummary": "<3 sentence CEO-level summary of opportunity and recommendation>"
}`;

const riskRaw = await callGroq(riskPrompt);
const aiRisk = extractJSON(riskRaw);
  const ai = extractJSON(raw);

  const demandScore = ai?.demandScore ?? Math.round(market.demand * 0.5 * 100 + news.severity * 0.2 * 100 + (geo.primaryMarket?.baseDemand ?? 0.5) * 0.3 * 100);

  const votes = [
    market.opportunity === "high" ? 1 : market.opportunity === "medium" ? 0.5 : 0,
    (geo.primaryMarket?.opportunityScore ?? 50) > 65 ? 1 : 0.5,
    news.marketSignal === "bullish" ? 1 : news.marketSignal === "neutral" ? 0.5 : 0,
  ];

  const consensusScore = votes.reduce((a: number, b: number) => a + b, 0) / votes.length;

  const socialSentiment = market.sentiment ?? 0.5;
  const socialVolume = market.redditVolume ?? 0.5;

  return {
    demandScore,
    confidence: ai?.confidence ?? Math.max(0.2, Math.min(0.95, market.confidence * 0.6 + news.severity * 0.4)),
    consensusScore,
    finalOpportunity: ai?.finalOpportunity ?? (consensusScore > 0.75 ? "high" : consensusScore > 0.4 ? "medium" : "low"),
    recommendation: ai?.recommendation ?? "Moderate opportunity detected",
    topRisk: ai?.topRisk ?? "Market uncertainty",
    bestMarket: ai?.bestMarket ?? geo.primaryMarket?.name ?? "Global",
    timing: ai?.timing ?? "3-6 months",
    agentVotes: { market: votes[0], geo: votes[1], news: votes[2] },
    topMarkets: geo.topMarkets,
    mapSignals: geo.mapSignals,
    articles: news.articles,
    aiRisk,
    externalSignals: {
      googleTrends: market.googleTrends,
      redditSentiment: market.sentiment,
      redditVolume: market.redditVolume,
      newsSpike: news.spike,
      social: {
        instagram: { sentiment: socialSentiment, buzz: socialVolume },
        x: { sentiment: socialSentiment * 0.9, buzz: socialVolume * 0.85 },
        facebook: { sentiment: socialSentiment * 0.8, buzz: socialVolume * 0.7 },
      },
    },
    raw: { market, geo, news },
  };
}
