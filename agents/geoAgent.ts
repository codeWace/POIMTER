import "server-only";
import { callGroq } from "@/brain/ai/groqClient";
import { extractJSON } from "@/brain/ai/server/parser";

const GLOBAL_MARKETS = [
  { id: "india", name: "India", lat: 20.59, lng: 78.96, baseDemand: 0.82, competition: 0.45 },
  { id: "china", name: "China", lat: 35.86, lng: 104.19, baseDemand: 0.80, competition: 0.70 },
  { id: "usa", name: "United States", lat: 37.09, lng: -95.71, baseDemand: 0.75, competition: 0.65 },
  { id: "uk", name: "United Kingdom", lat: 55.37, lng: -3.43, baseDemand: 0.70, competition: 0.60 },
  { id: "germany", name: "Germany", lat: 51.16, lng: 10.45, baseDemand: 0.72, competition: 0.55 },
  { id: "uae", name: "UAE", lat: 23.42, lng: 53.84, baseDemand: 0.68, competition: 0.30 },
  { id: "australia", name: "Australia", lat: -25.27, lng: 133.77, baseDemand: 0.65, competition: 0.40 },
  { id: "japan", name: "Japan", lat: 36.20, lng: 138.25, baseDemand: 0.70, competition: 0.58 },
  { id: "brazil", name: "Brazil", lat: -14.23, lng: -51.92, baseDemand: 0.60, competition: 0.35 },
  { id: "nigeria", name: "Nigeria", lat: 9.08, lng: 8.67, baseDemand: 0.55, competition: 0.20 },
  { id: "south_africa", name: "South Africa", lat: -30.55, lng: 22.93, baseDemand: 0.58, competition: 0.25 },
  { id: "france", name: "France", lat: 46.22, lng: 2.21, baseDemand: 0.66, competition: 0.52 },
  { id: "pakistan", name: "Pakistan", lat: 30.37, lng: 69.34, baseDemand: 0.62, competition: 0.28 },
  { id: "kenya", name: "Kenya", lat: -0.02, lng: 37.90, baseDemand: 0.50, competition: 0.18 },
  { id: "canada", name: "Canada", lat: 56.13, lng: -106.34, baseDemand: 0.64, competition: 0.50 },
];

export async function geoAgent(query: string, marketDemand: number) {
  const countryList = GLOBAL_MARKETS.map(m => m.name).join(", ");
  const prompt = `You are a global market expansion strategist. Query: "${query}". Rank TOP 5 best expansion markets from: ${countryList}. Return STRICT JSON only: { "topMarkets": ["Country1", "Country2", "Country3", "Country4", "Country5"], "reasoning": "<one sentence>" }`;

  const raw = await callGroq(prompt);
  const ai = extractJSON(raw);
  const aiTop: string[] = ai?.topMarkets ?? [];

  const scored = GLOBAL_MARKETS.map(m => {
    const aiRecommended = aiTop.some(t => t.toLowerCase().includes(m.name.toLowerCase()) || m.name.toLowerCase().includes(t.toLowerCase()));
    const aiBoost = aiRecommended ? 0.2 : 0;
    const opportunityScore = Math.round((m.baseDemand * 0.4 + (1 - m.competition) * 0.3 + marketDemand * 0.1 + aiBoost) * 100);
    return { ...m, opportunityScore, demandScore: Math.round(m.baseDemand * 100), value: opportunityScore, aiRecommended };
  }).sort((a, b) => b.opportunityScore - a.opportunityScore);

  return {
    agent: "geo",
    topMarkets: scored.slice(0, 5).map(m => m.name),
    allMarkets: scored,
    primaryMarket: scored[0],
    aiReasoning: ai?.reasoning ?? "Scored by market fundamentals",
    mapSignals: scored.map(m => ({
      id: m.id,
      label: m.name,
      lat: m.lat,
      lng: m.lng,
      value: m.opportunityScore,
      momentum: marketDemand,
      region: m.id,
      type: "country",
      aiRecommended: m.aiRecommended,
    })),
  };
}
