import { getGoogleTrends } from "../dataIngestion/googleTrends";
import { getRedditSentiment } from "../dataIngestion/redditSentiment";
import { getNewsSignals } from "../dataIngestion/newsSignals";

import { cleanSignal } from "./signal/cleanSignal";

export async function buildSignal(query: string) {
  const [trends, reddit, news] = await Promise.all([
    getGoogleTrends(query),
    getRedditSentiment(query),
    getNewsSignals(query)
  ]);

  // 🧠 RAW SIGNAL COLLECTION
  const demandRaw = [
    trends.interest,
    reddit.volume,
    news.severity
  ];

  const sentimentRaw = [
    reddit.sentiment
  ];

  const supplyRaw = [
    news.spike ? 0.7 : 0.3
  ];

  //  CLEANED SIGNALS
  const demand = cleanSignal(demandRaw);

  const sentiment = cleanSignal(sentimentRaw);

  const supply = cleanSignal(supplyRaw);

  return {
    demand,
    sentiment,
    supply
  };
}
