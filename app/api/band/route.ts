export const runtime = "nodejs";

const BAND_API = "https://app.band.ai/api/v1/agent";
const API_KEY = process.env.BAND_API_KEY!;

const headers = {
  "Content-Type": "application/json",
  "X-API-Key": API_KEY,
};

const ROLE_TO_TYPE: Record<string, string> = {
  CoordinatorAgent: "thought",
  SearchAgent: "tool_result",
  MarketAgent: "tool_result",
  NewsAgent: "tool_result",
  GeoAgent: "tool_result",
  MapAgent: "tool_result",
  FusionAgent: "tool_result",
  ReportAgent: "tool_result",
};

export async function POST(req: Request) {
  try {
    const { action, roomId, role, content, metadata, query } = await req.json();

    if (action === "create-room") {
      const res = await fetch(`${BAND_API}/chats`, {
        method: "POST",
        headers,
        body: JSON.stringify({ chat: {} }),
      });
      const data = await res.json();
      const id = data?.data?.id;
      console.log("[BAND] Room created:", id);
      return Response.json({ id: id ?? `local-${Date.now()}` });
    }

    if (action === "send-message") {
      const message_type = ROLE_TO_TYPE[role] ?? "thought";
      const res = await fetch(`${BAND_API}/chats/${roomId}/events`, {
        method: "POST",
        headers,
        body: JSON.stringify({
          event: {
            content,
            message_type,
            ...(metadata ? { metadata } : {}),
          },
        }),
      });
      const data = await res.json();
      console.log(`[BAND ROOM ${roomId}]`, role, "→", JSON.stringify(data));
      return Response.json({ ok: true });
    }

    return Response.json({ error: "unknown action" }, { status: 400 });
  } catch (e: any) {
    console.error("[BAND ERROR]", e.message);
    return Response.json({ error: e.message }, { status: 500 });
  }
}
