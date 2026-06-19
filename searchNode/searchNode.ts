// poimter/searchNode/searchNode.ts

import {
  getInternalContext,
  addInternalSignal,
} from "./internalContext";

import { fetchMarketSignals } from "@/brain/dataLayer/fetchMarketSignals";
import { normalizeSignals } from "@/brain/dataLayer/normalizeSignals";

import { SearchBundle } from "../types/searchNode.types";

export type SearchRequest = {
  product: string;
  query?: string;
};

export async function runSearchNode(
  req: SearchRequest
): Promise<SearchBundle> {

  const key = req.product.toLowerCase().trim();

  // REAL MARKET DATA
  const raw = await fetchMarketSignals(req.query || req.product);

await new Promise((r) => setTimeout(r, 0));

const internal = getInternalContext(key);

  console.log("INTERNAL AFTER ADD:", internal);

  const external = normalizeSignals(raw, req.product);

  const cleanedInternal = internal.map((item) => ({
    ...item,
    notes: item.notes?.trim(),
  }));

  return {
    product: req.product,

    internal: cleanedInternal,

    external: external.opportunities.map((o, i) => ({
      id: `ext-${i}`,
      source: "market",
      title: o.title,
      content: o.title,
      mentions: external.searchVolume[i] || 0,
      timestamp: Date.now(),
    })),
  };
}