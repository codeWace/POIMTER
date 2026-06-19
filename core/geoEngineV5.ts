export type GeoNode = {
  id: string;
  name: string;
  lat: number;
  lng: number;

  demand: number;      // main signal
  momentum: number;    // movement force
  memory: number;      // historical pressure

  drivers: string[];
};

export type GeoState = {
  nodes: GeoNode[];
  tick: number;
};

export function evolveGeoState(prev: GeoState): GeoState {
  const nextTick = prev.tick + 1;

  const nodes = prev.nodes.map((n) => {
    /* -----------------------------
       1. MEMORY DECAY (FORGETTING)
    ------------------------------*/
    const decay = n.memory * 0.97;

    /* -----------------------------
       2. MOMENTUM (CONTINUITY)
    ------------------------------*/
    const momentum =
      n.momentum * 0.85 +
      (n.demand - n.memory) * 0.1;

    /* -----------------------------
       3. GRAVITY (GLOBAL PRESSURE)
    ------------------------------*/
    const globalPressure =
      prev.nodes.reduce((sum, x) => sum + x.demand, 0) /
      Math.max(prev.nodes.length, 1);

    const gravity = (n.demand - globalPressure) * 0.02;

    /* -----------------------------
       4. FINAL DEMAND EVOLUTION
    ------------------------------*/
    const demand =
      n.demand +
      momentum +
      gravity;

    return {
      ...n,
      memory: decay,
      momentum,
      demand: clamp(demand),
    };
  });

  /* -----------------------------
     5. CROSS-REGION FLOW
     (high demand bleeds into low)
  ------------------------------*/
  const sorted = [...nodes].sort((a, b) => b.demand - a.demand);

  const top = sorted.slice(0, 2);
  const bottom = sorted.slice(-2);

  bottom.forEach((b, i) => {
    const t = top[i % top.length];
    t.demand -= 0.5;
    b.demand += 0.5;
  });

  return {
    nodes,
    tick: nextTick,
  };
}

function clamp(v: number) {
  return Math.max(0, Math.min(100, v));
}