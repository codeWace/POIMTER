export function geoResolver(location: string | null) {
  if (!location) {
    return {
      type: "global",
      continent: "global",
      country: "global",
      region: "global_cluster",
      zoom: 2,
      lat: 20,
      lng: 0,
      label: "Global",
    };
  }

  const loc = location.toLowerCase();

  // -------------------------
  // CONTINENT DETECTION (SAFE)
  // -------------------------
  let continent = "unknown";

  const africa = ["nigeria", "egypt", "kenya", "africa"];
  const europe = ["germany", "france", "uk", "russia", "europe", "italy", "spain"];
  const americas = ["usa", "canada", "brazil", "mexico", "america"];
  const asia = ["india", "china", "pakistan", "japan", "asia"];

  if (africa.some(v => loc.includes(v))) continent = "africa";
  else if (europe.some(v => loc.includes(v))) continent = "europe";
  else if (americas.some(v => loc.includes(v))) continent = "americas";
  else if (asia.some(v => loc.includes(v))) continent = "asia";

  // -------------------------
  // TYPE DETECTION
  // -------------------------
  const isCity = loc.includes("city") || loc.includes("town");

  const type =
    isCity ? "city" :
    continent !== "unknown" ? "country" :
    "region";

    const COUNTRY_MAP: Record<string, string> = {
  karachi: "pakistan",
  lahore: "pakistan",
  islamabad: "pakistan",
  pakistan: "pakistan",
  usa: "united states",
  america: "united states",
  india: "india",
  china: "china"
};

const normalizedCountry =
  COUNTRY_MAP[loc] || "unknown";

  // -------------------------
  // SAFE ZOOM SYSTEM (FIX RUSSIA ISSUE)
  // -------------------------
  let zoom = 2;
  let lat = 20;
  let lng = 0;

  if (continent === "africa") {
    lat = 1; lng = 20; zoom = 3;
  }

  if (continent === "europe") {
    lat = 54; lng = 15; zoom = 3.5;
  }

  if (continent === "asia") {
    lat = 30; lng = 100; zoom = 3;
  }

  if (continent === "americas") {
    lat = 20; lng = -90; zoom = 3;
  }

  if (type === "city") zoom = 8;

  return {
  type,
  continent,
  country: normalizedCountry,
  rawLocation: location,
  region: `${continent}_cluster`,
  zoom,
  label: location
};
}