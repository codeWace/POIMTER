export function clusterGeo(regions: Record<string, number>) {
  const entries = Object.entries(regions);

  const sorted = entries.sort((a, b) => b[1] - a[1]);

  const center = sorted[0]?.[1] ?? 0;

  return {
    clusters: {
      high: sorted.filter(([_, v]) => v > center * 0.8),
      medium: sorted.filter(([_, v]) => v <= center * 0.8 && v > center * 0.5),
      low: sorted.filter(([_, v]) => v <= center * 0.5),
    },
    centroid: center,
  };
}