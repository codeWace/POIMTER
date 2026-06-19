export function buildFeatures(result: any, country: string) {
  const search = result?.searchVolume ?? [40, 50, 60];

  const avg =
    search.reduce((a: number, b: number) => a + b, 0) /
    search.length;

  const demandScore = Math.round(avg);

  const volatility =
    Math.max(...search) - Math.min(...search);

  return {
    demandScore,
    volatility,
    regions: result?.regionMentions ?? { [country]: demandScore },
    raw: result,
  };
}