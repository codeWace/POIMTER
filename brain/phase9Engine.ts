export type Metrics = Record<string, number>;

export type NodeActionState = Record<string, string[]>;
export type SwarmSignalState = Record<string, string[]>;

export function generateNodeActions(metrics: Metrics, prev: NodeActionState) {
  const updated: NodeActionState = { ...prev };

  Object.keys(metrics).forEach((id) => {
    const m = metrics[id];

    const action =
      m > 80
        ? `${id}: escalate`
        : m < 35
        ? `${id}: reinforce`
        : `${id}: steady`;

    updated[id] = [...(updated[id] || []).slice(-10), action];
  });

  return updated;
}

export function generateSwarmSignals(metrics: Metrics, prev: SwarmSignalState) {
  const updated: SwarmSignalState = { ...prev };

  ["search", "map", "report"].forEach((id) => {
    const m = metrics[id];

    const msg =
      m > 70
        ? `${id}: high swarm load`
        : m < 40
        ? `${id}: requesting support`
        : `${id}: stable flow`;

    updated[id] = [...(updated[id] || []).slice(-10), msg];
  });

  return updated;
}