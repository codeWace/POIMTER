export function forecast(series: number[]) {
  const n = series.length;

  const slope =
    (series[n - 1] - series[0]) / (n - 1 || 1);

  const next = series[n - 1] + slope;

  return {
    next7: next,
    trendSlope: slope,
    direction:
      slope > 1 ? "rising" : slope < -1 ? "declining" : "stable",
  };
}