import { z } from "zod";

export const IntelligenceReportSchema = z.object({
  meta: z.object({
    query: z.string(),
    country: z.string(),
    timestamp: z.number(),
  }),

  demand: z.object({
    score: z.number(),
    drivers: z.array(z.string()),
    growth: z.number().optional(),
    competition: z.string().optional(),
  }),

  confidence: z.object({
    score: z.number(),
    level: z.enum(["low", "medium", "high"]),
    explanation: "Derived from demand-supply confidence model",
  }),

  internalAnalysis: z.object({
  signalCount: z.number(),
  averageStrength: z.number(),
  status: z.string(),
}),

  geoAnalysis: z.object({
    primaryRegion: z.string(),
    hotspots: z.array(
      z.object({
        region: z.string(),
        score: z.number(),
      })
    ),
    globalComparison: z.record(z.number()),
  }),

  trend: z.object({
    direction: z.enum(["rising", "stable", "declining"]),
    velocity: z.enum(["slow", "medium", "fast"]),
    dataPoints: z.array(
      z.object({
        t: z.string(),
        value: z.number(),
      })
    ),
  }),

  insight: z.object({
    summary: z.string(),
    explanation: z.string(),
  }),

  opportunities: z.array(z.any()),

  risks: z.object({
  market: z.array(z.string()),
  financial: z.array(z.string()),
  operational: z.array(z.string()),
  regulatory: z.array(z.string()),
}),

  recommendation: z.string(),

  scoreBreakdown: z.object({
    demand: z.number(),
    competition: z.number(),
    volatility: z.number(),
  }),
});

export type IntelligenceReport = z.infer<typeof IntelligenceReportSchema>;