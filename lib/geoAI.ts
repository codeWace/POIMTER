export function generateSubRegions(lat: number, lng: number, score: number) {
  const density = Math.max(3, Math.floor(score / 20));

  return Array.from({ length: density }).map((_, i) => ({
    id: `sub-${lat}-${lng}-${i}`,
    lat: lat + (Math.random() - 0.5) * 0.5,
    lng: lng + (Math.random() - 0.5) * 0.5,
    demandScore: score * (0.6 + Math.random() * 0.4),
  }));
}