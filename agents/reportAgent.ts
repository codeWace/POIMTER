import { updateAgent } from "@/core/brainStore";

export const runReportAgent = async (data: any[]) => {
  updateAgent("report", {
    lastAction: "writing_report",
    signal: 90,
  });

  const searchResult = data[0];
  const opportunitiesFound = searchResult?.opportunitiesFound ?? 0;

  const opportunities = opportunitiesFound > 0
    ? [
        { title: "Market expansion opportunity detected", confidence: 80 },
        { title: "Demand signal exceeds supply pressure", confidence: 70 },
      ]
    : [
        { title: "Early-stage market — validate before scaling", confidence: 50 },
      ];

  return {
    summary: "Demand opportunity detected",
    confidence: 90,
    sources: data,
    opportunities,
  };
};