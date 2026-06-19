export type SignalPoint = {
  id: string;
  lat: number;
  lng: number;
  value: number; // 0–100 intensity
  timestamp: number;
  category?: string;
};

export type HeatPoint = {
  lat: number;
  lng: number;
  intensity: number; // 0–100 normalized
};