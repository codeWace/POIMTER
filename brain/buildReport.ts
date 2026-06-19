import { safeArray } from "./ml/mlSafetyGuard";
import { classifyPlace } from "@/brain/utils/classifyPlace";
import { buildV2Intelligence } from "@/brain/intelligence/v2IntelligenceEngine";

export function buildReport(input: {
  query: string;
  result: any;
  marketSignal: any;
  geoCluster: any;
  internalData: any[];
  externalData: any[];
  companyContext: any;
}) {
  const {
    query,
    result,
    marketSignal,
    geoCluster,
    internalData,
  } = input;

  // =============================
  // BASE DEMAND SCORE
  // =============================
  const safeDemand = marketSignal?.demand ?? 0.4;

  let demandScore = Math.max(40, Math.round(safeDemand * 100));


  // =============================
  // INTERNAL STRENGTH
  // =============================
  const internalStrength =
  internalData?.length > 0
    ? internalData.reduce((acc, d) => {
        return acc + (d.score * (d.confidence || 0.5));
      }, 0) / internalData.length
    : 0;

  const internalWeight = 0.4; // increase influence

demandScore = Math.max(40, Math.round(
  demandScore * (1 - internalWeight) +
  internalStrength * 100 * internalWeight
));

  // =============================
  // CONFIDENCE
  // =============================
  const confidenceScore = Math.max(
    0.45,
    Math.min(
      0.95,
      (marketSignal?.demand ?? 0.5) * 0.6 +
        (1 - (marketSignal?.supply ?? 0.3)) * 0.4
    )
  );

  // =============================
  // RISK ENGINE (UI SAFE)
  // =============================
  type RiskItem = {
    text: string;
    severity: "low" | "medium" | "high";
    score: number;
  };

  const risks: {
    market: RiskItem[];
    financial: RiskItem[];
    operational: RiskItem[];
    regulatory: RiskItem[];
  } = {
    market: [],
    financial: [],
    operational: [],
    regulatory: [],
  };

  // ADD THIS right after the risks object is declared:
const aiRisk = input.marketSignal?.aiRisk;

// THEN replace the market risks block:
if (aiRisk?.marketRisks?.length > 0) {
  risks.market = aiRisk.marketRisks.map((t: string) => ({
    text: t, severity: "medium" as const, score: 60
  }));
} else if ((marketSignal?.supply ?? 0) > 0.7) {
  risks.market.push({ text: "High competitive pressure in market", severity: "high" as const, score: 70 });
}

if (aiRisk?.financialRisks?.length > 0) {
  risks.financial = aiRisk.financialRisks.map((t: string) => ({
    text: t, severity: "medium" as const, score: 60
  }));
}

if (aiRisk?.operationalRisks?.length > 0) {
  risks.operational = aiRisk.operationalRisks.map((t: string) => ({
    text: t, severity: "medium" as const, score: 60
  }));
}

if (aiRisk?.regulatoryRisks?.length > 0) {
  risks.regulatory = aiRisk.regulatoryRisks.map((t: string) => ({
    text: t, severity: "medium" as const, score: 60
  }));
}

  // MARKET
  if ((marketSignal?.supply ?? 0) > 0.7) {
    risks.market.push({
      text: "High competitive pressure in market",
      severity: "high",
      score: 70,
    });
  } else if ((marketSignal?.supply ?? 0) > 0.5) {
    risks.market.push({
      text: "Moderate competition detected",
      severity: "medium",
      score: 50,
    });
  }

  if ((marketSignal?.demand ?? 0) < 0.3) {
    risks.market.push({
      text: "Weak market demand signals",
      severity: "high",
      score: 75,
    });
  }

  // OPERATIONAL
  if (internalStrength < 0.3) {
    risks.operational.push({
      text: "Weak internal capability signals",
      severity: "high",
      score: 75,
    });
  } else if (internalStrength < 0.5) {
    risks.operational.push({
      text: "Below-average operational readiness",
      severity: "medium",
      score: 50,
    });
  }

  // FINANCIAL
  if (demandScore < 50) {
    risks.financial.push({
      text: "Low revenue potential due to weak demand",
      severity: "high",
      score: 80,
    });
  }

  if (confidenceScore < 0.65) {
    risks.financial.push({
      text: "Uncertain revenue forecasting accuracy",
      severity: "medium",
      score: 60,
    });
  }

  // REGULATORY
  if (
    geoCluster?.region === "EU" ||
    geoCluster?.region === "Europe"
  ) {
    risks.regulatory.push({
      text: "Potential regulatory constraints in EU market",
      severity: "medium",
      score: 60,
    });
  }

  if (demandScore > 80) {
    risks.regulatory.push({
      text: "High-growth markets face increased regulatory scrutiny",
      severity: "low",
      score: 40,
    });
  }

  // SAFE FALLBACKS
  if (risks.market.length === 0) {
    risks.market.push({
      text: "No significant market risk detected",
      severity: "low",
      score: 10,
    });
  }

  if (risks.financial.length === 0) {
    risks.financial.push({
      text: "No financial risk detected",
      severity: "low",
      score: 10,
    });
  }

  if (risks.operational.length === 0) {
    risks.operational.push({
      text: "No operational risk detected",
      severity: "low",
      score: 10,
    });
  }

  if (risks.regulatory.length === 0) {
    risks.regulatory.push({
      text: "No regulatory risk detected",
      severity: "low",
      score: 10,
    });
  }

  // =============================
  // GEO
  // =============================
  const hotspots = safeArray(
  geoCluster?.hotspots ?? [
    {
      region: geoCluster?.region ?? "global",
      name: geoCluster?.name ?? "Global",
      score: demandScore,
      type: geoCluster?.type ?? "unknown",
    },
  ]
).map((h: any) => ({
  region: h?.region || geoCluster?.region || "global",
  name: h?.name || geoCluster?.name || "Global",
  score: h?.score ?? demandScore,
  type: h?.type || "unknown",
}));

  // =============================
// FUTURE DEMAND ENGINE (CORE)
// =============================

const demandMomentum =
  (marketSignal?.demand ?? 0) - (marketSignal?.supply ?? 0);

// short-term (0–3 months)
const shortTerm =
  demandMomentum > 0.25
    ? "Strong upward pressure expected"
    : demandMomentum > 0.1
    ? "Moderate growth expected"
    : demandMomentum > -0.1
    ? "Stable demand expected"
    : "Declining demand likely";

// mid-term (3–12 months)
const midTerm =
  internalStrength > 0.6 && demandMomentum > 0.2
    ? "Expansion phase likely"
    : internalStrength > 0.4
    ? "Gradual growth with volatility"
    : "Uncertain market direction";

// long-term (1–3 years)
const longTerm =
  demandScore > 70
    ? "Structural growth market"
    : demandScore > 40
    ? "Mature but stable market"
    : "High risk / declining category";

// key drivers (this is what makes it investor-grade)
const emergingDrivers: string[] = [];

if ((marketSignal?.demand ?? 0) > 0.6) {
  emergingDrivers.push("Rising consumer demand signals");
}

if ((marketSignal?.breakout ?? false) === true) {
  emergingDrivers.push("Market volatility breakout detected");
}

if (internalStrength > 0.6) {
  emergingDrivers.push("Strong internal execution capability");
}

if ((marketSignal?.supply ?? 0) > 0.6) {
  emergingDrivers.push("Competitive pressure accelerating consolidation");
}

  // =============================
// FUTURE INTELLIGENCE v2 ENGINE
// =============================

const opportunityPerTrend = [
  {
    theme: "Market Expansion Opportunity",
    signal:
      demandScore > 60 && marketSignal?.demand > 0.5,
    insight:
      "Market conditions support expansion into adjacent segments",
  },
  {
    theme: "Efficiency Opportunity",
    signal: internalStrength < 0.5,
    insight:
      "Internal inefficiencies may be limiting growth potential",
  },
  {
    theme: "Timing Opportunity",
    signal: marketSignal?.breakout,
    insight:
      "Market volatility suggests early entry advantage window",
  },
].filter((o) => o.signal);


const marketEntryTiming =
  demandScore > 70 && marketSignal?.breakout
    ? "Immediate entry window (high momentum phase)"
    : demandScore > 50
    ? "Short-term entry window (3–6 months)"
    : "Delayed entry recommended (market still forming)";


    // =============================
// INTERNAL vs MARKET CONFLICT ENGINE
// =============================

const marketVsInternalSignal =
  marketSignal?.demand > 0.6 && internalStrength < 0.4
    ? "Market growing faster than internal capability → risk of market share loss"
    : marketSignal?.demand > 0.6 && internalStrength > 0.6
    ? "Aligned growth between internal capability and market demand"
    : marketSignal?.demand < 0.4 && internalStrength > 0.6
    ? "Overcapacity risk → internal strength exceeds market demand"
    : "Balanced market-positioning scenario";

const conflictSeverity =
  marketSignal?.demand > 0.6 && internalStrength < 0.4
    ? "high"
    : marketSignal?.demand > 0.6 && internalStrength < 0.6
    ? "medium"
    : "low";

    // =============================
// INVESTOR-GRADE PREDICTION PANEL
// =============================

const investmentOutlook =
  demandScore > 70 && confidenceScore > 0.7
    ? "Strong Buy Signal (High Growth + High Confidence)"
    : demandScore > 60 && confidenceScore > 0.5
    ? "Moderate Buy Signal (Growth phase detected)"
    : demandScore > 40
    ? "Hold (Uncertain expansion phase)"
    : "Avoid / High Risk Market";

const riskAdjustedReturn =
  Math.round(demandScore * confidenceScore);

const strategicRating =
  riskAdjustedReturn > 70
    ? "A (High Conviction Opportunity)"
    : riskAdjustedReturn > 50
    ? "B (Moderate Opportunity)"
    : riskAdjustedReturn > 30
    ? "C (Speculative)"
    : "D (High Risk)";

    // =============================
// INVESTOR-GRADE INTELLIGENCE PANEL
// =============================

const investmentGradeScore =
  demandScore * 0.4 +
  confidenceScore * 100 * 0.3 +
  internalStrength * 100 * 0.3;

const investmentSignal =
  investmentGradeScore > 75
    ? "Strong Buy Signal"
    : investmentGradeScore > 55
    ? "Watchlist Opportunity"
    : investmentGradeScore > 35
    ? "Speculative / High Risk"
    : "Avoid / Declining Market";

    // =============================
// EXECUTIVE SUMMARY ENGINE (CEO STYLE)
// =============================

const executiveSummary = aiRisk?.executiveSummary ?? (
  demandScore > 70 && internalStrength > 0.6
    ? `High-growth opportunity detected in ${geoCluster?.region}.`
    : demandScore > 40
    ? `Market shows early-stage demand in ${geoCluster?.name ?? "global markets"}.`
    : `Weak demand environment detected. Focus on optimization.`
);
    // =============================
// TOP ACTIONS ENGINE (STRATEGIC PLAYBOOK)
// =============================

const topActions: string[] = aiRisk?.topActions ?? [];
if (topActions.length === 0) {
  if (marketSignal?.demand > 0.6) topActions.push("Accelerate market entry to capture rising demand");
  else topActions.push("Focus on demand validation before scaling operations");
  if (internalStrength < 0.5) topActions.push("Improve internal operational efficiency before expansion");
  else topActions.push("Leverage internal strength to scale existing market position");
  topActions.push(marketSignal?.breakout ? "Enter market immediately due to volatility window" : "Adopt phased entry strategy over next 3-6 months");
}


// =============================
// AUTO PITCH DECK GENERATOR
// =============================

const pitchDeck = {
  slide1_title: `Market Opportunity: ${query}`,

  slide2_problem: `Current market inefficiency in ${geoCluster?.region} driven by ${
    marketSignal?.supply > 0.6
      ? "high competition pressure"
      : "early-stage market formation"
  }`,

  slide3_opportunity: `Demand score of ${demandScore} indicates ${
    demandScore > 60 ? "strong" : "emerging"
  } market opportunity with significant upside potential.`,

  slide4_insight: executiveSummary,

  slide5_risks: risks.market[0]?.text || "No major risks identified",

  slide6_timing: `Market entry recommendation: ${
    marketSignal?.breakout ? "Immediate" : "Phased approach"
  }`,

  slide7_conclusion: `Overall classification: ${
    demandScore > 70
      ? "High-growth investment opportunity"
      : demandScore > 40
      ? "Moderate potential with execution dependency"
      : "Speculative / high-risk market"
  }`,
};

// =============================
// COMPETITOR PREDICTION ENGINE
// =============================

const competitionPressure = marketSignal?.supply ?? 0;

const competitorPrediction =
  competitionPressure > 0.7
    ? "Market consolidation expected (strong incumbents dominate)"
    : competitionPressure > 0.4
    ? "Moderate competition with entry opportunities"
    : "Fragmented market with low entry barriers";

const competitorTrend =
  internalStrength < 0.4 && competitionPressure > 0.6
    ? "Risk of losing market share to competitors"
    : internalStrength > 0.6 && competitionPressure < 0.5
    ? "Potential for competitive advantage expansion"
    : "Stable competitive positioning";

    // =============================
// MARKET SATURATION CURVE
// =============================

const saturationLevel =
  (marketSignal?.supply ?? 0) / (marketSignal?.demand + 0.1);

const saturationStage =
  saturationLevel < 0.5
    ? "Early Growth Stage"
    : saturationLevel < 1
    ? "Expansion Stage"
    : saturationLevel < 1.5
    ? "Mature Market"
    : "Saturated / Declining Market";

const saturationRisk =
  saturationLevel > 1.2
    ? "High saturation risk - diminishing returns expected"
    : saturationLevel > 0.8
    ? "Moderate saturation pressure"
    : "Low saturation - room for growth";

    // =============================
// JOB DEMAND FORECASTING
// =============================

const jobDemandScore =
  demandScore * 0.5 +
  internalStrength * 100 * 0.3 +
  (100 - (marketSignal?.supply ?? 0) * 100) * 0.2;

const jobForecast =
  jobDemandScore > 70
    ? "High hiring demand expected in this sector"
    : jobDemandScore > 45
    ? "Stable job market with selective hiring"
    : "Declining job demand expected";

const inDemandSkills = [];

if (demandScore > 60) inDemandSkills.push("AI / Automation tools");
if (marketSignal?.demand > 0.6) inDemandSkills.push("Data-driven decision making");
if (internalStrength > 0.5) inDemandSkills.push("Execution & operations skills");
if (marketSignal?.breakout) inDemandSkills.push("Emerging tech adaptation");

// =============================
// WHAT TO BUILD NEXT ENGINE
// =============================

const buildNextIdeas: string[] = [];

if (marketSignal?.demand > 0.6 && marketSignal?.supply > 0.5) {
  buildNextIdeas.push("Differentiated AI-driven solution in crowded market");
}

if (saturationLevel < 0.5) {
  buildNextIdeas.push("First-mover product in emerging segment");
}

if (internalStrength < 0.4) {
  buildNextIdeas.push("Build internal capability tools (automation layer)");
}

if (marketSignal?.breakout) {
  buildNextIdeas.push("Capitalize on emerging trend before saturation");
}

if (demandScore > 70) {
  buildNextIdeas.push("Scale existing demand with platform expansion");
}

// =============================
// INDUSTRY LIFECYCLE DETECTION
// =============================

const lifecycle =
  saturationLevel < 0.4
    ? "Emerging Industry"
    : saturationLevel < 0.8
    ? "Growth Industry"
    : saturationLevel < 1.2
    ? "Mature Industry"
    : "Declining Industry";

const lifecycleInsight =
  lifecycle === "Emerging Industry"
    ? "Early-stage opportunity with high upside and uncertainty"
    : lifecycle === "Growth Industry"
    ? "Rapid expansion phase with strong investment potential"
    : lifecycle === "Mature Industry"
    ? "Stable but competitive environment"
    : "Shrinking market - consolidation likely";

        // =============================
// 🧠 POIMTER AUTONOMOUS STRATEGY ENGINE (V1)
// =============================

// 1. BUSINESS MODEL GENERATION
const businessModels: string[] = [];

if (demandScore > 70 && saturationLevel < 0.6) {
  businessModels.push("SaaS subscription platform");
}

if (marketSignal?.demand > 0.6 && internalStrength > 0.5) {
  businessModels.push("AI-powered analytics service");
}

if (competitionPressure > 0.6) {
  businessModels.push("Niche differentiation / premium positioning model");
}

if (saturationLevel > 1) {
  businessModels.push("Cost-leadership / efficiency-driven model");
}

// 2. PRICING STRATEGY ENGINE
const pricingStrategy =
  demandScore > 70
    ? "Premium pricing (high willingness to pay)"
    : demandScore > 40
    ? "Mid-tier competitive pricing"
    : "Penetration pricing required to enter market";

// 3. GO-TO-MARKET PLAN
const goToMarketPlan: string[] = [];

if (marketSignal?.demand > 0.6) {
  goToMarketPlan.push("Aggressive digital acquisition (SEO + Paid + Social)");
}

if (saturationLevel < 0.6) {
  goToMarketPlan.push("Early adopter targeting strategy");
}

if (competitionPressure > 0.6) {
  goToMarketPlan.push("Partnership-driven distribution strategy");
}

if (internalStrength < 0.4) {
  goToMarketPlan.push("MVP-first validation before scaling");
}

// 4. INVESTOR PITCH GENERATOR (AUTO)
const investorPitch = {
  problem:
    demandScore > 60
      ? "Rapidly growing demand with inefficient solutions"
      : "Underserved or declining market with transformation potential",

  opportunity:
    saturationLevel < 0.6
      ? "Early-stage market with high upside potential"
      : "Consolidation opportunity in mature market",

  whyNow:
    marketSignal?.breakout
      ? "Market disruption currently underway"
      : "Macro trends aligning with category growth",

  edge:
    internalStrength > 0.5
      ? "Strong execution capability and internal intelligence advantage"
      : "Data-driven insight advantage over traditional players",
};

// 5. COMPETITOR BREAKDOWN TABLE (TESLA vs BYD STYLE)
const competitorTable = {
  format: "strategic_comparison",
  insights: {
    marketLeader: competitionPressure > 0.6 ? "Incumbents dominate market" : "Fragmented leadership",
    challengerOpportunity: internalStrength < 0.5 ? "High disruption potential" : "Incremental competition",
    advantageGap:
      internalStrength - competitionPressure > 0
        ? "Execution advantage exists"
        : "Competitors currently ahead",
  },
};

// =============================
// INTERNAL DATA INTELLIGENCE LAYER
// =============================

const internalSummary = {
  totalRecords: internalData?.length ?? 0,

  averageScore:
    internalData?.length > 0
      ? internalData.reduce((a, b) => a + (b?.score || 0), 0) /
        internalData.length
      : 0,

  keySignals: internalData
    ?.filter((d) => d?.importance > 0.5)
    .map((d) => d?.text || d?.title || "signal")
    .slice(0, 5),

  sentiment:
    internalData?.length > 0
      ? internalData.reduce((a, b) => a + (b?.sentiment || 0), 0) /
        internalData.length
      : 0,
};

const v2 = buildV2Intelligence({
  marketSignal,
  demandScore,
  geoCluster,
});

  // =============================
  // RETURN REPORT
  // =============================
  return {
    meta: {
  query,
  country:
    geoCluster?.name ||
    geoCluster?.country ||
    geoCluster?.region ||
        "Unknown",
      locationType: classifyPlace(
        geoCluster?.type || geoCluster?.name
      ),
      timestamp: Date.now(),
    },

    demand: {
      score: demandScore,
      growth: Math.round((marketSignal?.demand ?? 0) * 20),
      competition:
        marketSignal?.supply > 0.6 ? "high" : "medium",
      drivers: ["google_trends", "reddit", "news"],
    },

    insight: {
      summary:
        demandScore > 60
          ? "Strong market demand detected"
          : demandScore > 40
          ? "Moderate market demand detected"
          : "Weak market demand detected",
      explanation: "Derived from multi-signal fusion engine",
    },

    geoAnalysis: {
  primaryRegion:
  geoCluster?.name ||
  geoCluster?.country ||
  geoCluster?.region ||
  "Global",
  hotspots,
  globalComparison: {
    [geoCluster?.region || "global"]: demandScore,
  },
},

    trend: {
      direction:
        marketSignal?.demand > 0.6 ? "rising" : "stable",
      velocity: marketSignal?.breakout ? "fast" : "medium",
      dataPoints: [40, 50, 60].map((v, i) => ({
        t: `t-${i}`,
        value: v,
      })),
    },

    confidence: {
      score: confidenceScore,
      level:
        confidenceScore > 0.7
          ? "high"
          : confidenceScore > 0.4
          ? "medium"
          : "low",
    },

    internalAnalysis: {
      signalCount: internalData.length,
      averageStrength: internalStrength,
      status:
        internalStrength > 0.7
          ? "strong"
          : internalStrength > 0.4
          ? "moderate"
          : "weak",
    },

    futureDemand: {
  shortTerm,
  midTerm,
  longTerm,
  emergingDrivers,
  investorSummary:
    demandScore > 70
      ? "High-confidence growth opportunity with strong demand signals"
      : demandScore > 40
      ? "Moderate opportunity with mixed signals"
      : "High uncertainty with downward risk bias",
},

    futureIntelligence: {
  opportunities: opportunityPerTrend,
  competitorPrediction,
  marketEntryTiming,
},

v2Intelligence: {
  competitorPrediction,
  competitorTrend,

  saturation: {
    level: saturationLevel,
    stage: saturationStage,
    risk: saturationRisk,
  },

  strategyEngine: {
  businessModels,
  pricingStrategy,
  goToMarketPlan,

  investorPitch,
  competitorTable,
},

  jobForecasting: {
    jobForecast,
    jobDemandScore: Math.round(jobDemandScore),
    inDemandSkills,
  },

  nextBuildIdeas: buildNextIdeas,

  industryLifecycle: {
    stage: lifecycle,
    insight: lifecycleInsight,
  },
},

conflictAnalysis: {
  summary: marketVsInternalSignal,
  severity: conflictSeverity,
},

investorView: {
  outlook: investmentOutlook,
  riskAdjustedReturn,
  rating: strategicRating,
},

investmentPanel: {
  score: Math.round(investmentGradeScore),
  signal: investmentSignal,

  breakdown: {
    demandStrength: demandScore,
    confidence: confidenceScore,
    executionStrength: internalStrength,
  },

  interpretation:
    investmentGradeScore > 75
      ? "Market shows strong multi-factor alignment (demand + execution + confidence)"
      : investmentGradeScore > 55
      ? "Mixed signals but positive trajectory exists"
      : "Weak alignment across market fundamentals",

  riskNote:
    risks.financial.length > 1
      ? "Financial uncertainty remains elevated"
      : "Financial risk within acceptable range",
},

executiveSummary,
topActions,
pitchDeck,

insight: {
  summary:
    demandScore > 60
      ? "Strong market demand detected"
      : demandScore > 40
      ? "Moderate market demand detected"
      : "Weak market demand detected",

  explanation: "Derived from multi-signal fusion engine",

  internalContext:
    internalSummary.totalRecords > 0
      ? `Internal data shows ${internalSummary.totalRecords} signals with avg strength ${internalSummary.averageScore.toFixed(1)}`
      : "No internal company data available",
},

    opportunities: result?.report?.opportunities ?? result?.opportunities ?? [],

    risks,

    v2,

    recommendation:
      demandScore > 70
        ? "High opportunity"
        : demandScore > 40
        ? "Medium opportunity"
        : "Low opportunity",

    scoreBreakdown: {
      demand: demandScore,
      competition: (marketSignal?.supply ?? 0) * 100,
      volatility: 25,
    },
  };
}