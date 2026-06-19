const GLOBAL_MARKETS = [
  { country: "India", region: "asia", demand: 0.9, competition: 0.3, cricketRelevance: 0.95 },
  { country: "Australia", region: "oceania", demand: 0.8, competition: 0.5, cricketRelevance: 0.9 },
  { country: "United Kingdom", region: "europe", demand: 0.75, competition: 0.6, cricketRelevance: 0.85 },
  { country: "Pakistan", region: "asia", demand: 0.85, competition: 0.4, cricketRelevance: 0.9 },
  { country: "UAE", region: "middle_east", demand: 0.7, competition: 0.2, cricketRelevance: 0.7 },
  { country: "South Africa", region: "africa", demand: 0.65, competition: 0.3, cricketRelevance: 0.75 },
  { country: "New Zealand", region: "oceania", demand: 0.6, competition: 0.4, cricketRelevance: 0.8 },
  { country: "United States", region: "americas", demand: 0.4, competition: 0.2, cricketRelevance: 0.3 },
  { country: "Germany", region: "europe", demand: 0.3, competition: 0.1, cricketRelevance: 0.2 },
  { country: "Kenya", region: "africa", demand: 0.5, competition: 0.1, cricketRelevance: 0.6 },
];

export function rankGlobalMarkets(product: string) {
  return GLOBAL_MARKETS
    .map(m => ({
      ...m,
      opportunityScore: Math.round(
        (m.demand * 0.5 + (1 - m.competition) * 0.3 + m.cricketRelevance * 0.2) * 100
      )
    }))
    .sort((a, b) => b.opportunityScore - a.opportunityScore);
}