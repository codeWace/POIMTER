type State = {
  history: number[];
};

const memory: Record<string, State> = {};

export function computeMarketForecast(
  country: string,
  signal: { demand: number; sentiment: number; supply: number }
) {
  if (!memory[country]) {
    memory[country] = { history: [] };
  }

  const h = memory[country].history;

  const pressure =
    signal.demand * 0.6 +
    signal.sentiment * 0.2 -
    signal.supply * 0.2;

  h.push(pressure);
  if (h.length > 6) h.shift();

  const current = h[h.length - 1] || pressure;
  const prev = h[h.length - 2] || current;
  const prev2 = h[h.length - 3] || prev;

  const velocity = current - prev;
  const acceleration = (current - prev) - (prev - prev2);

  const forecast = current + velocity * 1.5 + acceleration;

  return {
    current,
    velocity,
    acceleration,
    forecast
  };
}