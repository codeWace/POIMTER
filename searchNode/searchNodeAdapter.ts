// searchNode/searchNodeAdapter.ts

import { runSearchNode } from "./searchNode";
import { runIntelligenceLoop } from "@/brain/runIntelligenceLoop";
import { brainStore } from "@/core/brainStore";
import { runBandOrchestration } from "@/band/bandOrchestrator";

export async function runSearchToReport(
  product: string,
  query?: string
) {
  const finalQuery = query || product;

  // ===================================
  // STEP 1: CREATE INTERNAL SIGNALS
  // ===================================

  // ===================================
  // STEP 2: SEARCH NODE
  // ===================================
  const bundle = await runSearchNode({
    product,
    query: finalQuery,
  });

  console.log("🧠 RAW BUNDLE INTERNAL:", bundle.internal);
  console.log("🧠 BEFORE STORE:", brainStore.getState().internalData);
  console.log("🧠 AFTER STORE:", brainStore.getState().internalData);

  console.log("SEARCH BUNDLE:", bundle);
  console.log("INTERNAL:", bundle.internal);
  console.log("EXTERNAL:", bundle.external);

  // ===================================
  // STEP 3: NORMALIZE INTERNAL ITEMS
  // ===================================
  const internalItems = (bundle.internal || []).map((i) => ({
    id: i.id ?? `internal-${i.product}-${i.timestamp || Date.now()}`,
    product: i.product ?? "unknown",
    stage: i.stage ?? "analyzed",
    score: i.score ?? 0,
    confidence: i.confidence ?? 0,
    notes: i.notes ?? "",
    timestamp: i.timestamp ?? Date.now(),
    savedToReport: i.savedToReport ?? false,
    edited: i.edited ?? false,

    reportId: null,
    sourceInternalIds: null,

  }));

  console.log("SETTING INTERNAL DATA:", internalItems);

  // ===================================
  // STEP 4: SAFE MERGE (NO OVERWRITE)
  // ===================================
  brainStore.setState((state) => {
  const prev = state.internalData || [];

  // build a map to preserve saved state
  const savedMap = new Map(
    prev.map((i) => [i.id, i.savedToReport])
  );

  const normalized = (internalItems || []).map((item) => ({
    ...item,
    savedToReport: savedMap.get(item.id) ?? item.savedToReport ?? false,
  }));

  return {
    internalData: normalized, // REPLACE instead of append
    externalData: bundle.external,
    selectedProduct: product,
  };
});

  console.log("AFTER SET:", brainStore.getState().internalData);

  // ===================================
  // STEP 5: RUN FULL INTELLIGENCE LOOP
  // ===================================
  const reportSession = await runIntelligenceLoop(finalQuery);

  // ===================================
  // STEP 6: ATTACH SEARCH BUNDLE (SAFE MERGE)
  // ===================================
  brainStore.setState((state) => ({
    activeSession: {
      ...reportSession,
      searchBundle: bundle,
    },
  }));

  console.log("📦 INTERNAL DATA AFTER SEARCH NODE:", brainStore.getState().internalData);

  return reportSession;
}