import { safeNumber, clamp } from "../ml/mlSafetyGuard";

export function computeMLScore(vector: any) {
  const demand = safeNumber(vector.demand);
  const signal = safeNumber(vector.signalStrength);
  const volatility = safeNumber(vector.volatility);

  const score =
    demand * 0.5 +
    signal * 0.3 -
    volatility * 0.2;

  return clamp(score, 0, 100);
}