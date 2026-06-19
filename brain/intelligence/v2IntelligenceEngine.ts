export function buildV2Intelligence(input: {
  marketSignal: any;
  demandScore: number;
  geoCluster: any;
}) {
  const demand = input.marketSignal?.demand ?? 0;
  const supply = input.marketSignal?.supply ?? 0;

  const competitionPressure = supply;
  const growthMomentum = demand - supply;

  // 1. FUTURE DEMAND
  const futureDemand =
    growthMomentum > 0.3
      ? "Strong upward trajectory"
      : growthMomentum > 0.1
      ? "Moderate growth expected"
      : growthMomentum > -0.1
      ? "Stable demand"
      : "Declining demand";

  // 2. MARKET SATURATION
  const saturation =
    supply > 0.7
      ? "Highly saturated market"
      : supply > 0.4
      ? "Moderately competitive market"
      : "Early-stage low competition market";

  // 3. COMPETITOR PREDICTION
  const competitorPrediction =
    competitionPressure > 0.7
      ? "Market consolidation likely (dominant players strengthening)"
      : competitionPressure > 0.4
      ? "Increasing competition expected"
      : "Fragmented market (opportunity for entry)";

  // 4. INDUSTRY LIFECYCLE
  const lifecycle =
    demand > 0.7 && supply < 0.4
      ? "Growth stage"
      : demand > 0.5 && supply > 0.5
      ? "Maturity stage"
      : demand < 0.4
      ? "Decline stage"
      : "Emerging stage";

  // 5. JOB DEMAND FORECAST (proxy signal)
  const jobDemandForecast =
    demand > 0.6
      ? "Increasing hiring demand in this sector"
      : demand > 0.4
      ? "Stable job demand"
      : "Weak hiring activity expected";

  return {
    futureDemand,
    saturation,
    competitorPrediction,
    lifecycle,
    jobDemandForecast,
  };
}