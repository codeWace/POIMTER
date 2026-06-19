export function getDistance(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const dx = a.lat - b.lat;
  const dy = a.lng - b.lng;
  return Math.sqrt(dx * dx + dy * dy);
}

export function timeDecay(timestamp: number) {
  const now = Date.now();
  const diffHours = (now - timestamp) / (1000 * 60 * 60);

  return Math.exp(-0.1 * diffHours);
}