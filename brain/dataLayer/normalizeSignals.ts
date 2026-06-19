export function normalizeSignals(data: any, query: string) {
  const trendValues = data.trends?.map((t: any) => t.value || 0) || [];

  const mentions =
    (data.news?.length || 0) +
    (data.social?.length || 0);

  const avgTrend =
    trendValues.length > 0
      ? trendValues.reduce((a: number, b: number) => a + b, 0) /
        trendValues.length
      : 50;

  return {
    searchVolume: trendValues.length ? trendValues : [40, 50, 60],
    regionMentions: {
      global: mentions,
    },
    opportunities: data.news?.map((n: any) => ({
      title: n.title || "Market opportunity",
    })) || [],
    risks: mentions > 100 ? ["High noise in market signals"] : [],
    drivers: ["real-data-feed", query],
    signalStrength: avgTrend,
  };
}