export function inferGlobalMarkets(query: string) {
  const text = query.toLowerCase();

  const markets: { region: string; score: number; reason: string }[] = [];

  // ---------------------------
  // 🏏 SPORTS GOODS / CRICKET
  // ---------------------------
  if (
    text.includes("cricket") ||
    text.includes("bat") ||
    text.includes("sports") ||
    text.includes("equipment")
  ) {
    markets.push(
      { region: "India", score: 95, reason: "massive cricket demand base" },
      { region: "Pakistan", score: 88, reason: "grassroots adoption" },
      { region: "United Kingdom", score: 80, reason: "origin market" },
      { region: "Australia", score: 78, reason: "high participation rate" },
      { region: "South Africa", score: 72, reason: "strong competitive leagues" },
      { region: "UAE", score: 65, reason: "expat-driven sports market" },
      { region: "Bangladesh", score: 85, reason: "rapidly growing demand" }
    );
  }

  // ---------------------------
  // 🏭 MANUFACTURING / EXPORT
  // ---------------------------
  else if (
    text.includes("manufacturing") ||
    text.includes("export") ||
    text.includes("factory")
  ) {
    markets.push(
      { region: "China", score: 90, reason: "global production hub" },
      { region: "Vietnam", score: 85, reason: "low-cost manufacturing growth" },
      { region: "India", score: 80, reason: "export expansion economy" },
      { region: "Mexico", score: 75, reason: "US supply chain proximity" },
      { region: "Germany", score: 70, reason: "industrial demand base" }
    );
  }

  // ---------------------------
  // 💰 DEFAULT GLOBAL MARKETS
  // ---------------------------
  else {
    markets.push(
      { region: "United States", score: 75, reason: "large consumer market" },
      { region: "Germany", score: 70, reason: "stable industrial base" },
      { region: "UAE", score: 65, reason: "global trade hub" }
    );
  }

  return markets.sort((a, b) => b.score - a.score);
}