// poimter/mapField/mapField.ts

import { SearchBundle } from "../types/searchNode.types";

/**
 * Graph node representing internal or external signal
 */
export type MapNode = {
  id: string;
  label: string;
  type: "internal" | "external";
  strength: number;
};

/**
 * Demand curve point over time
 */
export type DemandPoint = {
  timestamp: number;
  value: number;
};

/**
 * Final Map Field output (intelligence layer)
 */
export type MapOutput = {
  product: string;
  nodes: MapNode[];
  demandCurve: DemandPoint[];
  trendScore: number;
};

/**
 * MAIN MAP FIELD ENGINE
 * Converts raw SearchBundle → structured intelligence
 */
export function runMapField(data: SearchBundle): MapOutput {
  // ----------------------------
  // 1. GRAPH NODE GENERATION
  // ----------------------------
  const nodes: MapNode[] = [];

  // INTERNAL → company intent signals
  data.internal.forEach((item) => {
    nodes.push({
      id: item.id,
      label: item.notes || "internal intent",
      type: "internal",
      strength: 0.7
    });
  });

  // EXTERNAL → market reality signals
  data.external.forEach((item) => {
    nodes.push({
      id: item.id,
      label: item.title,
      type: "external",
      strength: item.mentions
        ? Math.min(item.mentions / 500, 1)
        : 0.5
    });
  });

  // ----------------------------
  // 2. DEMAND CURVE GENERATION
  // ----------------------------
  const demandCurve: DemandPoint[] = data.external.map((item, index) => ({
    timestamp: Date.now() - index * 1000000,
    value: item.mentions || 50
  }));

  // ----------------------------
  // 3. TREND SCORE CALCULATION
  // ----------------------------
  const totalMentions = data.external.reduce(
    (sum, item) => sum + (item.mentions || 0),
    0
  );

  const avgMentions =
    totalMentions / (data.external.length || 1);

  const trendScore = Math.min(avgMentions / 500, 1);

  // ----------------------------
  // 4. FINAL OUTPUT
  // ----------------------------
  return {
    product: data.product,
    nodes,
    demandCurve,
    trendScore
  };
}