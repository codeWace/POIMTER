export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    const res = await fetch(
      `https://news.google.com/rss/search?q=${encodeURIComponent(query)}`,
      {
        headers: {
          "User-Agent": "Mozilla/5.0"
        }
      }
    );

    const xml = await res.text();

    // very simple extraction (no dependency)
    const titles = [...xml.matchAll(/<title>(.*?)<\/title>/g)]
      .map((m) => m[1])
      .slice(1, 10); // skip RSS header title

    const spike = titles.length > 8;

    return Response.json({
      spike,
      volume: titles.length,
      headlines: titles
    });

  } catch (err: any) {
    console.error("News API error:", err?.message);

    return Response.json({
      spike: false,
      volume: 0,
      headlines: []
    });
  }
}