export function dataQualityScore(raw: any) {
  let score = 100;

  if (!raw?.searchVolume) score -= 30;

  if (!raw?.regionMentions) score -= 20;

  if (
    Array.isArray(raw?.searchVolume) &&
    raw.searchVolume.length < 3
  ) {
    score -= 20;
  }

  return Math.max(0, score);
}