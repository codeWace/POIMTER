import { searchAgent } from "@/agents/searchAgent";
import { mapAgent } from "@/agents/mapAgent";
import { reportAgent } from "@/agents/reportAgent";

export function generateAutonomousActions(metrics: Record<string, number>) {
  return {
    search: searchAgent(metrics.search),
    map: mapAgent(metrics.map),
    report: reportAgent(metrics.report),
  };
}