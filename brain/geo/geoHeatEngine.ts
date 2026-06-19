type HeatNode = {
  region: string;
  demand: number;
  momentum: number;
  lat: number;
  lng: number;
  label: string;
};

const REGION_COORDS: Record<string, { lat: number; lng: number; label: string }> = {
  americas_cluster:    { lat: 37.09,  lng: -95.71, label: "Americas" },
  europe_cluster:      { lat: 54.52,  lng: 15.25,  label: "Europe" },
  asia_cluster:        { lat: 34.04,  lng: 100.61, label: "Asia" },
  middle_east_cluster: { lat: 29.31,  lng: 42.45,  label: "Middle East" },
  africa_cluster:      { lat: -8.78,  lng: 34.50,  label: "Africa" },
  oceania_cluster:     { lat: -25.27, lng: 133.77, label: "Oceania" },
  global:              { lat: 20,     lng: 0,       label: "Global" },
};

const heatMemory: Record<string, HeatNode> = {};

export const getHeatMemory = () => heatMemory;

function getNearbyRegions(region: string): string[] {
  const map: Record<string, string[]> = {
    asia_cluster:        ["europe_cluster", "middle_east_cluster"],
    europe_cluster:      ["asia_cluster", "americas_cluster"],
    americas_cluster:    ["europe_cluster"],
    middle_east_cluster: ["asia_cluster", "africa_cluster"],
    africa_cluster:      ["middle_east_cluster", "europe_cluster"],
    oceania_cluster:     ["asia_cluster"],
  };
  return map[region] || [];
}

export function updateGeoHeat(cluster: any, demand: number) {
  const key = cluster?.region || "global";
  const coords = REGION_COORDS[key] ?? REGION_COORDS["global"];

  const prev = heatMemory[key] ?? {
    region: key,
    demand: 0.5,
    momentum: 0,
    lat: coords.lat,
    lng: coords.lng,
    label: coords.label,
  };

  const updatedDemand = prev.demand * 0.7 + demand * 0.3;
  const momentum = updatedDemand - prev.demand;

  heatMemory[key] = {
    region: key,
    demand: updatedDemand,
    momentum,
    lat: cluster?.lat ?? coords.lat,
    lng: cluster?.lng ?? coords.lng,
    label: cluster?.name ?? coords.label,
  };

  // spillover to nearby regions
  getNearbyRegions(key).forEach((r) => {
    const rc = REGION_COORDS[r] ?? REGION_COORDS["global"];
    if (!heatMemory[r]) {
      heatMemory[r] = {
        region: r,
        demand: 0.4,
        momentum: 0,
        lat: rc.lat,
        lng: rc.lng,
        label: rc.label,
      };
    }
    heatMemory[r].demand += updatedDemand * 0.1;
  });

  return heatMemory[key];
}