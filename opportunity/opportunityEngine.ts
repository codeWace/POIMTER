export function rankOpportunity(signal: any, forecast: number, anomaly: number) {
  return (
    signal.demand * 0.4 +
    signal.sentiment * 0.2 +
    forecast * 0.3 +
    anomaly * 0.5
  );
}