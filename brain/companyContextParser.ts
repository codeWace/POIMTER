export type ParsedCompanyContext = {
  description: string;
  products: string[];
  markets: string[];
  goals: string[];
  constraints: string[];
};

export function parseCompanyContext(input: string): ParsedCompanyContext {
  const text = input.toLowerCase();

  // -----------------------------
  // 1. SIMPLE KEYWORD EXTRACTION
  // -----------------------------

  const productHints = [
    "sell",
    "manufacture",
    "provide",
    "service",
    "product",
    "store",
    "shop",
  ];

  const marketHints = [
    "pakistan",
    "india",
    "china",
    "europe",
    "usa",
    "asia",
  ];

  const goalHints = [
    "grow",
    "expand",
    "scale",
    "increase",
    "profit",
    "reduce cost",
  ];

  const constraintHints = [
    "budget",
    "limited",
    "no capital",
    "small team",
    "regulation",
    "compliance",
  ];

  // -----------------------------
  // 2. EXTRACT MATCHES
  // -----------------------------

  const products = productHints.filter((p) => text.includes(p));
  const markets = marketHints
  .map((m) => {
    let score = 0;

    if (text.includes(m)) score += 5;
    if (text.includes("export") && m !== "usa") score += 2;
    if (text.includes("manufacturing")) score += 2;

    return { region: m, score };
  })
  .filter((m) => m.score > 0)
  .sort((a, b) => b.score - a.score)
  .map((m) => m.region);
  const goals = goalHints.filter((g) => text.includes(g));
  const constraints = constraintHints.filter((c) => text.includes(c));

  // -----------------------------
  // 3. RETURN STRUCTURED CONTEXT
  // -----------------------------

  return {
    description: input,
    products,
    markets,
    goals,
    constraints,
  };
}