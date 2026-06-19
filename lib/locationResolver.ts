import { geocodeLocation } from "./geocode";
import { geoZoomBrain } from "./geoZoomBrain";

const cache = new Map<string, any>();

export async function resolveLocation(input: string) {
  const key = input.toLowerCase().trim();

  if (cache.has(key)) return cache.get(key);

  const geo = await geocodeLocation(key);

  // 🧠 APPLY ZOOM BRAIN HERE
  const brain = geoZoomBrain({ location: key });

  const result = {
    lat: geo?.lat ?? 20,
    lng: geo?.lng ?? 0,

    // 🚨 IMPORTANT FIX
    zoom: brain.zoom,

    label: geo?.displayName ?? "World",
  };

  cache.set(key, result);
  return result;
}