import { SignalPoint } from "../heat/types";

export const mockSignals: SignalPoint[] = [
  {
    id: "1",
    lat: 33.6844,
    lng: 73.0479,
    value: 80,
    timestamp: Date.now() - 1000 * 60 * 10,
  },
  {
    id: "2",
    lat: 33.7000,
    lng: 73.0500,
    value: 60,
    timestamp: Date.now() - 1000 * 60 * 30,
  },
  {
    id: "3",
    lat: 33.6600,
    lng: 73.0200,
    value: 90,
    timestamp: Date.now() - 1000 * 60 * 5,
  },
];