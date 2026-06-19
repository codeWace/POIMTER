export type Opportunity = {
  title: string;
  confidence: number;
};

export type AgentState = {
  id: string;
  energy: number;
  memory: string[];
  lastAction: string;
  signal: number;
};

export type ActiveSession = {
  query: string;
  mapInsight: any;
  report: any;
  status: "idle" | "processing" | "ready";
};

export type InternalDataItem = {
  id: string;
  product: string;
  score: number;
  confidence: number;
  notes?: string;
  finalNarrative?: string;
  createdAt: number;
  savedToReport: boolean;
};

export type ReportTraceItem = {
  id: string;
  sourceInternalIds: string[];
  product: string;
  score: number;
  confidence: number;
  notes?: string;
  finalNarrative?: string;
  createdAt: number;
};

export type PoimterState = {
  query: string;

  internalData: InternalDataItem[];

  reportData: ReportTraceItem[];

  externalData: any[];

  opportunities: Opportunity[];

  activeSession?: {
    query: string;
    country?: string;
    demandScore?: number;
    drivers?: string[];
    insight: {
      summary: string;
      explanation: string;
    };
    opportunities?: string[];
    status?: "running" | "ready";
  };

  marketSignal?: any;
  articles?: any[]

  mapSignals: any[];
  swarmMemory: any[];

  countryHeat: any[];
  geoNodes: any[];

  selectedLocation?: string;
  selectedProduct?: string;

  globePoints?: any[];

  agents: Record<string, AgentState>;
};

export const initialPoimterState: PoimterState = {
  query: "",

  internalData: [],

  reportData: [],

  externalData: [],
  articles: [],

  opportunities: [],
  marketSignal: null,
  

  activeSession: {
    query: "",
    country: "",
    demandScore: 0,
    drivers: [],
    insight: {
      summary: "",
      explanation: "",
    },
    opportunities: [],
    status: "running",
  },

  mapSignals: [],
  swarmMemory: [],

  countryHeat: [],
  geoNodes: [],

  selectedLocation: "",
  selectedProduct: "",

  globePoints: [],

  agents: {
    search: {
      id: "search",
      energy: 100,
      memory: [],
      lastAction: "",
      signal: 50,
    },
    map: {
      id: "map",
      energy: 100,
      memory: [],
      lastAction: "",
      signal: 50,
    },
    report: {
      id: "report",
      energy: 100,
      memory: [],
      lastAction: "",
      signal: 50,
    },
  },
};