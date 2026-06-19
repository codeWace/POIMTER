export function generateGlobalMarkets(query: string, industry: string) {
  const base = industry?.toLowerCase() || query.toLowerCase();

  const markets = [];

  // SPORTS GOODS / CRICKET logic
  if (base.includes("cricket") || base.includes("bat") || base.includes("sports")) {
    markets.push(
      { region: "India", demand: 92, reason: "massive cricket adoption" },
      { region: "United Kingdom", demand: 78, reason: "origin of sport" },
      { region: "Australia", demand: 74, reason: "high participation" },
      { region: "South Africa", demand: 68, reason: "strong cricket culture" },
      { region: "UAE", demand: 63, reason: "expat-driven demand hub" },
      { region: "Pakistan", demand: 85, reason: "high grassroots demand" },
      { region: "Bangladesh", demand: 80, reason: "fast-growing sports market" }
    );
  }

  // GENERAL EXPORT / MANUFACTURING
  else if (base.includes("manufacturing") || base.includes("export")) {
    markets.push(
      { region: "China", demand: 88, reason: "global manufacturing hub" },
      { region: "Vietnam", demand: 82, reason: "low-cost production" },
      { region: "India", demand: 80, reason: "export expansion zone" },
      { region: "Mexico", demand: 75, reason: "US trade proximity" },
      { region: "Germany", demand: 70, reason: "industrial demand base" }
    );
  }

  // DEFAULT MARKET MODEL
  else {
    markets.push(
      { region: "United States", demand: 70, reason: "large consumer base" },
      { region: "Germany", demand: 65, reason: "stable industrial demand" },
      { region: "UAE", demand: 60, reason: "trade hub" }
    );
  }

  return markets.sort((a, b) => b.demand - a.demand);
}