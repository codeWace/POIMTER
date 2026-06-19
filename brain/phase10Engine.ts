import { ok } from "assert";

export type Metrics = Record<string, number>;

export function computeSystemThought(metrics: Metrics): string {
  const s = metrics.search;
  const m = metrics.map;
  const r = metrics.report;

  if (s > m && s > r) return "system: search dominance";
  if (m > s && m > r) return "system: map clustering";
  if (r > s && r > m) return "system: report synthesis";

  return "system: balanced state";
}