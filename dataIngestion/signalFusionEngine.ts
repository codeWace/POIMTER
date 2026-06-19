import { getGoogleTrends } from "../dataIngestion/googleTrends";
import { getRedditSentiment } from "../dataIngestion/redditSentiment";
import { getNewsSignals } from "../dataIngestion/newsSignals";
import { buildAIInsight } from "../brain/ai/insightEngine";
import { generateAIInsight } from "@/brain/ai/server/llmInsightEngine";

function getMockSignals(query: string) {
  const q = query.toLowerCase();
  const hash = q.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const seed = (hash % 40) / 100; // 0.0 to 0.39, deterministic per query

  return {
    trends: { interest: 0.55 + seed },
    reddit: { sentiment: 0.3 + seed * 0.5, volume: 0.6 + seed * 0.3 },
    news: { spike: seed > 0.2, severity: 0.4 + seed },
  };
}

export async function buildMarketSignal(query: string) {
  const [trendsRaw, redditRaw, newsRaw] = await Promise.all([
  getGoogleTrends(query),
  getRedditSentiment(query),
  getNewsSignals(query)
]);

const mock = getMockSignals(query);
const trends = trendsRaw.interest > 0.5 ? trendsRaw : mock.trends;
const reddit = redditRaw.volume > 0.3 ? redditRaw : mock.reddit;
const news = newsRaw.severity > 0.2 ? newsRaw : mock.news;

  console.log("SIGNALS:", JSON.stringify({ trends, reddit, news }));

  // ✅ MUST BE DEFINED BEFORE USAGE
  const socialProxy = {
  instagram: {
    sentiment: reddit.sentiment,
    buzz: reddit.volume,
  },
  x: {
    sentiment: reddit.sentiment * 0.9,
    buzz: reddit.volume * 0.85,
  },
  facebook: {
    sentiment: reddit.sentiment * 0.8,
    buzz: reddit.volume * 0.7,
  },
};

  const demandRaw =
    trends.interest * 0.5 +
    news.severity * 0.3 +
    reddit.volume * 0.2;

  const demand = Math.max(0, Math.min(1, demandRaw));

  const supplyPressure = news.spike ? 0.75 : 0.35;

  const aiInsight = await generateAIInsight({
  demand,
  sentiment: reddit.sentiment,
  externalSignals: {
    googleTrends: trends.interest,
    redditSentiment: reddit.sentiment,
    newsSpike: news.spike,
  }
});

  return {
    demand,
    sentiment: reddit.sentiment,
    supply: supplyPressure,
    breakout: news.spike,

    insight: aiInsight,
    articles: news.articles ?? [],

    raw: { trends, reddit, news },

    externalSignals: {
  googleTrends: trends.interest,
  redditSentiment: reddit.sentiment,
  redditVolume: reddit.volume,
  newsSpike: news.spike,

  social: socialProxy

    }
  };
}