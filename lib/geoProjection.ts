export function projectGeo(lat: number, lng: number, width: number, height: number) {
  // simple equirectangular projection
  const x = (lng + 180) * (width / 360);
  const y = (90 - lat) * (height / 180);

  return { x, y };
}