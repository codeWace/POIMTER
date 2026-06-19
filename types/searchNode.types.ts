// poimter/type/searchNode.types.ts

export type InternalSignal = {
  id: string;
  product: string;

  stage: "idea" | "prototype" | "launch";

  score?: number;
  confidence?: number;
  notes?: string;
  timestamp: number;

  // ADD THESE (NEW)
  savedToReport?: boolean;
  edited?: boolean;
  aiRead?: boolean;
};

export type ExternalSignal = {
  id: string;
  source: "social" | "market" | "news";
  title: string;
  content: string;
  sentiment?: "positive" | "neutral" | "negative";
  mentions?: number;
  timestamp: number;
};

export type SearchBundle = {
  product: string;
  internal: InternalSignal[];
  external: ExternalSignal[];
};