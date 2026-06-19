export function cleanSignal(values: number[]) {
  if (!values.length) return 0;

  // 1. remove extreme spikes (noise filter)
  const sorted = [...values].sort((a, b) => a - b);

  const trim = Math.floor(sorted.length * 0.15); // remove top/bottom 15%

  const trimmed = sorted.slice(trim, sorted.length - trim);

  // 2. weighted smoothing (recent values matter more)
  let weightedSum = 0;
  let weightTotal = 0;

  trimmed.forEach((v, i) => {
    const weight = i + 1;
    weightedSum += v * weight;
    weightTotal += weight;
  });

  return weightedSum / weightTotal;
}