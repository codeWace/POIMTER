export function classifyPlace(place: any) {
  if (!place) return "Unknown";

  const p = String(place).toLowerCase();

  if (p.includes("continent")) return "Continent";
  if (p.includes("city")) return "City";
  if (p.includes("town")) return "Town";
  if (p.includes("district") || p.includes("region")) return "Region";
  if (p.includes("country")) return "Country";

  return "Location";
}