export function generateAiSummary(session: any) {
  const demand = session?.demandScore ?? 0;
  const competition = session?.competition ?? 0;
  const newsCount = session?.news?.length ?? 0;
  const sentiment = session?.sentiment ?? 50;

  const demandView =
    demand >= 70
      ? "strong underlying demand conditions"
      : demand >= 50
      ? "moderate demand with selective strength"
      : "weak and inconsistent demand signals";

  const competitionView =
    competition >= 70
      ? "elevated competitive intensity with compressed margins"
      : competition >= 40
      ? "balanced but increasingly competitive environment"
      : "relatively fragmented competitive landscape";

  const newsView =
    newsCount > 5
      ? "high-frequency information flow suggesting active market repricing"
      : "moderate information flow with limited narrative momentum";

  const sentimentView =
    sentiment > 60
      ? "constructive sentiment backdrop"
      : sentiment > 40
      ? "neutral sentiment with cautious positioning"
      : "risk-off sentiment prevailing across participants";

  const outlook =
    demand > competition
      ? "favourable risk/reward skew with growth bias"
      : "asymmetric risk profile tilted toward execution risk";

  return `
HEDGE FUND ANALYST NOTE

We observe ${demandView} within the current operating environment, supported by ongoing sector-level activity.

The competitive structure reflects ${competitionView}, implying potential pressure on pricing power and market share expansion.

Market intelligence signals indicate ${newsView}, which may suggest short-term volatility in narrative-driven positioning.

Sentiment indicators remain ${sentimentView}, providing limited conviction for aggressive upside re-rating.

Overall, we classify the setup as ${outlook}. Selective entry is recommended, with execution quality acting as the primary differentiator of outcomes.
  `.trim();
}