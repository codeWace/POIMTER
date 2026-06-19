export type IntelligenceReport = {
  meta: {
    query: string;
    country: string;
    timestamp: number;
  };

  demand: {
    score: number;
    drivers: string[];
  };

  insight: {
    summary: string;
    explanation: string;
  };

  internalAnalysis: {
  signalCount: number;
  averageStrength: number;
  status: string;
};

  opportunities: any[];

  risks: {
  market: string[];
  financial: string[];
  operational: string[];
  regulatory: string[];
};

  recommendation: string;

  scoreBreakdown: {
    demand: number;
    competition: number;
    growth: number;
  };

  analytics: {
    demandTrend: any;
    countryComparison: any;
    opportunityBreakdown: any;
  };

  map: {
    highlightCountry: string;
    intensity: number;
  };

confidence: {
  score: number;
  level: "low" | "medium" | "high";
  explanation: string;
};

geoAnalysis: {
  primaryRegion: string;
  hotspots: { region: string; score: number }[];
  globalComparison: Record<string, number>;
};

trend: {
  direction: "rising" | "stable" | "declining";
  velocity: "slow" | "medium" | "fast";
  dataPoints: { t: string; value: number }[];
};

}