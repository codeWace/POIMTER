function generateMarketHeatmap(query: string) {
  const q = query.toLowerCase();

  const baseMarkets = [
    { name: "United States", demand: 60, competition: 75 },
    { name: "United Kingdom", demand: 55, competition: 60 },
    { name: "Germany", demand: 70, competition: 50 },
    { name: "UAE", demand: 65, competition: 40 },
    { name: "India", demand: 85, competition: 80 },
    { name: "Australia", demand: 75, competition: 60 },
    { name: "Nigeria", demand: 68, competition: 35 }
  ];

  return baseMarkets.map(m => {
    let score = m.demand;

    // CRICKET BOOST LOGIC
    if (q.includes("cricket")) {
      if (m.name === "India" || m.name === "Australia") score += 15;
      if (m.name === "United Kingdom") score += 10;
      if (m.name === "UAE") score += 8;
    }

    // MANUFACTURING BOOST
    if (q.includes("manufacturing")) {
      if (m.name === "China" || m.name === "India") score += 10;
    }

    return {
      ...m,
      score
    };
  });
}