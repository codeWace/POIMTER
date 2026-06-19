export function computeConfidence(features: any) {
  const base = features.demandScore / 100;
  const penalty = features.volatility / 200;

  const score = Math.max(0.2, Math.min(0.95, base - penalty));

  return {
    score,
    level:
      score > 0.7
        ? "high"
        : score > 0.4
        ? "medium"
        : "low",
    explanation:
      features.volatility > 30
        ? "High volatility detected"
        : "Stable signal pattern",
  };
}