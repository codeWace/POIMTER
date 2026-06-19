export function buildAIInsight({
  demand,
  sentiment,
  trend,
  news,
}: any) {
  const score =
    (demand * 0.4) +
    ((sentiment + 1) / 2) * 0.2 +
    (trend * 0.2) +
    (news * 0.2);

  let summary = "";
  let explanation = "";
  let recommendation = "";

  if (score > 0.7) {
    summary = "Strong market opportunity detected with positive multi-signal alignment.";
    explanation =
      "All key indicators show upward momentum including demand, sentiment, and trend signals.";
    recommendation = "High opportunity — consider phased market entry immediately.";
  } else if (score > 0.4) {
    summary = "Moderate opportunity with mixed signals.";
    explanation =
      "Market shows growth potential but with some volatility or uncertainty.";
    recommendation = "Proceed cautiously with validation before scaling.";
  } else {
    summary = "Weak or uncertain market conditions.";
    explanation =
      "Signals indicate low demand or inconsistent market behavior.";
    recommendation = "Hold strategy — monitor before investment.";
  }

  return {
    score,
    summary,
    explanation,
    recommendation,
  };
}