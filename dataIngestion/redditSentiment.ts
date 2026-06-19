export async function getRedditSentiment(query: string) {
  try {
    const res = await fetch(
      `https://www.reddit.com/search.json?q=${encodeURIComponent(query)}&limit=25&sort=relevance`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Poimter/1.0)",
          "Accept": "application/json",
        },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) throw new Error(`Reddit ${res.status}`);

    const data = await res.json();
    const posts = data?.data?.children || [];

    let score = 0;
    const topPosts = posts.slice(0, 5).map((p: any) => ({
      title: p?.data?.title,
      url: `https://reddit.com${p?.data?.permalink}`,
      upvotes: p?.data?.score,
      subreddit: p?.data?.subreddit,
    }));

    for (const p of posts) {
      const text = (p?.data?.title || "").toLowerCase();
      if (text.includes("good") || text.includes("growth") ||
          text.includes("increase") || text.includes("opportunity")) score += 1;
      if (text.includes("bad") || text.includes("drop") ||
          text.includes("fail") || text.includes("decline")) score -= 1;
    }

    return {
      sentiment: Math.max(-1, Math.min(1, score / 10)),
      volume: Math.max(0, Math.min(1, posts.length / 25)),
      topPosts, // ← real Reddit links now saved
    };
  } catch {
    return { sentiment: 0, volume: 0.3, topPosts: [] };
  }
}