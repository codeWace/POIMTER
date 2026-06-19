import axios from "axios";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get("q") || "";

  try {
    // 1. Get access token
    const tokenRes = await axios.post(
      "https://www.reddit.com/api/v1/access_token",
      new URLSearchParams({
        grant_type: "client_credentials"
      }),
      {
        auth: {
          username: process.env.REDDIT_CLIENT_ID!,
          password: process.env.REDDIT_SECRET!
        },
        headers: {
          "User-Agent": "poimter-app"
        }
      }
    );

    const token = tokenRes.data.access_token;

    // 2. Fetch posts
    const res = await axios.get(
      `https://oauth.reddit.com/search?q=${query}&limit=20`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "User-Agent": "poimter-app"
        }
      }
    );

    const posts = res.data.data.children;

    const scores = posts.map((p: any) => p.data.score);

    const avg =
      scores.reduce((a: number, b: number) => a + b, 0) /
      (scores.length || 1);

    return Response.json({
      sentiment: Math.tanh(avg / 100),
      volume: posts.length,
      posts: posts.map((p: any) => ({
        title: p.data.title,
        score: p.data.score
      }))
    });
  } catch (err: any) {
    console.error("Reddit API error:", err?.message);

    return Response.json({
      sentiment: 0,
      volume: 0,
      posts: []
    });
  }
}