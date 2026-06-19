export function detectAnomaly(series: number[]) {
  const mean = series.reduce((a, b) => a + b, 0) / series.length;

  const std =
    Math.sqrt(
      series.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) /
        series.length
    );

  const last = series[series.length - 1];

  const zScore = (last - mean) / (std || 1);

  return {
    isAnomaly: Math.abs(zScore) > 1.5,
    zScore,
    severity:
      Math.abs(zScore) > 2
        ? "high"
        : Math.abs(zScore) > 1.5
        ? "medium"
        : "low",
  };
}