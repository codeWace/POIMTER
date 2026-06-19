import { runIntelligenceLoop } from "@/brain/runIntelligenceLoop";
import { NextRequest, NextResponse } from "next/server";
import { brainStore } from "@/core/brainStore";

export async function POST(req: NextRequest) {
  const { query } = await req.json();
  if (!query) {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const session = await runIntelligenceLoop(query);

  // Grab everything brainStore collected on the server
  const serverState = brainStore.getState();

  return NextResponse.json({
  ok: true,
  session: session ?? null,
  internalData: serverState.internalData ?? [],
  opportunities: serverState.opportunities ?? [],
  mapSignals: serverState.mapSignals ?? [],
  geoHeatMap: serverState.geoHeatMap ?? {},
  geoNodes: serverState.geoNodes ?? [],
  selectedLocation: serverState.selectedLocation ?? null,
  selectedProduct: serverState.selectedProduct ?? null,
  queryHistory: serverState.queryHistory ?? [],
  marketSignal: serverState.activeSession?.marketSignal ?? null,
  articles: (session as any)?.articles ?? [],
});
}