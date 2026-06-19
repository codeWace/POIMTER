import { updateAgent } from "@/core/brainStore";
import { addInternalSignal, getInternalContext } from "@/searchNode/internalContext";
import { getNewsSignals } from "@/dataIngestion/newsSignals";
import { getGoogleTrends } from "@/dataIngestion/googleTrends";
import { getRedditSentiment } from "@/dataIngestion/redditSentiment";

export const runSearchAgent = async (
  query: string,
  internalData: any[],
  externalData: any[],
  companyContext?: any
) => {
  updateAgent("search", {
    lastAction: "analyzing_market",
    signal: 75,
    memory: [query],
  });

  const [news, trends, reddit] = await Promise.all([
    getNewsSignals(query),
    getGoogleTrends(query),
    getRedditSentiment(query),
  ]);

  // Real news articles with links
  const newsResults = news.articles.slice(0, 5).map((a: any) => ({
    source: "news",
    title: a.title,
    url: a.url,
    publisher: a.source,
    date: a.publishedAt,
    description: a.description,
  }));

  // Real Reddit posts with links
  const redditResults = (reddit.topPosts ?? []).slice(0, 3).map((p: any) => ({
    source: "reddit",
    title: p.title,
    url: p.url,
    subreddit: p.subreddit,
    upvotes: p.upvotes,
  }));

  const results = [...newsResults, ...redditResults];

  const existing = getInternalContext(query).some(
    s => s.product === query && s.notes === "Search intelligence"
  );

  if (!existing) {
    addInternalSignal({
      id: crypto.randomUUID(),
      product: query,
      stage: "analysis",
      score: results.length * 10,
      confidence: 0.8,
      notes: "Search intelligence",
      timestamp: Date.now(),
    });
  }

  return {
    opportunitiesFound: results.length,
    results,           // ← real articles + reddit posts with URLs
    trends: trends.interest,
    redditSentiment: reddit.sentiment,
    newsArticles: news.articles.slice(0, 5),
    redditPosts: reddit.topPosts ?? [],
  };
};