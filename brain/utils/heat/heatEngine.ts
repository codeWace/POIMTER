import { SignalPoint, HeatPoint } from "./types";
import { getDistance, timeDecay } from "./utils";

export function buildHeatField(
  signals: SignalPoint[],
  gridPoints: { lat: number; lng: number }[],
  radius = 0.5
): HeatPoint[] {
  const heatField: HeatPoint[] = [];

  for (const cell of gridPoints) {
    let intensity = 0;

    for (const signal of signals) {
      const d = getDistance(cell, signal);

      const spatialWeight = Math.max(0, 1 - d / radius);
      const temporalWeight = timeDecay(signal.timestamp);

      intensity += signal.value * spatialWeight * temporalWeight;
    }

    heatField.push({
      lat: cell.lat,
      lng: cell.lng,
      intensity,
    });
  }

  return normalizeHeat(heatField);
}

// normalize to 0–100
function normalizeHeat(field: HeatPoint[]): HeatPoint[] {
  const max = Math.max(...field.map((f) => f.intensity), 1);

  return field.map((f) => ({
    ...f,
    intensity: (f.intensity / max) * 100,
  }));
}