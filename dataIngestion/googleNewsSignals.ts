import Parser from "rss-parser";

const parser = new Parser();

function extractNewsQuery(raw: string): string {
  const text = raw.toLowerCase();

  const stopWords = new Set([
    "we","are","a","an","the","in","to","of","and","or",
    "is","be","our","us","for","from","that","this","with",
    "want","wanting","anywhere","where","there","less","more",
    "company","business","expand","making","companies","usa",
    "texas","world","fewer","bat","bats","cricket"
  ]);

  const words = text
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w));

  const keywords = words.slice(0, 5).join(" ");

  if (text.includes("bat")) {
    return "sports equipment manufacturing export";
  }

  if (text.includes("expand") || text.includes("market")) {
    return "sports goods industry export market";
  }

  return keywords || "sports goods industry market";
}

export async function getGoogleNewsSignals(query: string) {
  try {
    const searchQuery = extractNewsQuery(query);

    const rssUrl = `https://news.google.com/rss/search?q=${encodeURIComponent(
      searchQuery
    )}&hl=en-US&gl=US&ceid=US:en`;

    const feed = await parser.parseURL(rssUrl);

    const articles = (feed.items || []).map((item: any) => ({
      title: item.title,
      description: item.contentSnippet || "",
      url: item.link,
      source: item.creator || "Google News",
      publishedAt: item.pubDate,
    }));

    // 🔥 BUSINESS FILTER (important)
    const businessKeywords = [
      "manufacturing",
      "export",
      "industry",
      "market",
      "supply",
      "demand",
      "trade",
      "revenue",
      "company",
      "growth",
      "investment"
    ];

    const filtered = articles.filter(a => {
      const text = (a.title + " " + a.description).toLowerCase();
      return businessKeywords.some(k => text.includes(k));
    });

    const finalArticles = filtered.length > 0 ? filtered : articles;

    return {
      spike: finalArticles.length > 5,
      severity: Math.min(1, finalArticles.length / 10),
      articles: finalArticles,
    };

  } catch (e: any) {
    console.log("GOOGLE NEWS ERROR:", e?.message);

    return {
      spike: false,
      severity: 0,
      articles: [],
    };
  }
}