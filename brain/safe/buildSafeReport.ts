import { IntelligenceReportSchema } from "./../schemas/intelligenceReportSchema";

export function safeBuildReport(report: any) {
  const result = IntelligenceReportSchema.safeParse(report);

  if (!result.success) {
    return {
      meta: {
        query: report?.meta?.query ?? "unknown",
        country: report?.meta?.country ?? "Global",
        timestamp: Date.now(),
      },

      demand: { score: 0, drivers: [] },

      confidence: {
        score: 0.3,
        level: "low",
        explanation: "Fallback due to invalid data",
      },

      geoAnalysis: {
        primaryRegion: "Global",
        hotspots: [],
        globalComparison: {},
      },

      trend: {
        direction: "stable",
        velocity: "slow",
        dataPoints: [],
      },

      anomaly: { isAnomaly: false, severity: "low", zScore: 0 },

      opportunityScore: {
        value: 0,
        opportunities: [],
        risks: [],
        reasoning: ["fallback mode"],
      },

      recommendation: "Insufficient data",

      dataQuality: 0,
    };
  }

  return result.data;
}