import { runSearchToReport } from "@/searchNode/searchNodeAdapter";
import { runIntelligenceLoop } from "@/brain/runIntelligenceLoop";
import { brainStore } from "@/core/brainStore";

let debounceTimer: any = null;

export const triggerIntelligence = (input: string) => {
  brainStore.setState({ query: input });

  // prevent spam
  if (debounceTimer) clearTimeout(debounceTimer);

  debounceTimer = setTimeout(async () => {
    if (!input || input.trim().length < 2) return;

    // 🔥 SINGLE ENTRY POINT DECISION
    const isProductQuery = input.toLowerCase().includes("product");

    if (isProductQuery) {
      await runSearchToReport(input);
    } else {
      await runIntelligenceLoop(input);
    }
  }, 500);
};