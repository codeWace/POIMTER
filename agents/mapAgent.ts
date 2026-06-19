import { resolveLocation } from "@/lib/locationResolver";

export const runMapAgent = async (mapSignals: any[]) => {
  const geoNodes = await Promise.all(
    mapSignals.map(async (s, i) => {
      const coords = await resolveLocation(s.label ?? "Global");

      return {
        id: s.id ?? `node-${i}`,
        name: s.label ?? "Unknown",
        lat: s.lat ?? coords.lat,
        lng: s.lng ?? coords.lng,
        demandScore: s.value ?? 0,
        drivers: s.drivers ?? [],
      };
    })
  );

  return geoNodes;
};