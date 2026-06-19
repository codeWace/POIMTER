const BAND_URL = process.env.NEXT_PUBLIC_APP_URL
  ? `${process.env.NEXT_PUBLIC_APP_URL}/api/band`
  : "http://localhost:3000/api/band";

export function getBandClient() {
  return {
    rooms: {
      create: async (opts: any) => {
        try {
          const res = await fetch(BAND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "create-room", query: opts.metadata?.query }),
          });
          const data = await res.json();
          console.log(`[BAND] Room created:`, data.id);
          return { id: data.id ?? `local-${Date.now()}` };
        } catch {
          return { id: `local-${Date.now()}` };
        }
      },
    },
    messages: {
      send: async (roomId: string, msg: any) => {
        try {
          await fetch(BAND_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ action: "send-message", roomId, ...msg }),
          });
          console.log(`[BAND ROOM ${roomId}]`, msg.role, ":", msg.content);
        } catch {
          console.log(`[BAND ROOM ${roomId}]`, msg.role, ":", msg.content);
        }
      },
    },
  };
}
