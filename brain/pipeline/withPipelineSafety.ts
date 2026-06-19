export function withPipelineSafety(report: any) {
  return {
    meta: report.meta ?? {
      query: "unknown",
      country: "global",
      timestamp: Date.now(),
    },

    demand: {
      score: report?.demand?.score ?? 0,
      drivers: report?.demand?.drivers ?? [],
    },

    confidence: report?.confidence ?? {
      score: 0.3,
      level: "low",
    },

    geoAnalysis: {
      primaryRegion: report?.geoAnalysis?.primaryRegion ?? "Unknown",
      hotspots: report?.geoAnalysis?.hotspots ?? [],
      globalComparison: report?.geoAnalysis?.globalComparison ?? {},
    },

    trend: report?.trend ?? {
      direction: "stable",
      velocity: "medium",
      dataPoints: [],
    },

    opportunities: report?.opportunities ?? [],
    risks: report?.risks ?? [],

    recommendation: report?.recommendation ?? "No recommendation",
    scoreBreakdown: report?.scoreBreakdown ?? {},
  };
}