export type GeoNode = {
  id: string;
  name: string;
  lat: number;
  lng: number;
  demandScore: number;
  drivers: string[];
  insight: {
  summary: string;
  explanation: string;
};
};

export type GeoState = {
  nodes: GeoNode[];
  tick: number;
};

export function evolveGeoState(prev: GeoState): GeoState {
  const nextTick = prev.tick + 1;

  const evolvedNodes = prev.nodes.map((n) => {
    // smooth stability (no randomness)
    const pressure = n.demandScore * 0.98 + Math.sin(nextTick / 10) * 0.5;

    return {
      ...n,
      demandScore: Math.max(0, Math.min(100, pressure)),
    };
  });

  return {
    nodes: evolvedNodes,
    tick: nextTick,
  };
}