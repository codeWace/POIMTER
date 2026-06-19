type GeoCluster = {
  name: string;
  region: string;
  country?: string;
  score: number;
  type: "country" | "city" | "region" | "unknown";
  lat: number;
  lng: number;
  hotspots?: any[];
};

const COUNTRY_MAP: Record<string, GeoCluster> = {
  usa: { name: "United States", region: "americas_cluster", score: 0.72, type: "country", lat: 37.09, lng: -95.71 },
  america: { name: "United States", region: "americas_cluster", score: 0.72, type: "country", lat: 37.09, lng: -95.71 },
  "united states": { name: "United States", region: "americas_cluster", score: 0.72, type: "country", lat: 37.09, lng: -95.71 },
  texas: { name: "United States", region: "americas_cluster", score: 0.72, type: "country", lat: 37.09, lng: -95.71 },
  california: { name: "United States", region: "americas_cluster", score: 0.72, type: "country", lat: 37.09, lng: -95.71 },
  canada: { name: "Canada", region: "americas_cluster", score: 0.68, type: "country", lat: 56.13, lng: -106.34 },
  mexico: { name: "Mexico", region: "americas_cluster", score: 0.65, type: "country", lat: 23.63, lng: -102.55 },
  uk: { name: "United Kingdom", region: "europe_cluster", score: 0.7, type: "country", lat: 55.37, lng: -3.43 },
  england: { name: "United Kingdom", region: "europe_cluster", score: 0.7, type: "country", lat: 55.37, lng: -3.43 },
  "united kingdom": { name: "United Kingdom", region: "europe_cluster", score: 0.7, type: "country", lat: 55.37, lng: -3.43 },
  germany: { name: "Germany", region: "europe_cluster", score: 0.72, type: "country", lat: 51.16, lng: 10.45 },
  france: { name: "France", region: "europe_cluster", score: 0.7, type: "country", lat: 46.22, lng: 2.21 },
  italy: { name: "Italy", region: "europe_cluster", score: 0.68, type: "country", lat: 41.87, lng: 12.56 },
  spain: { name: "Spain", region: "europe_cluster", score: 0.67, type: "country", lat: 40.46, lng: -3.74 },
  india: { name: "India", region: "asia_cluster", score: 0.78, type: "country", lat: 20.59, lng: 78.96 },
  china: { name: "China", region: "asia_cluster", score: 0.8, type: "country", lat: 35.86, lng: 104.19 },
  pakistan: { name: "Pakistan", region: "asia_cluster", score: 0.7, type: "country", lat: 30.37, lng: 69.34 },
  bangladesh: { name: "Bangladesh", region: "asia_cluster", score: 0.65, type: "country", lat: 23.68, lng: 90.35 },
  japan: { name: "Japan", region: "asia_cluster", score: 0.75, type: "country", lat: 36.20, lng: 138.25 },
  "south korea": { name: "South Korea", region: "asia_cluster", score: 0.73, type: "country", lat: 35.90, lng: 127.76 },
  australia: { name: "Australia", region: "oceania_cluster", score: 0.71, type: "country", lat: -25.27, lng: 133.77 },
  "new zealand": { name: "New Zealand", region: "oceania_cluster", score: 0.65, type: "country", lat: -40.90, lng: 174.88 },
  brazil: { name: "Brazil", region: "americas_cluster", score: 0.68, type: "country", lat: -14.23, lng: -51.92 },
  uae: { name: "UAE", region: "middle_east_cluster", score: 0.73, type: "country", lat: 23.42, lng: 53.84 },
  "saudi arabia": { name: "Saudi Arabia", region: "middle_east_cluster", score: 0.7, type: "country", lat: 23.88, lng: 45.07 },
  nigeria: { name: "Nigeria", region: "africa_cluster", score: 0.63, type: "country", lat: 9.08, lng: 8.67 },
  kenya: { name: "Kenya", region: "africa_cluster", score: 0.61, type: "country", lat: -0.02, lng: 37.90 },
  "south africa": { name: "South Africa", region: "africa_cluster", score: 0.64, type: "country", lat: -30.55, lng: 22.93 },
};

export function inferGeoCluster(location: string | null): GeoCluster {
  if (!location) {
    return { name: "Global", region: "global", score: 0.5, type: "unknown", lat: 0, lng: 0 };
  }

  const loc = location.toLowerCase().trim();

  // check global/anywhere intent
  if (["world","global","anywhere","everywhere","international"].some(w => loc.includes(w))) {
    return { name: "Global", region: "global", score: 0.65, type: "region", lat: 0, lng: 0 };
  }

  // exact and partial country match
  for (const [key, cluster] of Object.entries(COUNTRY_MAP)) {
    if (loc.includes(key)) return cluster;
  }

  // region fallback
  if (["asia","southeast asia","east asia"].some(w => loc.includes(w))) {
    return { name: "Asia", region: "asia_cluster", score: 0.7, type: "region", lat: 34.04, lng: 100.61 };
  }
  if (["europe","eu","european"].some(w => loc.includes(w))) {
    return { name: "Europe", region: "europe_cluster", score: 0.68, type: "region", lat: 54.52, lng: 15.25 };
  }
  if (["africa"].some(w => loc.includes(w))) {
    return { name: "Africa", region: "africa_cluster", score: 0.6, type: "region", lat: -8.78, lng: 34.50 };
  }
  if (["middle east","gulf"].some(w => loc.includes(w))) {
    return { name: "Middle East", region: "middle_east_cluster", score: 0.65, type: "region", lat: 29.31, lng: 42.45 };
  }
  if (["latin america","south america"].some(w => loc.includes(w))) {
    return { name: "Latin America", region: "americas_cluster", score: 0.62, type: "region", lat: -8.78, lng: -55.49 };
  }

  // generic city fallback
  return { name: location, region: "local_cluster", score: 0.6, type: "city", lat: 0, lng: 0 };
}