export function buildTrend(series: number[]) {
  const first = series[0];
  const last = series[series.length - 1];

  const diff = last - first;

  return {
    direction:
      diff > 5 ? "rising" : diff < -5 ? "declining" : "stable",

    velocity:
      Math.abs(diff) > 20
        ? "fast"
        : Math.abs(diff) > 10
        ? "medium"
        : "slow",

    dataPoints: series.map((v, i) => ({
      t: `t-${i + 1}`,
      value: v,
    })),
  };
}