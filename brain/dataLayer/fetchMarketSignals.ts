export async function fetchMarketSignals(query: string) {
  const q = encodeURIComponent(query);

  // -----------------------------
  // 1. GOOGLE TRENDS (via API proxy or backend)
  // -----------------------------
  const trends = await fetch(
    `/api/trends?query=${q}`
  ).then(res => res.json()).catch(() => []);

  // -----------------------------
  // 2. NEWS SIGNALS
  // -----------------------------
  const news = await fetch(
    `/api/news?query=${q}`
  ).then(res => res.json()).catch(() => []);

  // -----------------------------
  // 3. SOCIAL SIGNALS (reddit-style placeholder for now)
  // -----------------------------
  const social = await fetch(
    `/api/social?query=${q}`
  ).then(res => res.json()).catch(() => []);

  return {
    trends,
    news,
    social,
  };
}