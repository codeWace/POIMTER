import "server-only";

import { brainStore } from "@/core/brainStore";
import { parseQuery } from "@/brain/queryParser";
import { parseCompanyContext } from "@/brain/companyContextParser";
import { saveCompanyMemory, getCompanyMemory } from "@/brain/memory/companyMemory";
import { runBandOrchestration } from "../band/bandOrchestrator";
import { buildReport } from "@/brain/buildReport";
import { queueIntelligence } from "@/brain/pipeline/requestQueue";
import { setCache } from "@/brain/cache/intelligenceCache";
import { inferGeoCluster } from "@/brain/geo/geoInference";
import { updateGeoHeat, getHeatMemory } from "@/brain/geo/geoHeatEngine";
import { runMapAgent } from "@/agents/mapAgent";
import { updateAgent } from "@/core/brainStore";
import { generateAiSummary } from "@/brain/generateAiSummary";
import { marketAgent } from "@/agents/marketAgent";
import { geoAgent } from "@/agents/geoAgent";
import { newsAgent } from "@/agents/newsAgent";
import { fusionAgent } from "@/agents/fusionAgent";

const runningJobs = new Set<string>();

export const runIntelligenceLoop = async (query: string) => {
  return queueIntelligence(async () => {

    if (runningJobs.has(query)) return;
    runningJobs.add(query);

    try {
      // ===============================
      // 1. PARSE QUERY
      // ===============================
      const parsed = parseQuery(query);

      const lastQuery = brainStore.getState().lastProcessedQuery;
      if (lastQuery === query) return;
      brainStore.setState({ lastProcessedQuery: query });

      // ===============================
      // 2. COMPANY CONTEXT
      // ===============================
      const rawCompany = brainStore.getState().companyContext;
      const companyContext = parseCompanyContext(rawCompany?.description || "");
      console.log("COMPANY CONTEXT RECEIVED:", companyContext);

      // ===============================
      // 3. GEO INFERENCE
      // ===============================
      const locationRaw = parsed?.location || null;
      const geoCluster = inferGeoCluster(locationRaw);
      const finalCountry = geoCluster?.name ?? "Global";
      const finalRegion = geoCluster?.region ?? "global";

      // ===============================
// 4. RUN 3 AGENTS IN PARALLEL
// ===============================
const [marketResult, newsResult] = await Promise.all([
  marketAgent(query),
  newsAgent(query),
]);

console.log("MARKET RESULT:", JSON.stringify(marketResult));
console.log("NEWS RESULT:", JSON.stringify(newsResult));

const geoResult = await geoAgent(query, marketResult.demand);

console.log("GEO RESULT:", JSON.stringify(geoResult?.topMarkets));

      /// ===============================
// 5. FUSION AGENT
// ===============================
const fused = await fusionAgent(marketResult, geoResult, newsResult, query);

console.log("FUSED:", JSON.stringify(fused));

      const marketSignal = {
        demand: fused.demandScore / 100,
        sentiment: marketResult.sentiment,
        supply: marketResult.competition,
        breakout: newsResult.spike,
        insight: null,
        articles: fused.articles,
        aiRisk: fused.aiRisk,
        raw: fused.raw,
        externalSignals: fused.externalSignals,
      };

      console.log("AGENT VOTES:", fused.agentVotes);
      console.log("ARTICLES:", marketSignal.articles?.length);

      // ===============================
      // 6. CORE ORCHESTRATION
      // ===============================
      const result = await runBandOrchestration(query);

      const internalData =
        result?.searchResult?.internalData ||
        result?.report?.internalData ||
        [];

      updateAgent("search", {
        status: "processing",
        lastAction: { type: "runBandOrchestration", timestamp: Date.now(), confidence: 0.7 },
        signal: marketSignal.demand * 100,
      });

      // ===============================
      // 7. COMPANY BOOST
      // ===============================
      const companyMemory = getCompanyMemory("default");
      let companyBoost = 1;

      const marketList = (companyContext?.markets || []).map((m: string) => m.toLowerCase());
      if (marketList.includes(finalCountry.toLowerCase())) companyBoost = Math.max(companyBoost, 1.15);
      if (companyMemory?.markets?.includes(finalCountry.toLowerCase())) companyBoost = Math.max(companyBoost, 1.1);

      marketSignal.demand = Math.min(1, Math.max(0, marketSignal.demand * companyBoost));
      saveCompanyMemory("default", companyContext);

      // ===============================
      // 8. BUILD REPORT
      // ===============================
      const report = buildReport({
        query,
        result,
        marketSignal,
        geoCluster,
        internalData,
        externalData: brainStore.getState().externalData || [],
        companyContext,
      });

      updateAgent("report", {
        status: "processing",
        lastAction: { type: "buildReport", timestamp: Date.now(), confidence: report.demand.score / 100 },
        signal: report.demand.score,
      });

      // ===============================
      // 9. GEO HEAT
      // ===============================
      updateGeoHeat(finalRegion, report.demand.score / 100);
      const heatMap = getHeatMemory();

      const globePoints = Object.values(heatMap).map((node: any) => ({
        id: node.region,
        label: node.region,
        lat: node.lat,
        lng: node.lng,
        intensity: node.demand * 100,
      }));

      brainStore.setState({ geoHeatMap: heatMap, globePoints });

      // ===============================
      // 10. MAP AGENT — use geo agent output
      // ===============================
      const mapSignals = geoResult.mapSignals;
      const geoNodes = await runMapAgent(mapSignals);

      updateAgent("map", {
        status: "processing",
        lastAction: { type: "runMapAgent", timestamp: Date.now(), confidence: 0.8 },
        signal: marketSignal.demand * 100,
      });

      // ===============================
      // 11. SESSION
      // ===============================
      const aiAnalystSummary = generateAiSummary({
        demandScore: marketSignal.demand * 100,
        competition: marketSignal.supply * 100,
        news: marketSignal.articles,
        sentiment: marketSignal.sentiment * 100,
      });

      const session = {
        report,
        meta: report.meta,
        demand: report.demand,
        insight: report.insight,
        status: "ready",
        marketSignal: marketSignal.externalSignals ?? null,
        articles: marketSignal.articles ?? [],
        aiAnalystSummary,
        agentVotes: fused.agentVotes,
        topMarkets: geoResult.topMarkets,
        bestMarket: fused.bestMarket,        // ← ADD
  recommendation: fused.recommendation, // ← ADD
  timing: fused.timing,                 // ← ADD
      };

      console.log("SESSION ARTICLES:", session.articles?.length);

      // ===============================
      // 12. HISTORY
      // ===============================
      const prev = brainStore.getState().queryHistory || [];
      const historyItem = {
        query,
        timestamp: Date.now(),
        summary: report?.insight?.summary,
        internalData: report,
        marketSignal,
        country: finalCountry,
      };

      // ===============================
      // 13. FINAL STATE UPDATE
      // ===============================
      brainStore.setState({
        activeSession: session,
  selectedLocation: finalCountry,
        selectedLocationType: geoCluster?.type ?? "unknown",
        selectedProduct: parsed?.product ?? null,
        mapSignals: geoNodes,
        geoNodes,
        geoHeatMap: heatMap,
        queryHistory: [historyItem, ...prev].slice(0, 50),
        query: "",
      });

      updateAgent("search", { status: "complete" });
      updateAgent("map", { status: "complete" });
      updateAgent("report", { status: "complete" });

      // ===============================
      // 14. CACHE
      // ===============================
      const cacheKey = `${query.toLowerCase()}-${JSON.stringify(parsed)}`;
      setCache(cacheKey, {
        state: {
          activeSession: session,
          selectedLocation: finalCountry,
          selectedProduct: parsed?.product ?? null,
          mapSignals,
        },
        session,
      });

      return session;

    } finally {
      runningJobs.delete(query);
    }
  });
};