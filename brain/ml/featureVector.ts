import { safeArray, safeDivide } from "../ml/mlSafetyGuard";

export function buildFeatureVector(result: any, query: string) {
  const search = safeArray(result?.searchVolume, [40, 50, 60]);

  const sum = search.reduce((a, b) => a + b, 0);

  const avg = safeDivide(sum, search.length, 0);

  const variance =
    safeDivide(
      search.reduce((acc, v) => acc + Math.pow(v - avg, 2), 0),
      search.length,
      0
    );

  return {
    demand: avg,
    volatility: Math.sqrt(variance),
    queryComplexity: query.length,
    signalStrength: avg * (1 / (1 + variance)),
  };
}