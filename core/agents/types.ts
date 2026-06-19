export type AgentId = "search" | "map" | "report";

export type AgentState = {
  id: AgentId;
  energy: number;
  memory: string[];
  lastAction: string;
  signal: number;
};