import { PoimterState, initialPoimterState } from "@/app/dashboard/poimterState";

/* ---------------- STATE ---------------- */

let state: PoimterState = {
  ...initialPoimterState,

  companyContext: {
    description: "",
    products: [],
    markets: [],
    goals: [],
    constraints: [],
    queryHistory: [],
  },
};

const listeners = new Set<(s: PoimterState) => void>();

/* ---------------- STORE ---------------- */

export const brainStore = {
  getState: () => state,

  setState: (newState: Partial<PoimterState>) => {
    state = {
      ...state,
      ...Object.fromEntries(
        Object.entries(newState).filter(([_, v]) => v !== undefined)
      ),
    };

    listeners.forEach((l) => l(state));
  },

  subscribe: (listener: (s: PoimterState) => void) => {
    listeners.add(listener);
    listener(state);

    return () => listeners.delete(listener);
  },
};

/* OPTIONAL HELPER */
export const updateAgent = (id: string, patch: any) => {
  const state = brainStore.getState();

  brainStore.setState({
    agents: {
      ...state.agents,
      [id]: {
        ...state.agents[id],
        ...patch,
      },
    },
  });
};

export const createDefaultAgent = (id: string) => ({
  id,
  status: "idle",
  lastAction: {
    type: "none",
    timestamp: Date.now(),
    confidence: 0,
  },
  memory: {
    shortTerm: [],
    longTerm: [],
  },
  health: {
    active: false,
    lastHeartbeat: Date.now(),
  },
  signal: 50,
  lastActionText: "initialized",
});

