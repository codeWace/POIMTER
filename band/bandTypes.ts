export type BandRole = "coordinator" | "search" | "map" | "report";

export type BandMessage = {
  id: string;
  roomId: string;
  from: BandRole;
  to?: BandRole;
  type: "task" | "signal" | "result" | "decision";
  content: any;
  timestamp: number;
};