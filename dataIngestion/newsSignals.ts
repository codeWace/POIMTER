function buildBusinessQuery(raw: string): string {
  const regions: Record<string, string> = {
    "usa": "United States", "germany": "Germany", "india": "India",
    "uk": "United Kingdom", "china": "China", "australia": "Australia",
    "pakistan": "Pakistan", "canada": "Canada", "france": "France",
    "brazil": "Brazil", "japan": "Japan", "uae": "UAE",
    "kenya": "Kenya", "nigeria": "Nigeria", "south africa": "South Africa",
  };

  const stopWords = new Set([
    "we","are","a","an","the","in","to","of","and","or","is","be",
    "our","us","for","from","that","this","with","want","wanting",
    "anywhere","where","there","less","more","fewer","world","global",
    "looking","trying","please","help","tell","me","my","i","they",
    "their","expand","expansion","making","have","has","had",
    "united","states","america","company","business","manufacturer",
    "manufacturers","companies","fewer","less",
  ]);

  let region = "";
  const lowerRaw = raw.toLowerCase();
  for (const [key, val] of Object.entries(regions)) {
    if (lowerRaw.includes(key)) { region = val; break; }
  }

  const product = raw
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, "")
    .split(/\s+/)
    .filter(w => w.length > 2 && !stopWords.has(w) && !Object.keys(regions).includes(w))
    .slice(0, 2)
    .join(" ");

  // build a tight business-focused query
  const parts = [product];
  if (region) parts.push(region);
  parts.push("market OR industry OR manufacturer OR export OR trade OR supplier");

  const query = parts.join(" ");
  console.log("NEWS QUERY BUILT:", query);
  return query;
}

const BUSINESS_SIGNALS = [
  "manufactur","export","industry","market","trade","supplier",
  "import","wholesale","distribution","investment","revenue",
  "growth","sector","production","supply","demand","factory",
  "brand","retailer","distributor","b2b","commerce","business",
];

const NOISE_SIGNALS = [
  "match","tournament","score","wicket","innings","squad","player",
  "captain","toss","goal","referee","jersey","fixture","celebrity",
  "actor","movie","film","music","album","concert","romance","novel",
  "comics","catwoman","podcast","transcript","therapy","recipe",
];

function scoreArticle(a: any): number {
  const text = ((a.title ?? "") + " " + (a.description ?? "")).toLowerCase();
  const business = BUSINESS_SIGNALS.filter(w => text.includes(w)).length;
  const noise = NOISE_SIGNALS.filter(w => text.includes(w)).length;
  return business - noise * 3;
}

export async function getNewsSignals(query: string) {
  try {
    const key = process.env.NEWS_API_KEY;
    if (!key) throw new Error("Missing NEWS_API_KEY");

    const searchQuery = buildBusinessQuery(query);

    const res = await fetch(
      `https://newsapi.org/v2/everything?q=${encodeURIComponent(searchQuery)}&pageSize=20&sortBy=relevancy&language=en`,
      {
        headers: { "X-Api-Key": key },
        signal: AbortSignal.timeout(5000),
      }
    );

    if (!res.ok) throw new Error(`NewsAPI ${res.status}`);
    const data = await res.json();

    let articles = (data?.articles || [])
      .map((a: any) => ({
        title: a.title,
        description: a.description,
        url: a.url,
        source: a.source?.name,
        publishedAt: a.publishedAt,
        _score: scoreArticle(a),
      }))
      .filter((a: any) => a._score > 0)
      .sort((a: any, b: any) => b._score - a._score)
      .slice(0, 8)
      .map(({ _score, ...a }: any) => a);

    // fallback with just product + market
    if (articles.length === 0) {
      const product = query
        .toLowerCase()
        .replace(/[^a-z0-9 ]/g, "")
        .split(/\s+/)
        .filter(w => w.length > 3)
        .slice(0, 2)
        .join(" ");
      const fallback = `${product} market industry`;
      console.log("NEWS FALLBACK:", fallback);

      const res2 = await fetch(
        `https://newsapi.org/v2/everything?q=${encodeURIComponent(fallback)}&pageSize=10&sortBy=relevancy&language=en`,
        { headers: { "X-Api-Key": key }, signal: AbortSignal.timeout(5000) }
      );
      if (res2.ok) {
        const data2 = await res2.json();
        articles = (data2?.articles || [])
          .map((a: any) => ({
            title: a.title,
            description: a.description,
            url: a.url,
            source: a.source?.name,
            publishedAt: a.publishedAt,
            _score: scoreArticle(a),
          }))
          .filter((a: any) => a._score >= 0)
          .sort((a: any, b: any) => b._score - a._score)
          .slice(0, 5)
          .map(({ _score, ...a }: any) => a);
      }
    }

    return {
      spike: articles.length > 4,
      severity: Math.max(0, Math.min(1, articles.length / 10)),
      articles,
    };
  } catch (e: any) {
    console.log("NEWS ERROR:", e?.message);
    return { spike: false, severity: 0.2, articles: [] };
  }
}
