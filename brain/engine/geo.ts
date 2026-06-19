export function buildGeoAnalysis(regions: Record<string, number>, primary: string) {
  const sorted = Object.entries(regions).sort((a, b) => b[1] - a[1]);

  return {
    primaryRegion: primary,
    hotspots: sorted.map(([region, score]) => ({
      region,
      score,
    })),
    globalComparison: Object.fromEntries(sorted),
  };
}