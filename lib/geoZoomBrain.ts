type ZoomTier = "continent" | "country" | "city" | "local";
type GeoInput = { location?: string; query?: string; };

function detectTier(text: string = ""): ZoomTier {
  const t = text.toLowerCase();
  const continents = ["asia", "europe", "africa", "australia", "north america", "south america", "global", "world", "anywhere"];
  if (continents.some(c => t.includes(c))) return "continent";
  const countries = ["pakistan", "india", "germany", "usa", "united states", "america", "texas", "california", "china", "uk", "united kingdom", "england", "france", "italy", "turkey", "uae", "dubai", "australia", "japan", "brazil", "canada", "nigeria", "kenya", "south africa"];
  if (countries.some(c => t.includes(c))) return "country";
  const cities = ["karachi", "lahore", "mumbai", "delhi", "new york", "london", "berlin", "paris", "tokyo"];
  if (cities.some(c => t.includes(c))) return "city";
  return "local";
}

function zoomForTier(tier: ZoomTier) {
  switch (tier) {
    case "continent": return 2;
    case "country": return 5;
    case "city": return 10;
    case "local": return 13;
  }
}

export function geoZoomBrain(input: GeoInput) {
  const text = `${input.location ?? ""} ${input.query ?? ""}`;
  const tier = detectTier(text);
  const zoom = zoomForTier(tier);
  return { tier, zoom };
}
