import { ExternalSignal } from "../types/searchNode.types";

export async function fetchExternalSignals(query: string): Promise<ExternalSignal[]> {
  const base = query.toLowerCase();
  const cleanQuery = query.trim().toLowerCase();
  const sentiments: ExternalSignal["sentiment"][] = ["positive", "neutral", "negative"];

  const signals: ExternalSignal[] = [
    {
      id: crypto.randomUUID(),
      source: "social",
      title: `Social discussion: ${query}`,
      content: `Mixed conversations about ${query} across platforms.`,
      sentiment: sentiments[Math.floor(Math.random() * sentiments.length)],
      mentions: Math.floor(Math.random() * 200),
      timestamp: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      source: "market",
      title: `Market trend analysis: ${query}`,
      content: `Current market behavior related to ${query} shows fluctuations.`,
      sentiment: "neutral",
      mentions: Math.floor(Math.random() * 400),
      timestamp: Date.now(),
    },
    {
      id: crypto.randomUUID(),
      source: "news",
      title: `Industry coverage: ${query}`,
      content: `News mentions related to ${query} are being tracked globally.`,
      sentiment: "neutral",
      mentions: Math.floor(Math.random() * 120),
      timestamp: Date.now(),
    },
  ];

  return signals;
}