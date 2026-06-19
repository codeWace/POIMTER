export const runtime = "nodejs";

export async function POST(req: Request) {
  const { messages, context } = await req.json();

  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY!,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 400,
        system: context,
        messages,
      }),
    });

    const data = await res.json();
    console.log("ANTHROPIC RESPONSE:", JSON.stringify(data));
    const text = data && data.content && data.content[0] && data.content[0].text;
    const reply = text || "Signal lost. Please try again.";
    return Response.json({ reply });
  } catch (e: any) {
    console.error("Chat API error:", e.message);
    return Response.json({ reply: e.message });
  }
}